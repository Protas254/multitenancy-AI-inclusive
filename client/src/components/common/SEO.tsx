import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "StockGrid | Retail Business Cloud & Multi-Tenant POS",
  description = "Complete daily retail business management platform and multi-store point-of-sale",
  keywords = "StockGrid, POS, Inventory, Multi-Tenant, Retail, SaaS, ERP, M-Pesa",
  image = "/og-image.png",
  url = "https://stockgrid.local",
}) => {
  const fullTitle = title.includes("StockGrid") ? title : `${title} | StockGrid`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};
