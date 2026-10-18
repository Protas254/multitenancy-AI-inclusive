// StockGrid Web Push Notification Worker
self.addEventListener("push", function (event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "StockGrid Notification", message: event.data.text() };
    }
  }

  const title = data.title || "StockGrid Retail Alert";
  const options = {
    body: data.message || data.body || "New business update from StockGrid.",
    icon: "/stockgrid-logo.png",
    badge: "/stockgrid-logo.png",
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || "/notifications",
      id: data.id,
      timestamp: Date.now(),
    },
    actions: [
      { action: "view", title: "View Details" },
      { action: "dismiss", title: "Dismiss" },
    ],
    tag: data.tag || "stockgrid-alert",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || "/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
