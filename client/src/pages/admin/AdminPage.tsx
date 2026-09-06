import React, { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { PlatformTenantOverview } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/business/StatCard";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building, DollarSign, Users, TrendingUp, ShieldCheck, CheckCircle2, Ban } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<PlatformTenantOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sData, tData] = await Promise.all([
        adminApi.getPlatformStats(),
        adminApi.getTenants(),
      ]);
      setStats(sData);
      setTenants(tData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "past_due" : "active";
    await adminApi.updateTenantStatus(tenantId, nextStatus);
    loadData();
  };

  if (isLoading || !stats) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading platform metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Superadmin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Recurring Revenue (MRR)</p>
          <span className="text-2xl font-black text-white font-mono">{formatKES(stats.mrr)}</span>
          <p className="text-[10px] text-emerald-400 font-semibold">+18.5% growth</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Tenants</p>
          <span className="text-2xl font-black text-white font-mono">{stats.activeTenants} / {stats.totalTenants}</span>
          <p className="text-[10px] text-slate-400">Churn rate: {stats.churnRate}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform GMV Volume</p>
          <span className="text-2xl font-black text-emerald-400 font-mono">{formatKES(stats.totalSalesVolume)}</span>
          <p className="text-[10px] text-slate-400">Processed across all stores</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">New Onboardings</p>
          <span className="text-2xl font-black text-purple-400 font-mono">+{stats.newTenantsThisMonth} this month</span>
          <p className="text-[10px] text-slate-400">Trial conversion: 78%</p>
        </div>
      </div>

      {/* Tenants Roster Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Registered Business Tenants</h3>
            <p className="text-xs text-slate-400">Manage SaaS subscriptions, tenant limits, and provisioning.</p>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-4">Business & Owner</th>
              <th className="p-4">Category</th>
              <th className="p-4">Plan</th>
              <th className="p-4 text-center">Staff</th>
              <th className="p-4 text-center">Catalog</th>
              <th className="p-4 text-right">GMV Volume</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.ownerName} ({t.ownerEmail})</p>
                </td>
                <td className="p-4 text-slate-300">{t.businessType}</td>
                <td className="p-4">
                  <span className="capitalize font-bold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
                    {t.plan}
                  </span>
                </td>
                <td className="p-4 text-center font-mono">{t.staffCount}</td>
                <td className="p-4 text-center font-mono">{t.productsCount}</td>
                <td className="p-4 text-right font-mono font-bold text-emerald-400">
                  {formatKES(t.totalSalesVolume)}
                </td>
                <td className="p-4">
                  <StatusBadge status={t.status} />
                </td>
                <td className="p-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(t.id, t.status)}
                    className="h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    {t.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
