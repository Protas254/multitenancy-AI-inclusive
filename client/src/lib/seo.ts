/**
 * Centralized SEO & Structured Data Configuration for StockGrid.
 */

export const SEO_CONFIG = {
  siteName: "StockGrid",
  siteTitleDefault: "StockGrid | Retail Business Platform & Cloud POS",
  siteTitleTemplate: "%s | StockGrid",
  siteDescriptionDefault:
    "Complete daily business management platform for modern retail stores and multi-branch chains. Streamline POS checkout, real-time inventory, customer credit, M-Pesa verification, staff payroll, and financial reports.",
  siteKeywordsDefault:
    "StockGrid, POS, Point of Sale, Retail Cloud, Inventory Management, Multi-Tenant SaaS, M-Pesa POS, Cash Reconciliation, Debt Ledger, Kenya SME Software, Retail ERP",
  defaultOgImage: "/og-image.png",
  twitterHandle: "@stockgrid",
  themeColor: "#2563eb",
  productionDomain: "https://stockgrid.africa",
};

/**
 * Returns the base canonical URL for the application.
 * Respects VITE_SITE_URL and NEXT_PUBLIC_SITE_URL environment variables,
 * falls back to browser origin when available, or canonical production domain.
 */
export function getSiteUrl(): string {
  const envUrl =
    (import.meta as any).env?.VITE_SITE_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_SITE_URL;

  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return SEO_CONFIG.productionDomain;
}

/**
 * Returns an absolute canonical URL for a given pathname.
 */
export function getCanonicalUrl(path: string = "/"): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") {
    return baseUrl;
  }
  return `${baseUrl}${cleanPath.replace(/\/+$/, "")}`;
}

/**
 * Generates Schema.org Organization structured data.
 */
export function getOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StockGrid",
    url: siteUrl,
    logo: `${siteUrl}/stockgrid-logo.png`,
    description: SEO_CONFIG.siteDescriptionDefault,
    sameAs: [
      "https://twitter.com/stockgrid",
      "https://www.linkedin.com/company/stockgrid",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+254743849304",
        email: "stockgridke@gmail.com",
        contactType: "customer service",
        areaServed: ["KE", "UG", "TZ", "RW"],
        availableLanguage: ["English", "Swahili"],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
          ],
          opens: "00:00",
          closes: "23:59"
        }
      },
    ],
  };
}

/**
 * Generates Schema.org WebSite structured data.
 */
export function getWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "StockGrid",
    url: siteUrl,
    description: SEO_CONFIG.siteDescriptionDefault,
    publisher: {
      "@type": "Organization",
      name: "StockGrid",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/stockgrid-logo.png`,
      },
    },
  };
}

/**
 * Generates Schema.org SoftwareApplication structured data for the SaaS platform.
 */
export function getSoftwareApplicationSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "StockGrid Retail Business Platform",
    operatingSystem: "Web Browser, iOS, Android, Windows, macOS",
    applicationCategory: "BusinessApplication",
    offers: [
      {
        "@type": "Offer",
        name: "Starter Retail",
        price: "1000",
        priceCurrency: "KES",
        description: "Perfect for single-shop retailers and sole proprietors starting out.",
      },
      {
        "@type": "Offer",
        name: "Growth Pro",
        price: "2000",
        priceCurrency: "KES",
        description: "Ideal for growing retail stores, supermarkets, and boutiques requiring staff control.",
      },
      {
        "@type": "Offer",
        name: "Enterprise Chain",
        price: "3000",
        priceCurrency: "KES",
        description: "For retail chains, supermarkets, franchises, and central warehouse operations.",
      },
    ],
    featureList: [
      "Fast Touch & Barcode Point of Sale (POS)",
      "Instant M-Pesa & Cash Reconciliations",
      "Multi-Branch Real-Time Inventory Control",
      "Customer CRM, Debt Ledger, and Loyalty Points",
      "Automated Staff Payroll & Sales Commissions",
      "Gross Margin & Net Profit Financial Analytics",
      "Strict Multi-Tenant Quarantined Architecture",
    ],
    url: siteUrl,
    screenshot: `${siteUrl}/hero-bg.jpg`,
  };
}

/**
 * Generates Schema.org BreadcrumbList structured data.
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}
