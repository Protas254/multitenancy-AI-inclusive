import React from "react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { Shield, FileText, Lock } from "lucide-react";

export default function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const pathname = isPrivacy ? "/privacy-policy" : "/terms";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title={`${title} | StoreGrid Business Management`}
        description={`StoreGrid ${title} outlining platform usage, data protection, subscription billing, and merchant rights in Kenya.`}
        pathname={pathname}
        canonical={getCanonicalUrl(pathname)}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: title, url: pathname },
          ]),
        ]}
      />

      <MarketingHeader />

      <section className="py-14 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950">{title}</h1>
          <p className="text-xs text-slate-500">Last updated: November 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {isPrivacy ? (
            <>
              <h2 className="text-base sm:text-lg font-bold text-slate-950">1. Information We Collect</h2>
              <p>
                StoreGrid collects business contact details (name, email, phone number, store name) upon registration. Within the platform, merchants enter product catalogs, transaction logs, cashier names, customer credit details, and supplier records necessary for business operations.
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-950">2. How We Use Your Data</h2>
              <p>
                Your operational data is used strictly to provide the StoreGrid SaaS service: calculating daily reconciliations, processing POS sales, generating financial reports, and ensuring inventory synchronizations. We do not sell or monetize merchant business records.
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-950">3. Data Security and Isolation</h2>
              <p>
                StoreGrid utilizes isolated multi-tenant architecture with encrypted connections (TLS 1.3). Access controls and password-protected PINs prevent unauthorized staff and third parties from viewing your business accounts.
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-950">4. Compliance with Kenyan Law</h2>
              <p>
                StoreGrid operates in compliance with the Kenya Data Protection Act 2019. Merchants maintain full ownership of their data and can export their databases at any time.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-base sm:text-lg font-bold text-slate-950">1. Acceptance of Terms</h2>
              <p>
                By creating a StoreGrid account or accessing the platform, you agree to these Terms of Service. If you are registering on behalf of a company, you represent that you have authority to bind that entity.
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-950">2. Subscriptions and Payments</h2>
              <p>
                StoreGrid offers monthly subscription tiers (Starter, Growth, Enterprise). Subscriptions are payable via M-PESA or bank settlement. Free trial access is provided for 14 days without payment obligation.
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-950">3. Merchant Responsibilities</h2>
              <p>
                Merchants are responsible for maintaining the confidentiality of their account logins and cashier PINs, as well as the lawful use of the software in accordance with Kenyan commercial regulations.
              </p>

              <h2 className="text-base sm:text-lg font-bold text-slate-950">4. Service Availability (SLA)</h2>
              <p>
                StoreGrid targets a 99.9% uptime for cloud point-of-sale services, excluding scheduled maintenance windows announced in advance.
              </p>
            </>
          )}
        </div>
      </div>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
