import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { Phone, Mail, MapPin, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="Contact StoreGrid | Sales, Customer Support & Office in Nairobi"
        description="Get in touch with the StoreGrid team in Nairobi, Kenya. Reach sales, technical support, or schedule an in-person onboarding demo."
        pathname="/contact"
        canonical={getCanonicalUrl("/contact")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Contact", url: "/contact" },
          ]),
        ]}
      />

      <MarketingHeader activePath="/contact" />

      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Contact StoreGrid Kenya
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Have questions about POS hardware, Lipa Na M-PESA integration, or multi-branch setup? Speak with our Nairobi-based team.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Phone className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-950">Phone & WhatsApp</h2>
          <p className="text-xs text-slate-600">Direct sales and technical support 24/7:</p>
          <p className="text-xs font-bold text-slate-900">+254 743 849 304</p>
          <a
            href="https://wa.me/254743849304?text=Hello%20StoreGrid%20Team"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 pt-1"
          >
            <span>Chat on WhatsApp</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-950">Email Support</h2>
          <p className="text-xs text-slate-600">Inquiries and onboarding requests:</p>
          <p className="text-xs font-bold text-slate-900">stockgridke@gmail.com</p>
          <p className="text-[11px] text-slate-500 pt-1">Response time: &lt; 2 business hours</p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <MapPin className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-950">Headquarters</h2>
          <p className="text-xs text-slate-600">Nairobi, Kenya</p>
          <p className="text-xs text-slate-700">Serving businesses across Kenya, Uganda, Tanzania, and Rwanda.</p>
        </div>
      </div>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
