/**
 * Build-time script to generate sitemap.xml and robots.txt into client/public/
 * using the configured environment URL.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.resolve(rootDir, "public");

// Read site URL from environment or .env.local or fallback
let siteUrl = process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  const envLocalPath = path.resolve(rootDir, ".env.local");
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, "utf-8");
    const match = content.match(/(?:VITE_SITE_URL|NEXT_PUBLIC_SITE_URL)=(https?:\/\/[^\s]+)/);
    if (match) {
      siteUrl = match[1];
    }
  }
}

if (!siteUrl) {
  siteUrl = "https://stockgrid.africa";
}
siteUrl = siteUrl.replace(/\/+$/, "");

console.log(`[SEO Generator] Building sitemap & robots for site URL: ${siteUrl}`);

const currentDate = new Date().toISOString().split("T")[0];

// 1. Generate sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`;

fs.writeFileSync(path.resolve(publicDir, "sitemap.xml"), sitemapXml, "utf-8");
console.log("  ✓ Generated public/sitemap.xml");

// 2. Generate robots.txt
const robotsTxt = `# =============================================================
#  StockGrid Robots Directive Configuration
#  Production Domain: ${siteUrl}
# =============================================================

User-agent: *
# Allowed Public Marketing Content and Static Assets
Allow: /
Allow: /about
Allow: /favicon.ico
Allow: /favicon.svg
Allow: /apple-touch-icon.png
Allow: /og-image.png
Allow: /stockgrid-logo.png
Allow: /hero-bg.jpg
Allow: /assets/

# Disallow Private Tenant Dashboard & Operational Workspace
Disallow: /dashboard
Disallow: /pos
Disallow: /inventory
Disallow: /products
Disallow: /products/
Disallow: /sales
Disallow: /sales/
Disallow: /customers
Disallow: /customers/
Disallow: /invoices
Disallow: /invoices/
Disallow: /purchases
Disallow: /purchases/
Disallow: /suppliers
Disallow: /suppliers/
Disallow: /expenses
Disallow: /credit
Disallow: /payroll
Disallow: /staff
Disallow: /staff/
Disallow: /targets
Disallow: /loyalty
Disallow: /reports
Disallow: /reports/
Disallow: /closing-reports
Disallow: /notifications
Disallow: /settings

# Disallow Authentication and Onboarding Forms
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /onboarding

# Disallow Backend APIs and Django Administration
Disallow: /admin/
Disallow: /api/

# Sitemap Location
Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.resolve(publicDir, "robots.txt"), robotsTxt, "utf-8");
console.log("  ✓ Generated public/robots.txt");
