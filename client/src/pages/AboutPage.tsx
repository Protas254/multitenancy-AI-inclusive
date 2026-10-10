import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import {
  Store,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Award,
  Globe2,
  Receipt,
  Boxes,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Integrity and Data Isolation",
      desc: "Every merchant's data is strictly quarantined in their own tenant context. We treat your store records, sales figures, and margins with bank-grade confidentiality.",
    },
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: "Radical Simplicity and Speed",
      desc: "Retail moves at the speed of customers. We eliminate bloated onboarding, complex menus, and slow checkouts so staff can serve faster with zero training lag.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      title: "Financial Accuracy First",
      desc: "No more mysterious cash shrinkage or untracked M-Pesa payments. Our daily reconciliation engine ties physical cash drawers directly to digital ledger entries.",
    },
    {
      icon: <Globe2 className="h-6 w-6 text-indigo-600" />,
      title: "Built for Local Realities",
      desc: "Designed from the ground up for East African commerce: M-Pesa Tills, Paybills, Kenyan VAT rules, credit debt aging, and flexible multi-branch management.",
    },
  ];

  const milestones = [
    { number: "99.98%", label: "Cloud SLA Uptime" },
    { number: "< 2 min", label: "Daily Shift Closeout Time" },
    { number: "15+", label: "Retail Verticals Supported" },
    { number: "100%", label: "Multi-Tenant Isolation" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About Us | SME Business Operating System"
        description="Learn about SME OS — the modern multi-tenant operating system built for retail merchants and growing enterprises across Africa."
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Store className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-950 leading-none">
                SME OS
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Business Cloud
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <a href="/#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="/#pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <Link href="/about" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5">
              About
            </Link>
            <a href="/#contact" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-xs font-semibold gap-1.5 shadow-sm">
                <span>Enter App</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-24 bg-gradient-to-b from-blue-50/60 via-white to-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Award className="h-3.5 w-3.5 text-blue-600" />
            <span>Our Mission and Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Empowering modern retail through <span className="text-blue-600">intelligent software.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            SME OS is purpose-built to help retail stores, supermarkets, pharmacies, and wholesale distributors replace chaotic paper books and disjointed spreadsheets with a single connected operating system.
          </p>
        </div>
      </section>

      {/* Story and Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">WHY WE BUILT SME OS</span>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-snug">
              Retailers shouldn't need a team of accountants to know their daily profit.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In everyday commerce across Africa, store owners face three major friction points: stock going missing without audit trails, cash drawers not matching POS receipts, and customer credit books becoming overdue without notification.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              We engineered SME OS as a multi-tenant cloud platform that automates sales, inventories, M-Pesa reconcilements, supplier debt, and staff commissions — giving entrepreneurs instant clarity over their true numbers every single day.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Multi-tenant architecture with guaranteed tenant data boundaries</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Seamless M-Pesa, Cash, and Card balance verification</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Real-time multi-branch inventory tracking and purchase orders</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Enterprise Cloud Foundation</p>
                <p className="text-xs text-slate-400">Security, speed, and real-time reliability</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <p className="font-bold text-white mb-1">Strict Tenant Isolation</p>
                <p className="text-slate-400">Each business operates in complete separation. Customers, sales records, and inventory catalogs cannot be crossed.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <p className="font-bold text-white mb-1">Audited Financial Workflows</p>
                <p className="text-slate-400">Every change in stock, every cash discrepancy, and every staff action is permanently logged with timestamps.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <p className="font-bold text-white mb-1">Built for Fast Checkouts</p>
                <p className="text-slate-400">Sub-second POS transaction execution with instant thermal receipt generation and digital customer SMS alerts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {milestones.map((m, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight text-blue-600">
                  {m.number}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-600">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">OUR PILLARS</span>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              The principles that drive our platform
            </h2>
            <p className="text-sm text-slate-600">
              We design every feature around the day-to-day realities of busy store owners and their frontline cashiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to streamline your store operations?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Get started in seconds. No complex training or cumbersome software setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 shadow-lg">
                <span>Launch Live System</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm font-semibold h-12 px-6 border-slate-700 text-white hover:bg-slate-800">
                <span>Register Store</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-bold text-white">SME Business Operating System</span>
          </div>
          <p>© 2026 SME OS Platform. Multi-tenant Architecture.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/about" className="hover:text-white text-blue-400 font-semibold">About</Link>
            <a href="/#features" className="hover:text-white">Features</a>
            <a href="/#pricing" className="hover:text-white">Pricing</a>
            <a href="/#contact" className="hover:text-white">Contact</a>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/pos" className="hover:text-white">POS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
