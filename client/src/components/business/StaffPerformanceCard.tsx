import React from "react";
import { Staff } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { Award, TrendingUp } from "lucide-react";
import { Progress } from "../ui/progress";

interface StaffPerformanceCardProps {
  staff: Staff[];
}

export const StaffPerformanceCard: React.FC<StaffPerformanceCardProps> = ({ staff }) => {
  const sortedStaff = [...staff].sort((a, b) => b.salesThisMonth - a.salesThisMonth);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Staff Sales Leaderboard</h3>
          <p className="text-xs text-slate-400">Current Month Performance</p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Award className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-3.5">
        {sortedStaff.map((member, index) => {
          const target = member.monthlyTarget || 350000;
          const percent = Math.min(100, Math.round((member.salesThisMonth / target) * 100));

          return (
            <div key={member.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 font-bold text-[10px] text-slate-600">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-900">{member.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">({member.role})</span>
                </div>
                <span className="font-bold text-slate-900">{formatKES(member.salesThisMonth)}</span>
              </div>
              <Progress
                value={percent}
                max={100}
                indicatorClassName={index === 0 ? "bg-amber-500" : "bg-blue-600"}
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{percent}% of monthly quota</span>
                {member.commissionRate > 0 && (
                  <span className="text-emerald-600 font-medium">
                    Est. Comm: {formatKES((member.salesThisMonth * member.commissionRate) / 100)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
