import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl, getFAQSchema } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { FEATURES_DATA } from "@/data/featuresData";
import {
  Sparkles,
  ArrowRight,
  Receipt,
  Boxes,
  TrendingUp,
  CreditCard,
  FileText,
  Wallet,
  Truck,
  Users,
  Briefcase,
  ShieldCheck,
  Banknote,
  Target,
  Gift,
  BarChart3,
  Building2,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, React.ReactNode> = {
  Receipt: <Receipt className="h-6 w-6 text-blue-600" />,
  Boxes: <Boxes className="h-6 w-6 text-emerald-600" />,
  TrendingUp: <TrendingUp className="h-6 w-6 text-indigo-600" />,
  CreditCard: <CreditCard className="h-6 w-6 text-rose-600" />,
  FileText: <FileText className="h-6 w-6 text-amber-600" />,
  Wallet: <Wallet className="h-6 w-6 text-teal-600" />,
  Truck: <Truck className="h-6 w-6 text-purple-600" />,
  Users: <Users className="h-6 w-6 text-cyan-600" />,
  Briefcase: <Briefcase className="h-6 w-6 text-slate-700" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6 text-green-600" />,
  Banknote: <Banknote className="h-6 w-6 text-amber-600" />,
  Target: <Target className="h-6 w-6 text-red-600" />,
  Gift: <Gift className="h-6 w-6 text-pink-600" />,
  BarChart3: <BarChart3 className="h-6 w-6 text-blue-600" />,
  Building2: <Building2 className="h-6 w-6 text-indigo-600" />,
  Smartphone: <Smartphone className="h-6 w-6 text-emerald-600" />,
};

const FEATURES_INDEX_FAQS = [
  {
    question: "Are all these business features included in one subscription?",
    answer:
      "Yes. StoreGrid is a unified modular business management platform. Depending on your chosen plan (Starter, Growth, or Enterprise), features like POS, inventory, credit ledgers, and reporting are immediately active without expensive third-party plugins.",
  },
  {
    question: "Can I try all features before subscribing?",
    answer:
      "Yes. The 14-day free trial gives you full unrestricted access to all enterprise features, including multi-branch transfers, staff payroll, and M-PESA reconciliations. No credit card required.",
  },
  {
    question: "Do features work on mobile phones and tablets?",
    answer:
      "Yes. StoreGrid is cloud-based and fully responsive on laptops, desktop PCs, iPads, Android tablets, and smartphones.",
  },
];

export default function FeaturesIndexPage() {
  const featureList = Object.values(FEATURES_DATA);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="StoreGrid Features | Complete Retail & Business Management Tools"
        description="Explore all StoreGrid features: Point of Sale, live inventory, Lipa Na M-PESA integration, customer credit ledgers, staff payroll, and financial reports."
        pathname="/features"
        canonical={getCanonicalUrl("/features")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Features", url: "/features" },
          ]),
          getFAQSchema(FEATURES_INDEX_FAQS),
        ]}
      />

      <MarketingHeader activePath="/features" />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Complete Business Management Tools for Kenyan SMEs
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate disconnected software and manual notebooks. StoreGrid brings daily checkout, inventory replenishment, customer credit, and financial reporting into one intuitive cloud system.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feature) => (
            <Link
              key={feature.slug}
              href={`/features/${feature.slug}`}
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-5 group-hover:bg-blue-50 transition-colors">
                {ICON_MAP[feature.iconName] || <Receipt className="h-6 w-6 text-blue-600" />}
              </div>

              <h2 className="text-base font-bold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-5">
                {feature.shortDesc}
              </p>

              <div className="flex items-center justify-center pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-blue-600 group-hover:underline">
                  Explore Feature Details
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-blue-600 text-white text-center px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Run Your Business Smarter?</h2>
          <p className="text-xs sm:text-sm text-blue-100">
            Start your 14-day unrestricted free trial today. Set up in less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs h-11 px-6 shadow-sm">
                Start 14-Day Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 text-xs h-11 px-6">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
