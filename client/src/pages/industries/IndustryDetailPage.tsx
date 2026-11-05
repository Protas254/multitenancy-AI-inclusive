import React from "react";
import { useParams, Navigate } from "react-router-dom";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import {
  getBreadcrumbSchema,
  getCanonicalUrl,
  getFAQSchema,
  getSoftwareApplicationSchema,
} from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { INDUSTRIES_DATA } from "@/data/industriesData";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function IndustryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? INDUSTRIES_DATA[slug] : null;

  if (!industry) {
    return <Navigate to="/industries" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title={industry.seoTitle}
        description={industry.metaDescription}
        pathname={`/industries/${industry.slug}`}
        canonical={getCanonicalUrl(`/industries/${industry.slug}`)}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Industries", url: "/industries" },
            { name: industry.name, url: `/industries/${industry.slug}` },
          ]),
          getSoftwareApplicationSchema(),
          getFAQSchema(industry.faqs),
        ]}
      />

      <MarketingHeader activePath="/industries" />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/industries" className="hover:text-slate-900">Industries</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-semibold truncate">{industry.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {industry.h1}
          </h1>

          {/* AEO Direct Answer */}
          <div className="mt-6 text-left bg-blue-50/70 border border-blue-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="h-4 w-4" />
              <span>Direct Overview</span>
            </div>
            <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
              {industry.directAnswer}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-6 shadow-sm">
                Start 14-Day Free Trial
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs h-11 px-6">
                Recommended: {industry.recommendedPlan}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Operational Challenges & Solutions */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-12">
        {/* Real Challenges */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Common Operational Pitfalls in {industry.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industry.challenges.map((c, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How StoreGrid Solves It */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mb-6">
            Key StoreGrid Capabilities for {industry.name}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {industry.keyFeatures.map((kf, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-1.5 mb-3">
                  <h3 className="text-sm font-bold text-slate-900">{kf.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{kf.description}</p>
                </div>
                <Link
                  href={`/features/${kf.slug}`}
                  className="flex items-center justify-center pt-2 border-t border-slate-100 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <span>Learn how {kf.title} works</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Typical Daily Workflow */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mb-2">
            A Typical Day in {industry.name} with StoreGrid
          </h2>
          <p className="text-xs text-slate-500 mb-8">
            How staff and management utilize StoreGrid from morning till night.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {industry.typicalWorkflow.map((wf) => (
              <div key={wf.step} className="p-5 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-2">
                <span className="inline-block text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Phase {wf.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{wf.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{wf.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              {industry.name} Software FAQs
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {industry.faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-slate-200 rounded-xl px-4 py-1 data-[state=open]:bg-slate-50/50"
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

      {/* CTA Footer banner */}
      <section className="py-14 bg-slate-900 text-white text-center px-4 mt-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-extrabold">Transform your {industry.name} business</h2>
          <p className="text-xs text-slate-400">
            Recommended plan: <strong className="text-white">{industry.recommendedPlan}</strong>. Try it free for 14 days.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6">
                Start 14-Day Free Trial
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
