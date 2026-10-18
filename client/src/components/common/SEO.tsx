import React from "react";
import { Helmet } from "react-helmet-async";
import { SEO_CONFIG, getCanonicalUrl, getSiteUrl } from "@/lib/seo";

export interface SEOProps {
  /** Page-specific title */
  title?: string;
  /** Explicit title override without applying template */
  rawTitle?: string;
  /** Meta description */
  description?: string;
  /** Meta keywords */
  keywords?: string;
  /** Social share image (relative or absolute URL) */
  image?: string;
  /** Page path or full canonical URL */
  canonical?: string;
  /** Pathname (e.g., "/about") used to build canonical if canonical not provided */
  pathname?: string;
  /** Open Graph type */
  ogType?: "website" | "article" | "product";
  /** Prevent search engines from indexing this page */
  noindex?: boolean;
  /** Prevent search engines from following links on this page */
  nofollow?: boolean;
  /** Schema.org structured data object or array of objects */
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  rawTitle,
  description = SEO_CONFIG.siteDescriptionDefault,
  keywords = SEO_CONFIG.siteKeywordsDefault,
  image = SEO_CONFIG.defaultOgImage,
  canonical,
  pathname,
  ogType = "website",
  noindex = false,
  nofollow,
  jsonLd,
}) => {
  // Compute formatted title
  let fullTitle: string;
  if (rawTitle) {
    fullTitle = rawTitle;
  } else if (!title) {
    fullTitle = SEO_CONFIG.siteTitleDefault;
  } else if (title.includes(SEO_CONFIG.siteName)) {
    fullTitle = title;
  } else {
    fullTitle = `${title} | ${SEO_CONFIG.siteName}`;
  }

  // Determine canonical URL
  const siteUrl = getSiteUrl();
  let resolvedCanonical: string;
  if (canonical) {
    resolvedCanonical = canonical.startsWith("http")
      ? canonical
      : getCanonicalUrl(canonical);
  } else if (pathname) {
    resolvedCanonical = getCanonicalUrl(pathname);
  } else if (typeof window !== "undefined" && window.location?.pathname) {
    resolvedCanonical = getCanonicalUrl(window.location.pathname);
  } else {
    resolvedCanonical = siteUrl;
  }

  // Resolve absolute image URL for Open Graph & Twitter
  const resolvedImage = image.startsWith("http")
    ? image
    : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;

  // Robots directive
  const shouldNoFollow = nofollow !== undefined ? nofollow : noindex;
  const robotsDirective = noindex
    ? `${shouldNoFollow ? "noindex, nofollow" : "noindex, follow"}`
    : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

  // Normalize JSON-LD schemas
  const schemas: Array<Record<string, any>> = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsDirective} />
      <meta name="googlebot" content={noindex ? (shouldNoFollow ? "noindex, nofollow" : "noindex, follow") : "index, follow"} />
      <link rel="canonical" href={resolvedCanonical} />

      {/* OpenGraph / Facebook */}
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_KE" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Structured Data (Schema.org JSON-LD) */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
