import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import {
  UserPlus,
  Store,
  Boxes,
  Receipt,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: "01",
    title: "Create Your Business Account",
    desc: "Sign up in 30 seconds with your email and business name. No credit card required. Receive instant access to your 14-day free trial.",
    icon: <UserPlus className="h-6 w-6 text-blue-600" />,
  },
  {
    step: "02",
    title: "Set Up Your Store & Branches",
    desc: "Configure your primary store branch, add your Safaricom Lipa Na M-PESA Till/Paybill number, and create cashier staff PINs with custom permissions.",
    icon: <Store className="h-6 w-6 text-emerald-600" />,
  },
  {
    step: "03",
    title: "Add or Import Products",
    desc: "Upload your product catalog via Excel/CSV or add items manually with barcodes, wholesale costs, retail prices, and low-stock alerts.",
    icon: <Boxes className="h-6 w-6 text-indigo-600" />,
  },
  {
    step: "04",
    title: "Start Ringing Up Sales at POS",
    desc: "Scan barcodes or tap product tiles, select M-PESA or Cash, verify payment reference codes, and issue printed or WhatsApp receipts.",
    icon: <Receipt className="h-6 w-6 text-rose-600" />,
  },
  {
    step: "05",
    title: "Review Automatic Daily Reports",
    desc: "Close cashier shifts in 2 minutes. Inspect daily sales journals, gross margins, petty cash expenses, and inventory reorder alerts.",
    icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="How StoreGrid Works | Fast 5-Step Retail Setup Guide"
        description="See how simple it is to get started with StoreGrid. Create your store account, add products, link M-PESA, ring up sales, and view daily profit reports."
        pathname="/how-it-works"
        canonical={getCanonicalUrl("/how-it-works")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "How It Works", url: "/how-it-works" },
          ]),
        ]}
      />

      <MarketingHeader activePath="/how-it-works" />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            How StoreGrid Works for Your Business
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From initial registration to ringing up your first M-PESA customer checkout, StoreGrid is built for simplicity with zero steep learning curves.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-8">
        {STEPS.map((step) => (
          <div
            key={step.step}
            className="flex flex-col md:flex-row items-start gap-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs"
          >
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              {step.icon}
            </div>

            <div className="space-y-2 flex-1">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                Step {step.step}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950">
                {step.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}

        <div className="p-8 rounded-2xl bg-blue-600 text-white text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to see it in action?</h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Set up your business today and enjoy 14 days of full unrestricted access.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs h-11 px-6 shadow-sm">
                Start 14-Day Free Trial
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
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
