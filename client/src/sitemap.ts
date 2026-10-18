import { getSiteUrl } from "@/lib/seo";

export type SitemapItem = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

/**
 * Programmatic Next.js/Vite compatible sitemap definition.
 * Strictly includes only valid public canonical URLs.
 * Authenticated tenant and administrative routes are excluded.
 */
export default function sitemap(): SitemapItem[] {
  const baseUrl = getSiteUrl();
  const currentDate = new Date().toISOString().split("T")[0];

  return [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
