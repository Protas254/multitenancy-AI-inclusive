import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "@/components/ui/link";
import { staffApi } from "@/lib/api/staff";
import { Staff } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mail, Phone, Calendar, Award, DollarSign, Briefcase, TrendingUp } from "lucide-react";
import { SEO } from "@/components/common/SEO";

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    staffApi.getStaffById(id).then((res) => {
      setMember(res);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading staff profile...</div>;
  }

  if (!member) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Staff Member Not Found</h2>
        <Button onClick={() => navigate("/staff")}>Back to Staff</Button>
      </div>
    );
  }

  const target = member.monthlyTarget || 350000;
  const quotaPercent = Math.min(100, Math.round(((member.salesThisMonth || 0) / target) * 100));
  const estimatedCommission = ((member.salesThisMonth || 0) * (member.commissionRate || 0)) / 100;

  return (
    <div className="space-y-6">
      <SEO title={`${member.name} | Staff Profile`} description="Staff member details, targets, sales and payroll" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/staff")} className="gap-1 text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>All Staff</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {member.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{member.name}</h1>
              <StatusBadge status={member.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                <span className="capitalize">{member.role}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {member.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {member.phone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Hired: {member.hireDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compensation and Quotas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Basic Monthly Salary</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{formatKES(member.basicSalary)}</div>
          <p className="text-[11px] text-slate-400">Processed in monthly payroll runs</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sales Quota and Achievement</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{formatKES(member.salesThisMonth || 0)}</div>
          <div className="space-y-1">
            <Progress value={quotaPercent} max={100} indicatorClassName="bg-blue-600" />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Target: {formatKES(target)}</span>
              <span>{quotaPercent}% achieved</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Commission Earned (MTD)</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{formatKES(estimatedCommission)}</div>
          <p className="text-[11px] text-slate-400">Rate: {member.commissionRate}% on verified sales</p>
        </div>
      </div>
    </div>
  );
}
