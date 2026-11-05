import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { INDUSTRIES_DATA } from "@/data/industriesData";
import {
  Store,
  ShoppingCart,
  Truck,
  Wrench,
  Scissors,
  Sparkles,
  HeartPulse,
  Smartphone,
  Shirt,
  Trees,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const INDUSTRY_ICON_MAP: Record<string, React.ReactNode> = {
  "retail-shops": <Store className="h-6 w-6 text-blue-600" />,
  supermarkets: <ShoppingCart className="h-6 w-6 text-emerald-600" />,
  wholesalers: <Truck className="h-6 w-6 text-indigo-600" />,
  "hardware-stores": <Wrench className="h-6 w-6 text-amber-600" />,
  barbershops: <Scissors className="h-6 w-6 text-red-600" />,
  salons: <Sparkles className="h-6 w-6 text-pink-600" />,
  spas: <HeartPulse className="h-6 w-6 text-teal-600" />,
  electronics: <Smartphone className="h-6 w-6 text-purple-600" />,
  "clothing-stores": <Shirt className="h-6 w-6 text-blue-600" />,
  "furniture-timber": <Trees className="h-6 w-6 text-emerald-700" />,
};

export default function IndustriesIndexPage() {
  const industriesList = Object.values(INDUSTRIES_DATA);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="Industries Supported by StoreGrid | Retail, Salons & Wholesalers"
        description="Discover how StoreGrid is customized for Kenyan retail shops, supermarkets, wholesalers, hardware stores, kinyozi barbershops, salons, and electronics dealers."
        pathname="/industries"
        canonical={getCanonicalUrl("/industries")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Industries", url: "/industries" },
          ]),
        ]}
      />

      <MarketingHeader activePath="/industries" />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Software Built for How African Businesses Actually Operate
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From busy retail counters and multi-lane supermarkets to salon commission splits and contractor debt books, StoreGrid fits your specific daily workflow.
          </p>
        </div>
      </section>

      {/* Industry Cards Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industriesList.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-5 group-hover:bg-blue-50 transition-colors">
                {INDUSTRY_ICON_MAP[ind.slug] || <Store className="h-6 w-6 text-blue-600" />}
              </div>

              <h2 className="text-base font-bold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                {ind.name}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-5">
                {ind.heroTagline}
              </p>

              <div className="flex items-center justify-center pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-blue-600 group-hover:underline">
                  View Solution Workflow
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
