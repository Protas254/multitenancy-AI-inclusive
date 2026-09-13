import React, { useState } from "react";
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
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SAAS_PLANS } from "@/lib/mock/initialData";
import { formatKES } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";

export default function LandingPage() {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

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
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
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

      {/* Hero Section with Image Background */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 text-white">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Retail Store & POS Supermarket Background"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Subtle multi-layer overlay for crisp contrast while keeping the store visually rich */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950" />
          <div className="absolute inset-0 bg-radial from-blue-600/15 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Complete Business Operating System for Retail & SMEs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Run your entire business from one <span className="text-blue-400">central system.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
            Not just another basic POS. Manage sales, inventory, purchases, expenses, customers, staff payroll, debt, loyalty, and business insights with multi-tenant isolation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 h-12 px-7">
                <span>Launch Live Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pos" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-sm font-semibold h-12 px-6 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md">
                <Receipt className="h-4 w-4 text-slate-200" />
                <span>Test POS Terminal</span>
              </Button>
            </Link>
          </div>

          {/* Quick proof badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-200">
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Kenyan M-Pesa & KES Ready</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">GET IN TOUCH</h2>
            <p className="text-3xl font-black tracking-tight text-slate-950">
              We're here to help your business thrive
            </p>
            <p className="text-sm text-slate-600">
              Have questions about multi-branch deployments, hardware setups, or custom onboarding? Talk to our team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-6">
                <h3 className="text-base font-bold text-slate-900">Direct Contacts</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-9 w-9 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Call & WhatsApp Support</p>
                      <p className="text-sm font-semibold text-slate-900">+254 700 123 456 / +254 711 987 654</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-9 w-9 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Email Inquiries</p>
                      <p className="text-sm font-semibold text-slate-900">support@smeos.africa</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-9 w-9 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Headquarters</p>
                      <p className="text-sm font-semibold text-slate-900">Westlands Commercial Tower, Nairobi, Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-9 w-9 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Business Hours</p>
                      <p className="text-sm font-semibold text-slate-900">Monday - Saturday: 8:00 AM - 7:00 PM EAT</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
              {contactSubmitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Message Received</h4>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you! An SME OS onboarding specialist will reach out to you within 2 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactForm({ name: "", email: "", phone: "", businessName: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Send us a message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                      <Input
                        required
                        placeholder="e.g. Samuel Maina"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                      <Input
                        required
                        placeholder="0712 345 678"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Work Email *</label>
                      <Input
                        required
                        type="email"
                        placeholder="samuel@mybusiness.co.ke"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Business / Store Name</label>
                      <Input
                        placeholder="e.g. Quick Retailers Ltd"
                        value={contactForm.businessName}
                        onChange={(e) => setContactForm({ ...contactForm, businessName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Your Inquiry / Requirements *</label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Tell us about your business, number of branches, and any specific requirements..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full sm:w-auto gap-2 font-bold text-xs shadow-sm">
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Inquiry</span>
                  </Button>
                </form>
              )}
            </div>
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
            <Link href="/about" className="hover:text-white">About</Link>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#contact" className="hover:text-white">Contact</a>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/pos" className="hover:text-white">POS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
