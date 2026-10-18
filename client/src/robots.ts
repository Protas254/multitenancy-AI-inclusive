import { getSiteUrl } from "@/lib/seo";

export type RobotsRule = {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
};

export type RobotsOutput = {
  rules: RobotsRule | RobotsRule[];
  sitemap?: string | string[];
  host?: string;
};

/**
 * Programmatic Next.js/Vite compatible robots configuration.
 * Configures search crawler indexing permissions for public marketing
 * and ensures private tenant, staff, financial, and API routes are blocked.
 */
export default function robots(): RobotsOutput {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/favicon.ico",
        "/favicon.svg",
        "/apple-touch-icon.png",
        "/og-image.png",
        "/stockgrid-logo.png",
        "/hero-bg.jpg",
        "/assets/",
      ],
      disallow: [
        "/dashboard",
        "/pos",
        "/inventory",
        "/products",
        "/products/",
        "/sales",
        "/sales/",
        "/customers",
        "/customers/",
        "/invoices",
        "/invoices/",
        "/purchases",
        "/purchases/",
        "/suppliers",
        "/suppliers/",
        "/expenses",
        "/credit",
        "/payroll",
        "/staff",
        "/staff/",
        "/targets",
        "/loyalty",
        "/reports",
        "/reports/",
        "/closing-reports",
        "/notifications",
        "/settings",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/onboarding",
        "/admin/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
