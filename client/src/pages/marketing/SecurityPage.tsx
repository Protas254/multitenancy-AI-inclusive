import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import {
  ShieldCheck,
  Lock,
  Database,
  KeyRound,
  FileCheck,
  CheckCircle2,
  Server,
  RefreshCw,
} from "lucide-react";

export default function SecurityPage() {
  const securityPillars = [
    {
      icon: <Database className="h-6 w-6 text-blue-600" />,
      title: "Strict Multi-Tenant Data Quarantine",
      desc: "Every subscriber's records, sales numbers, cost margins, and customer databases are strictly partitioned at the application and schema layers. No merchant can ever access another merchant's operational context.",
    },
    {
      icon: <Lock className="h-6 w-6 text-emerald-600" />,
      title: "TLS 1.3 In-Flight Encryption",
      desc: "All traffic between POS checkout screens, mobile manager dashboards, and cloud backend databases is secured using modern TLS 1.3 protocol with strict HSTS enforcement.",
    },
    {
      icon: <KeyRound className="h-6 w-6 text-amber-600" />,
      title: "Granular Role & Manager PIN Controls",
      desc: "Store owners can restrict staff permissions. Cashiers cannot see wholesale supplier purchase costs, modify historic invoices, or apply discounts without authorized manager PIN override.",
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-indigo-600" />,
      title: "Automated Off-Site Backups",
      desc: "Database snapshots are continuously backed up to geographically redundant secure storage facilities with point-in-time recovery to guarantee zero business continuity disruption.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title="StoreGrid Security & Data Protection | Bank-Grade SaaS Isolation"
        description="Learn how StoreGrid protects retail data. Multi-tenant quarantine, TLS 1.3 encryption, role-based cashier PIN controls, and automated daily backups."
        pathname="/security"
        canonical={getCanonicalUrl("/security")}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Security", url: "/security" },
          ]),
        ]}
      />

      <MarketingHeader />

      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Enterprise Security for Kenyan Small Businesses
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We understand that your sales numbers, product margins, and customer ledgers are the lifeblood of your company. Here is how StoreGrid keeps them safe.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityPillars.map((p, i) => (
            <div key={i} className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                {p.icon}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950">{p.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-950">Kenyan Data Protection Act (DPA 2019) Compliance</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            StoreGrid adheres to the principles of the Kenya Data Protection Act 2019. Merchant customer phone numbers, loyalty points, and credit ledger histories are stored exclusively for legitimate merchant operational management and will never be sold, rented, or shared with third-party advertisers.
          </p>
        </div>
      </section>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
