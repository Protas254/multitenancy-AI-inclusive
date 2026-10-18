/**
 * StockGrid Web Push Notification Service
 * Handles native browser pop-ups, PWA Service Worker push, and vibration on Android/iOS/Desktop.
 */

export interface PushAlertPayload {
  id?: string;
  title: string;
  message: string;
  url?: string;
  tag?: string;
}

export const isNotificationSupported = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const getNotificationPermission = (): NotificationPermission | "unsupported" => {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    throw new Error("Notifications are not supported by this browser.");
  }
  const permission = await Notification.requestPermission();
  localStorage.setItem("stockgrid_push_permission", permission);
  localStorage.setItem("stockgrid_push_prompted", "true");

  if (permission === "granted") {
    await registerServiceWorkerPush();
  }
  return permission;
};

export const registerServiceWorkerPush = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw-push.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.warn("[Push Service] Service worker push registration notice:", err);
    return null;
  }
};

export const showPushAlert = async (payload: PushAlertPayload): Promise<boolean> => {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const { title, message, url = "/notifications", tag = "stockgrid-alert" } = payload;

  try {
    // 1. Try displaying via Service Worker registration (handles lockscreen and background on mobile)
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "showNotification" in reg) {
        await (reg as any).showNotification(title, {
          body: message,
          icon: "/stockgrid-logo.png",
          badge: "/stockgrid-logo.png",
          vibrate: [200, 100, 200, 100, 200],
          tag,
          renotify: true,
          data: { url },
        });
        return true;
      }
    }

    // 2. Fallback to Window Notification API
    const notification = new Notification(title, {
      body: message,
      icon: "/stockgrid-logo.png",
      tag,
    });

    notification.onclick = function (e) {
      e.preventDefault();
      window.focus();
      window.location.href = url;
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn("[Push Service] Failed to display notification:", err);
    return false;
  }
};

/**
 * Checks for new unread notifications and pops them up on screen with sound/vibration
 */
export const checkAndDispatchNewAlerts = async (
  notifications: Array<{ id: string; title: string; message: string; type: string; isRead: boolean }>
): Promise<void> => {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }

  const storedNotified = JSON.parse(localStorage.getItem("stockgrid_notified_alert_ids") || "[]");
  const unreadAlerts = notifications.filter((n) => !n.isRead && !storedNotified.includes(n.id));

  if (unreadAlerts.length === 0) return;

  const newIds: string[] = [];
  for (const alert of unreadAlerts) {
    let targetUrl = "/notifications";
    if (alert.type === "low_stock") targetUrl = "/inventory";
    if (alert.type === "reconciliation") targetUrl = "/reports";
    if (alert.type === "target_achieved") targetUrl = "/targets";

    await showPushAlert({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      url: targetUrl,
      tag: `alert-${alert.id}`,
    });

    newIds.push(alert.id);
  }

  localStorage.setItem(
    "stockgrid_notified_alert_ids",
    JSON.stringify([...storedNotified, ...newIds].slice(-100))
  );
};
