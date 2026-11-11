/**
 * Google Analytics 4 (GA4) integration and route view tracker for StoreGrid.
 * Reads Measurement ID from VITE_GA_MEASUREMENT_ID environment variable.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let isInitialized = false;

export function initGoogleAnalytics(measurementId?: string) {
  const gaId =
    measurementId ||
    (import.meta as any).env?.VITE_GA_MEASUREMENT_ID ||
    (import.meta as any).env?.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId || typeof window === "undefined" || isInitialized) {
    return;
  }

  // Load gtag script dynamically
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", gaId, {
    send_page_view: false, // Page views handled via React Router listener
  });

  isInitialized = true;
  console.log(`[Analytics] Initialized GA4 with ID: ${gaId}`);
}

/**
 * Log page view on SPA route navigation.
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  const gaId =
    (import.meta as any).env?.VITE_GA_MEASUREMENT_ID ||
    (import.meta as any).env?.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) return;

  window.gtag("event", "page_view", {
    page_path: url,
    page_title: title || document.title,
    send_to: gaId,
  });
}

/**
 * Track custom user actions (e.g., trial signups, contact submissions, demo requests).
 */
export function trackCustomEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}
