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
import { FEATURES_DATA } from "@/data/featuresData";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FeatureDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const feature = slug ? FEATURES_DATA[slug] : null;

  if (!feature) {
    return <Navigate to="/features" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title={feature.seoTitle}
        description={feature.metaDescription}
        pathname={`/features/${feature.slug}`}
        canonical={getCanonicalUrl(`/features/${feature.slug}`)}
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Features", url: "/features" },
            { name: feature.title, url: `/features/${feature.slug}` },
          ]),
          getSoftwareApplicationSchema(),
          getFAQSchema(feature.faqs),
        ]}
      />

      <MarketingHeader activePath="/features" />

      {/* Breadcrumb nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/features" className="hover:text-slate-900">Features</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-semibold truncate">{feature.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {feature.h1}
          </h1>

          {/* AEO Direct Answer Box */}
          <div className="mt-6 text-left bg-blue-50/70 border border-blue-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="h-4 w-4" />
              <span>Direct Answer</span>
            </div>
            <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
              {feature.directAnswer}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-6 shadow-sm">
                Try {feature.title} Free (14 Days)
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs h-11 px-6">
                See Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-12">
        <div className="space-y-10">
          {feature.sections.map((section, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                {section.heading}
              </h2>
              {section.subheading && (
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {section.subheading}
                </p>
              )}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {section.content}
              </p>
              {section.bulletPoints && (
                <ul className="space-y-2 pt-2">
                  {section.bulletPoints.map((point, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Workflow steps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mb-2">
            How {feature.title} Works in Practice
          </h2>
          <p className="text-xs text-slate-500 mb-8">
            Simple 3-step operational workflow for store staff and business owners.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feature.workflows.map((wf) => (
              <div key={wf.step} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="inline-block text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Step {wf.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{wf.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{wf.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Features Internal Links for SEO Crawl Equity */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Related Business Features
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {feature.relatedFeatures.map((rel) => (
              <Link
                key={rel.slug}
                href={`/features/${rel.slug}`}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-colors shadow-xs"
              >
                <span>{rel.title}</span>
              </Link>
            ))}
            <Link
              href="/pricing"
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <span>View Pricing</span>
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {feature.faqs.map((faq, index) => (
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
          <h2 className="text-2xl font-extrabold">Ready to implement {feature.title}?</h2>
          <p className="text-xs text-slate-400">
            Start your 14-day free trial now. Full access to all StoreGrid features, no credit card required.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6">
                Start Free Trial Now
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
