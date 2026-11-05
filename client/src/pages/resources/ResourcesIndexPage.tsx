import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { RESOURCES_DATA } from "@/data/resourcesData";
import { BookOpen, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResourcesIndexPage() {
  const articles = Object.values(RESOURCES_DATA);
  const businessGuides = articles.filter((a) => a.category === "Business Guides");
  const kenyaGuides = articles.filter((a) => a.category === "Kenya Focus");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="StoreGrid Resources | SME Business Guides & Retail POS Insights"
        description="Practical educational guides, cash reconciliation tutorials, POS tips, and business management strategies for small and growing businesses in Kenya."
        pathname="/resources"
        canonical={getCanonicalUrl("/resources")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Resources", url: "/resources" },
          ]),
        ]}
      />

      <MarketingHeader activePath="/resources" />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Practical Business Guides for Growing Retailers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Written for shop owners, retail managers, and entrepreneurs in Kenya. Learn how to track daily sales, eliminate cash shortages, manage stock, and grow profitably.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full space-y-14">
        {/* Kenya Focused Guides */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Kenya Retail & Mobile Money Insights
            </h2>
            <p className="text-xs text-slate-500">
              M-PESA Till reconciliations, POS system setups, and local business best practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kenyaGuides.map((art) => (
              <Link
                key={art.slug}
                href={`/resources/${art.slug}`}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {art.readTime}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-5 flex-1 line-clamp-3">
                  {art.directAnswer}
                </p>

                <div className="flex items-center justify-center pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-blue-600 group-hover:underline">
                    Read Practical Guide
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Business Management Guides */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Small Business Management Fundamentals
            </h2>
            <p className="text-xs text-slate-500">
              Cash flow management, daily sales journals, and inventory reordering strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businessGuides.map((art) => (
              <Link
                key={art.slug}
                href={`/resources/${art.slug}`}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {art.readTime}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-5 flex-1 line-clamp-3">
                  {art.directAnswer}
                </p>

                <div className="flex items-center justify-center pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-blue-600 group-hover:underline">
                    Read Practical Guide
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
