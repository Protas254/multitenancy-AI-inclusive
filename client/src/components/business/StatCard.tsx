import React from "react";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  badge?: React.ReactNode;
  value: string | number | React.ReactNode;
  change?: number; // e.g. 12.5 or -4.2
  periodText?: string; // e.g. "vs yesterday" or "vs last month"
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  badge,
  value,
  change,
  periodText = "vs yesterday",
  icon,
  iconBg = "bg-blue-50 text-blue-600",
  className,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card className={cn("hover:border-slate-300 transition-all shadow-xs", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
            {badge}
          </div>
          {icon && (
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconBg)}>
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        </div>
        {change !== undefined && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md",
                isPositive && "bg-emerald-50 text-emerald-700",
                isNegative && "bg-rose-50 text-rose-700",
                !isPositive && !isNegative && "bg-slate-100 text-slate-600"
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
            <span className="text-slate-400 font-normal">{periodText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
