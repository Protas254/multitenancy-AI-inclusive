import React, { useState } from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    businessName: "",
    businessType: "retail-shop",
    branches: "1",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="Book a Live Product Demo | StoreGrid Business Management"
        description="Schedule a 1-on-1 walkthrough of StoreGrid with our product team. See POS checkout, M-PESA reconciliations, and inventory controls tailored to your business."
        pathname="/book-demo"
        canonical={getCanonicalUrl("/book-demo")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Book a Demo", url: "/book-demo" },
          ]),
        ]}
      />

      <MarketingHeader />

      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            See StoreGrid in Action for Your Specific Store
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Discover how StoreGrid eliminates cashier shortages and inventory confusion. Walk through real workflows with our Nairobi-based product specialists.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: What the Demo Covers */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-950">What We Will Cover in Your 20-Min Demo:</h2>
          <ul className="space-y-3.5">
            {[
              "Real-time checkout speed with barcode scanning and thermal printing",
              "Safaricom Lipa Na M-PESA Till and Paybill payment matching",
              "How to track stock received, damaged, or transferred across branches",
              "Customer debt aging ledgers and credit reminder statements",
              "Configuring cashier role permissions and manager authorization PINs",
              "Tailored pricing recommendation for your business size",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Need Instant Support?
            </h3>
            <p className="text-xs text-slate-600">
              You can also chat directly with our implementation team on WhatsApp at{" "}
              <strong className="text-slate-900">+254 743 849 304</strong>.
            </p>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Demo Request Received!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you, {form.fullName}. Our team will contact you within 2 hours on {form.phone} to schedule your preferred demo time.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-slate-950 mb-1">
                Schedule Your Demo
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Mary Wanjiku"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Phone (WhatsApp) *</label>
                  <Input
                    required
                    placeholder="0712 345 678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="mary@mybiz.co.ke"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Business Name</label>
                  <Input
                    placeholder="e.g. Apex Chemist"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Branches</label>
                  <select
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs"
                    value={form.branches}
                    onChange={(e) => setForm({ ...form, branches: e.target.value })}
                  >
                    <option value="1">1 Store / Branch</option>
                    <option value="2-3">2 - 3 Branches</option>
                    <option value="4+">4+ Branches (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Notes / Questions</label>
                <Textarea
                  rows={3}
                  placeholder="Tell us what challenge you want to solve first..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm">
                Request Product Demo
              </Button>
            </form>
          )}
        </div>
      </div>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
