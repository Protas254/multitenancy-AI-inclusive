import React from "react";
import { Progress } from "../ui/progress";
import { formatKES } from "@/lib/utils";
import { Target, Award, ArrowUpRight } from "lucide-react";

interface TargetProgressProps {
  title?: string;
  targetAmount: number;
  achievedAmount: number;
  periodLabel?: string;
}

export const TargetProgress: React.FC<TargetProgressProps> = ({
  title = "Monthly Sales Target",
  targetAmount,
  achievedAmount,
  periodLabel = "September 2026",
}) => {
  const percentage = Math.min(100, Math.round((achievedAmount / targetAmount) * 100)) || 0;
  const remaining = Math.max(0, targetAmount - achievedAmount);

  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
            <p className="text-xs text-slate-400">{periodLabel}</p>
          </div>
        </div>
        <span className="text-xl font-black text-blue-600 font-mono">{percentage}%</span>
      </div>

      <div className="space-y-1.5">
        <Progress value={percentage} max={100} indicatorClassName={percentage >= 100 ? "bg-emerald-600" : "bg-blue-600"} />
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-900 font-semibold">{formatKES(achievedAmount)}</span>
          <span className="text-slate-400">Target: {formatKES(targetAmount)}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
        <span>{remaining > 0 ? `${formatKES(remaining)} remaining` : "Target achieved! 🎉"}</span>
        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
          {percentage >= 70 ? "On Track 🚀" : "Requires Push ⚠️"}
        </span>
      </div>
    </div>
  );
};
