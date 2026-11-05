import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import {
  SEO_CONFIG,
  getBreadcrumbSchema,
  getProductSchema,
  getFAQSchema,
  getCanonicalUrl,
} from "@/lib/seo";
import {
  Check,
  Zap,
  ShieldCheck,
  Building2,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PricingPlan {
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  popular?: boolean;
  idealFor: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter Retail",
    tagline: "Essential POS, live stock control, and daily cash reconciliation.",
    price: "KES 1,000",
    cadence: "per month",
    idealFor: "Single-outlet retail shops, boutiques, pharmacies & sole proprietors.",
    features: [
      "1 Store Branch",
      "Up to 3 Staff User Accounts",
      "Fast Touch & Barcode POS Terminal",
      "Cash & Lipa Na M-Pesa Verification",
      "Real-Time Stock Depletion & Alerts",
      "Digital & Thermal Printable Receipts",
      "End-of-Day Shift Closeout Reports",
      "Daily Automatic Cloud Backups",
    ],
    ctaText: "Start 14-Day Free Trial",
    ctaHref: "/register",
  },
  {
    name: "Growth Pro",
    tagline: "Expanded scale with customer credit ledgers, loyalty & B2B invoicing.",
    price: "KES 2,000",
    cadence: "per month",
    popular: true,
    idealFor: "Growing retail stores, multi-counter supermarkets & wholesale grocers.",
    features: [
      "Up to 3 Store Branches",
      "Up to 10 Staff User Accounts",
      "Everything in Starter Retail, plus:",
      "Customer Credit Debt & Aging Ledger",
      "Customer Loyalty Points & Bronze-to-Platinum Tiers",
      "B2B Tax Invoicing & Credit Notes",
      "Inter-Branch Inventory Transfers",
      "Product Expiry Date Tracking",
      "Supplier Purchase Order Management",
      "Automated WhatsApp & SMS Receipts",
    ],
    ctaText: "Get Started Free",
    ctaHref: "/register",
  },
  {
    name: "Enterprise Chain",
    tagline: "Full retail suite with automated staff payroll and centralized analytics.",
    price: "KES 3,000",
    cadence: "per month",
    idealFor: "Retail chains, multi-location supermarkets & central warehouse networks.",
    features: [
      "Unlimited Store Branches",
      "Unlimited Staff & Cashier Accounts",
      "Everything in Growth Pro, plus:",
      "Staff Payroll Automation & Printable Payslips",
      "Sales Staff Commission Tracking",
      "Consolidated Multi-Branch P&L Reports",
      "Central Warehouse Distribution Control",
      "Strict Role-Based Permission Matrices",
      "Dedicated Onboarding & 24/7 Priority Support",
      "Custom SLA & Tailored Data Exports",
    ],
    ctaText: "Deploy Enterprise",
    ctaHref: "/register",
  },
];

const PRICING_FAQS = [
  {
    question: "Is there a free trial available?",
    answer:
      "Yes. StoreGrid includes a 14-day free trial on all plans with full unrestricted access to enterprise features. No credit card or upfront deposit is required.",
  },
  {
    question: "How do M-Pesa payments integrate with StoreGrid POS?",
    answer:
      "StoreGrid integrates with Safaricom Lipa Na M-Pesa Tills and Paybills. Cashiers confirm valid transaction reference codes instantly at checkout, automatically updating daily reconciliation journals without manual record keeping.",
  },
  {
    question: "Can I upgrade or downgrade my subscription at any time?",
    answer:
      "Yes. You can switch plans as your retail business expands from a single boutique to a multi-branch chain. Your data, products, and customer records remain completely intact.",
  },
  {
    question: "What hardware does StoreGrid require?",
    answer:
      "StoreGrid runs on standard web browsers across PCs, laptops, tablets, Android POS terminals, and smartphones. It connects with standard USB and Bluetooth ESC/POS thermal receipt printers and barcode scanners.",
  },
  {
    question: "How is my store data protected?",
    answer:
      "StoreGrid enforces strict multi-tenant schema isolation. Each business's data is quarantined in its own containerized context with TLS 1.3 encryption and automated offsite backups.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="Pricing Plans & Subscriptions | StoreGrid Retail POS"
        description="Transparent and affordable cloud POS & retail management pricing for Kenyan and East African retailers. Plans from KES 1,000/mo. Free 14-day trial."
        pathname="/pricing"
        canonical={getCanonicalUrl("/pricing")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Pricing", url: "/pricing" },
          ]),
          getProductSchema(),
          getFAQSchema(PRICING_FAQS),
        ]}
      />

      {/* Static Marketing Header */}
      <MarketingHeader activePath="/pricing" />

      {/* Hero Headline */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Plans Built for African Retail Businesses
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Scale your retail business from a single shop counter to a national chain. All plans include automated cash reconciliation, POS, and real-time inventory.
          </p>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-white border p-6 sm:p-8 shadow-sm transition-all hover:shadow-md ${
                plan.popular
                  ? "border-blue-600 ring-2 ring-blue-600/20 shadow-blue-50"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  <Zap className="h-3 w-3 fill-current" />
                  Most Popular
                </div>
              )}

              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 min-h-[32px]">{plan.tagline}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    /{plan.cadence}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  <strong className="text-slate-700">Best for:</strong> {plan.idealFor}
                </p>
              </div>

              <div className="space-y-3 flex-1 mb-8">
                <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  What's included:
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={plan.ctaHref} className="w-full">
                <Button
                  className={`w-full font-bold text-xs h-10 ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {plan.ctaText}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Answer Engine & AEO FAQ Accordion */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
              <span>Answers & Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Everything you need to know about StoreGrid billing, M-Pesa reconciliations, and retail hardware compatibility.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {PRICING_FAQS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-slate-200 rounded-xl px-4 py-1 data-[state=open]:bg-slate-50/50 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-slate-900 text-sm hover:no-underline py-3">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-600 leading-relaxed pb-4 pt-1">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Marketing Footer */}
      <MarketingFooter />

      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
