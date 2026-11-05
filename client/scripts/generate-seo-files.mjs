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

// Read site URL from environment or .env.production or .env.local or fallback
let siteUrl = process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  const envProdPath = path.resolve(rootDir, ".env.production");
  if (fs.existsSync(envProdPath)) {
    const content = fs.readFileSync(envProdPath, "utf-8");
    const match = content.match(/(?:VITE_SITE_URL|NEXT_PUBLIC_SITE_URL)=(https?:\/\/[^\s]+)/);
    if (match) {
      siteUrl = match[1];
    }
  }
}
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
  siteUrl = "https://storegrid.co.ke";
}
siteUrl = siteUrl.replace(/\/+$/, "");

console.log(`[SEO Generator] Building sitemap & robots for site URL: ${siteUrl}`);

const currentDate = new Date().toISOString().split("T")[0];

const featureSlugs = [
  "pos-system",
  "inventory-management",
  "sales-management",
  "credit-management",
  "invoicing",
  "expense-management",
  "purchases",
  "customer-management",
  "supplier-management",
  "staff-management",
  "payroll",
  "sales-targets",
  "loyalty-program",
  "business-reports",
  "multi-branch",
  "mpesa",
];

const industrySlugs = [
  "retail-shops",
  "supermarkets",
  "wholesalers",
  "hardware-stores",
  "barbershops",
  "salons",
  "spas",
  "electronics",
  "clothing-stores",
  "furniture-timber",
];

const resourceSlugs = [
  "manage-small-business-kenya",
  "track-daily-sales",
  "pos-system-kenya",
  "cash-and-mpesa-sales",
];

const staticPages = [
  { path: "", changefreq: "weekly", priority: "1.0" },
  { path: "about", changefreq: "monthly", priority: "0.8" },
  { path: "pricing", changefreq: "weekly", priority: "0.9" },
  { path: "features", changefreq: "weekly", priority: "0.9" },
  { path: "industries", changefreq: "weekly", priority: "0.9" },
  { path: "resources", changefreq: "weekly", priority: "0.8" },
  { path: "how-it-works", changefreq: "monthly", priority: "0.8" },
  { path: "security", changefreq: "monthly", priority: "0.7" },
  { path: "privacy-policy", changefreq: "yearly", priority: "0.5" },
  { path: "terms", changefreq: "yearly", priority: "0.5" },
  { path: "book-demo", changefreq: "monthly", priority: "0.8" },
  { path: "contact", changefreq: "monthly", priority: "0.7" },
];

let urlEntries = staticPages.map((p) => {
  const loc = p.path ? `${siteUrl}/${p.path}` : `${siteUrl}/`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
});

featureSlugs.forEach((slug) => {
  urlEntries.push(`  <url>
    <loc>${siteUrl}/features/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
});

industrySlugs.forEach((slug) => {
  urlEntries.push(`  <url>
    <loc>${siteUrl}/industries/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
});

resourceSlugs.forEach((slug) => {
  urlEntries.push(`  <url>
    <loc>${siteUrl}/resources/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
});

// 1. Generate sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>
`;

fs.writeFileSync(path.resolve(publicDir, "sitemap.xml"), sitemapXml, "utf-8");
console.log(`  ✓ Generated public/sitemap.xml (${urlEntries.length} URLs indexed)`);

// 2. Generate robots.txt
const robotsTxt = `# =============================================================
#  StoreGrid Robots Directive Configuration
#  Production Domain: ${siteUrl}
# =============================================================

User-agent: *
# Allowed Public Marketing Content and Static Assets
Allow: /
Allow: /about
Allow: /pricing
Allow: /features
Allow: /features/
Allow: /industries
Allow: /industries/
Allow: /resources
Allow: /resources/
Allow: /how-it-works
Allow: /security
Allow: /privacy-policy
Allow: /terms
Allow: /book-demo
Allow: /contact
Allow: /favicon.ico
Allow: /favicon.svg
Allow: /apple-touch-icon.png
Allow: /og-image.png
Allow: /storegrid-logo.png
Allow: /stockgrid-logo.png
Allow: /hero-bg.webp
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
