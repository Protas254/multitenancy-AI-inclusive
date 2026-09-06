import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { targetsApi } from "@/lib/api/targets";
import { staffApi } from "@/lib/api/staff";
import { SalesTarget, Staff } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { TargetProgress } from "@/components/business/TargetProgress";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Target, Award, TrendingUp, Calendar, Trash2 } from "lucide-react";

export default function TargetsPage() {
  const { currentTenant } = useTenant();
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTarget, setNewTarget] = useState({
    title: "",
    type: "individual" as "business" | "team" | "individual",
    assignedToStaffId: "",
    targetAmount: 350000,
    period: "monthly" as "daily" | "weekly" | "monthly" | "quarterly",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tData, sData] = await Promise.all([
        targetsApi.getTargets(currentTenant.id),
        staffApi.getStaff(currentTenant.id),
      ]);
      setTargets(tData);
      setStaff(sData);
      if (sData.length > 0) {
        setNewTarget((prev) => ({ ...prev, assignedToStaffId: sData[0].id }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.title || newTarget.targetAmount <= 0) return;
    setIsSubmitting(true);

    try {
      const assignedStaff = staff.find((s) => s.id === newTarget.assignedToStaffId);

      await targetsApi.createTarget({
        tenantId: currentTenant.id,
        title: newTarget.title,
        type: newTarget.type,
        assignedToStaffId: newTarget.type === "individual" ? newTarget.assignedToStaffId : undefined,
        assignedToStaffName: newTarget.type === "individual" ? assignedStaff?.name : undefined,
        targetAmount: Number(newTarget.targetAmount),
        startDate: newTarget.startDate,
        endDate: newTarget.endDate,
        period: newTarget.period,
      });

      setIsAddOpen(false);
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTarget = async (id: string) => {
    await targetsApi.deleteTarget(id);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Sales Targets & Quotas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set company milestones and track individual sales representative quota performance.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Set New Target</span>
        </Button>
      </div>

      {/* Target Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets.map((tgt) => (
          <div key={tgt.id} className="relative group">
            <TargetProgress
              title={tgt.title}
              targetAmount={tgt.targetAmount}
              achievedAmount={tgt.achievedAmount}
              periodLabel={`${formatDate(tgt.startDate)} – ${formatDate(tgt.endDate)}`}
            />
            <button
              onClick={() => handleDeleteTarget(tgt.id)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete target"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Target Performance Table */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold">Target Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Target Name</th>
                <th className="p-3.5">Type & Assignee</th>
                <th className="p-3.5 text-right">Goal</th>
                <th className="p-3.5 text-right">Achieved</th>
                <th className="p-3.5 text-center">Progress</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {targets.map((tgt) => {
                const percent = Math.min(100, Math.round((tgt.achievedAmount / tgt.targetAmount) * 100)) || 0;
                return (
                  <tr key={tgt.id}>
                    <td className="p-3.5 font-semibold text-slate-900">{tgt.title}</td>
                    <td className="p-3.5">
                      <span className="capitalize">{tgt.type}</span>
                      {tgt.assignedToStaffName && (
                        <p className="text-[11px] text-slate-400 font-medium">({tgt.assignedToStaffName})</p>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">{formatKES(tgt.targetAmount)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600">{formatKES(tgt.achievedAmount)}</td>
                    <td className="p-3.5 text-center font-bold font-mono">{percent}%</td>
                    <td className="p-3.5">
                      <StatusBadge status={percent >= 100 ? "completed" : "active"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Set Target Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Create Sales Target</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTarget} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Title</label>
              <Input
                placeholder="e.g. October Sales Milestone"
                value={newTarget.title}
                onChange={(e) => setNewTarget({ ...newTarget, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Scope</label>
                <select
                  value={newTarget.type}
                  onChange={(e) => setNewTarget({ ...newTarget, type: e.target.value as any })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="business">Company Wide</option>
                  <option value="individual">Individual Staff</option>
                </select>
              </div>

              {newTarget.type === "individual" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Assign to Staff</label>
                  <select
                    value={newTarget.assignedToStaffId}
                    onChange={(e) => setNewTarget({ ...newTarget, assignedToStaffId: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Revenue Amount (KES)</label>
              <Input
                type="number"
                min="1000"
                value={newTarget.targetAmount || ""}
                onChange={(e) => setNewTarget({ ...newTarget, targetAmount: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Start Date</label>
                <Input
                  type="date"
                  value={newTarget.startDate}
                  onChange={(e) => setNewTarget({ ...newTarget, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">End Date</label>
                <Input
                  type="date"
                  value={newTarget.endDate}
                  onChange={(e) => setNewTarget({ ...newTarget, endDate: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Set Target
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
