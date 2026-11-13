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

  if (typeof window === "undefined" || isInitialized) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());

  if (gaId) {
    // If a GA4 G- ID is also provided alongside GTM, configure it
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.gtag("config", gaId, {
      send_page_view: false,
    });
    console.log(`[Analytics] Initialized GA4 with ID: ${gaId}`);
  }

  isInitialized = true;
}

/**
 * Log page view on SPA route navigation.
 * Pushes to dataLayer for GTM triggers and invokes gtag if configured.
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const pageTitle = title || document.title;

  // Push to GTM dataLayer for Single Page Application pageview trigger
  if (window.dataLayer) {
    window.dataLayer.push({
      event: "page_view",
      page_path: url,
      page_title: pageTitle,
      page_location: window.location.href,
    });
  }

  const gaId =
    (import.meta as any).env?.VITE_GA_MEASUREMENT_ID ||
    (import.meta as any).env?.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (gaId && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: url,
      page_title: pageTitle,
      send_to: gaId,
    });
  }
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
