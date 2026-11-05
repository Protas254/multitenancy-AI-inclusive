/**
 * Centralized SEO & Structured Data Configuration for StoreGrid.
 */

export const SEO_CONFIG = {
  siteName: "StoreGrid",
  siteTitleDefault: "StoreGrid – Business Management Software for SMEs in Kenya",
  siteTitleTemplate: "%s | StoreGrid",
  siteDescriptionDefault:
    "StoreGrid helps small and growing businesses in Kenya manage sales, POS checkout, real-time stock, expenses, customer credit debts, M-PESA reconciliations, staff payroll, and reports in one system.",
  siteKeywordsDefault:
    "StoreGrid, Business Management Software Kenya, Retail POS Software Kenya, Point of Sale Nairobi, SME Inventory Management Kenya, M-PESA POS Integration, Customer Debt Ledger, Cash Reconciliation, Retail ERP Kenya",
  defaultOgImage: "/og-image.png",
  twitterHandle: "@storegrid",
  themeColor: "#2563eb",
  productionDomain: "https://storegrid.co.ke",
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
    name: "StoreGrid",
    url: siteUrl,
    logo: `${siteUrl}/storegrid-logo.png`,
    description: SEO_CONFIG.siteDescriptionDefault,
    sameAs: [
      "https://twitter.com/storegrid",
      "https://www.linkedin.com/company/storegrid",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+254743849304",
        email: "storegridkenya@gmail.com",
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
    name: "StoreGrid",
    alternateName: "StoreGrid Business Management",
    url: siteUrl,
    description: SEO_CONFIG.siteDescriptionDefault,
    publisher: {
      "@type": "Organization",
      name: "StoreGrid",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/storegrid-logo.png`,
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
    name: "StoreGrid Retail Business Platform",
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
    screenshot: `${siteUrl}/hero-bg.webp`,
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generates Schema.org FAQPage structured data for rich SERP accordions
 * and direct citation by AI Answer Engines (Perplexity, ChatGPT Search, Claude).
 */
export function getFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Generates Schema.org Product structured data for pricing and software editions.
 */
export function getProductSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "StockGrid Retail Cloud POS",
    image: `${siteUrl}/hero-bg.webp`,
    description: SEO_CONFIG.siteDescriptionDefault,
    brand: {
      "@type": "Brand",
      name: SEO_CONFIG.siteName,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "KES",
      lowPrice: "1000",
      highPrice: "3000",
      offerCount: "3",
      offers: [
        {
          "@type": "Offer",
          name: "Starter Retail",
          price: "1000",
          priceCurrency: "KES",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/#pricing`,
        },
        {
          "@type": "Offer",
          name: "Growth Pro",
          price: "2000",
          priceCurrency: "KES",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/#pricing`,
        },
        {
          "@type": "Offer",
          name: "Enterprise Chain",
          price: "3000",
          priceCurrency: "KES",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/#pricing`,
        },
      ],
    },
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
