import React from "react";
import { useParams, Navigate } from "react-router-dom";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { getBreadcrumbSchema, getCanonicalUrl, getFAQSchema } from "@/lib/seo";
import { MarketingHeader, MarketingFooter } from "@/components/layout/MarketingLayout";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { RESOURCES_DATA } from "@/data/resourcesData";
import {
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? RESOURCES_DATA[slug] : null;

  if (!article) {
    return <Navigate to="/resources" replace />;
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.metaDescription,
    author: {
      "@type": "Organization",
      name: "StoreGrid Business Team",
    },
    publisher: {
      "@type": "Organization",
      name: "StoreGrid",
      logo: {
        "@type": "ImageObject",
        url: "https://storegrid.co.ke/storegrid-logo.png",
      },
    },
    datePublished: article.datePublished,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO
        title={article.seoTitle}
        description={article.metaDescription}
        pathname={`/resources/${article.slug}`}
        canonical={getCanonicalUrl(`/resources/${article.slug}`)}
        ogType="article"
        jsonLd={[
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Resources", url: "/resources" },
            { name: article.title, url: `/resources/${article.slug}` },
          ]),
          articleSchema,
          getFAQSchema(article.faqs),
        ]}
      />

      <MarketingHeader activePath="/resources" />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/resources" className="hover:text-slate-900">Resources</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-semibold truncate">{article.title}</span>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Published Nov 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {article.h1}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
            {article.intro}
          </p>

          {/* AEO Direct Answer Box */}
          <div className="mt-6 bg-blue-50/80 border border-blue-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="h-4 w-4" />
              <span>Direct Answer / Summary</span>
            </div>
            <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
              {article.directAnswer}
            </p>
          </div>
        </div>

        {/* Practical Takeaways */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 sm:p-6">
          <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
            Key Practical Takeaways for Your Shop
          </h2>
          <ul className="space-y-2">
            {article.practicalTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Body Sections */}
        <div className="space-y-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs">
          {article.sections.map((sec, idx) => (
            <section key={idx} className="space-y-3 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                {sec.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {sec.content}
              </p>
            </section>
          ))}
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
            {article.faqs.map((faq, index) => (
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

        {/* Related Articles Internal Links */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Related Business Articles
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {article.relatedArticles.map((rel) => (
              <Link
                key={rel.slug}
                href={`/resources/${rel.slug}`}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-colors shadow-xs"
              >
                <span>{rel.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Author & CTA */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold">Ready to streamline your shop operations?</h3>
            <p className="text-xs text-blue-100 max-w-md">
              StoreGrid automates POS, M-PESA reconciliations, and inventory tracking. Try it free for 14 days.
            </p>
          </div>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs h-10 px-5 shadow-sm shrink-0">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </article>

      <MarketingFooter />
      <FloatingWhatsApp phoneNumber="254743849304" />
    </div>
  );
}
