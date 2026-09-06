import React from "react";
import { Sparkles, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import Link from "@/components/ui/link";

interface InsightBannerProps {
  insights: {
    type: "insight" | "warning" | "alert" | "target";
    title: string;
    description: string;
    linkUrl?: string;
    linkText?: string;
  }[];
}

export const InsightBanner: React.FC<InsightBannerProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {insights.map((item, idx) => {
        let bg = "bg-blue-50/70 border-blue-100 text-blue-900";
        let icon = <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />;

        if (item.type === "warning") {
          bg = "bg-amber-50/70 border-amber-100 text-amber-900";
          icon = <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />;
        } else if (item.type === "alert") {
          bg = "bg-rose-50/70 border-rose-100 text-rose-900";
          icon = <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />;
        } else if (item.type === "target") {
          bg = "bg-emerald-50/70 border-emerald-100 text-emerald-900";
          icon = <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />;
        }

        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${bg}`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-bold uppercase tracking-wider">{item.title}</span>
              </div>
              <p className="text-xs text-slate-700 leading-snug">{item.description}</p>
            </div>
            {item.linkUrl && (
              <Link
                href={item.linkUrl}
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:underline"
              >
                <span>{item.linkText || "View Details"}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};
