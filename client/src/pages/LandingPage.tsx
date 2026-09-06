import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import {
  Store,
  ArrowRight,
  CheckCircle2,
  Receipt,
  Boxes,
  Users,
  CreditCard,
  Banknote,
  BarChart3,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAAS_PLANS } from "@/lib/mock/initialData";
import { formatKES } from "@/lib/utils";

export default function LandingPage() {
  const modules = [
    { title: "Point of Sale (POS)", icon: <Receipt className="h-5 w-5 text-blue-600" />, desc: "Touch & barcode-ready retail checkout with instant M-Pesa, Cash & thermal receipts." },
    { title: "Real-Time Inventory", icon: <Boxes className="h-5 w-5 text-emerald-600" />, desc: "Stock valuation, automated low-stock reorder triggers, movements audit trail." },
    { title: "Customer CRM & Loyalty", icon: <Users className="h-5 w-5 text-indigo-600" />, desc: "Customer profiles, purchase histories, reward points, tiers (Bronze to Platinum)." },
    { title: "Debt & Credit Aging", icon: <CreditCard className="h-5 w-5 text-rose-600" />, desc: "Track customer credit sales, supplier debt, overdue alerts, and partial payments." },
    { title: "Staff & Payroll Automation", icon: <Banknote className="h-5 w-5 text-amber-600" />, desc: "Employee sales commissions, monthly payroll approvals, and printable payslips." },
    { title: "Financial & P&L Reports", icon: <BarChart3 className="h-5 w-5 text-purple-600" />, desc: "Gross margins, net profits, category breakdowns, and exportable CSV/PDF reports." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO title="SME Business Operating System | Multi-Tenant Platform" description="Complete daily business management platform for modern retail and SMEs" />
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Store className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 leading-none">
                SME OS
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Business Cloud
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-blue-600 transition-colors">Ecosystem</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <Link href="/admin" className="hover:text-purple-600 transition-colors">Platform Admin</Link>
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
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-radial from-blue-50/70 via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Complete Business Operating System for Retail & SMEs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Run your entire business from one <span className="text-blue-600">central system.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Not just another basic POS. Manage sales, inventory, purchases, expenses, customers, staff payroll, debt, loyalty, and business insights with multi-tenant isolation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-sm font-bold shadow-md h-12 px-7">
                <span>Launch Live Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pos" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-sm font-semibold h-12 px-6">
                <Receipt className="h-4 w-4 text-slate-500" />
                <span>Test POS Terminal</span>
              </Button>
            </Link>
          </div>

          {/* Quick proof badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Kenyan M-Pesa & KES Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Role-Based Permissions (RBAC)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section id="features" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">ALL-IN-ONE PLATFORM</h2>
            <p className="text-3xl font-black tracking-tight text-slate-950">
              Everything your business needs to grow
            </p>
            <p className="text-sm text-slate-600">
              Designed specifically for everyday SME operators who value speed, accuracy, and ease-of-use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {mod.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connected Business Ecosystem Architecture */}
      <section id="architecture" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">INTERCONNECTED DATA</h2>
            <p className="text-3xl font-black tracking-tight text-slate-950">
              A Single Connected Ecosystem
            </p>
            <p className="text-sm text-slate-600">
              Every purchase updates inventory; every sale links to customer credit and staff commission.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 text-white shadow-xl space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-xs text-slate-400 font-medium uppercase">Step 1</p>
                <p className="text-sm font-bold text-white mt-1">Purchases & Stock</p>
                <p className="text-[11px] text-slate-400 mt-1">Receive POs to automatically increase inventory levels</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-xs text-slate-400 font-medium uppercase">Step 2</p>
                <p className="text-sm font-bold text-white mt-1">POS & Sales</p>
                <p className="text-[11px] text-slate-400 mt-1">Deduct stock, award loyalty points & record M-Pesa</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-xs text-slate-400 font-medium uppercase">Step 3</p>
                <p className="text-sm font-bold text-white mt-1">Credit & Invoices</p>
                <p className="text-[11px] text-slate-400 mt-1">Track receivables aging and record partial payments</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-xs text-slate-400 font-medium uppercase">Step 4</p>
                <p className="text-sm font-bold text-white mt-1">Staff Payroll & P&L</p>
                <p className="text-[11px] text-slate-400 mt-1">Auto-calculate commissions and net business profit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">SIMPLE PRICING</h2>
            <p className="text-3xl font-black tracking-tight text-slate-950">
              Plans built for every stage of growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAAS_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                  plan.isPopular
                    ? "border-blue-600 ring-2 ring-blue-600/20 shadow-lg relative"
                    : "border-slate-200 shadow-xs"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-950 font-mono">
                      {formatKES(plan.price)}
                    </span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <Link href="/register">
                    <Button
                      variant={plan.isPopular ? "default" : "outline"}
                      className="w-full text-xs font-bold"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
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
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/pos" className="hover:text-white">POS</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
