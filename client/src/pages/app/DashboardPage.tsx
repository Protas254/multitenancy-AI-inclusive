import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { StatCard } from "@/components/business/StatCard";
import { TargetProgress } from "@/components/business/TargetProgress";
import { DailyReconciliationCard } from "@/components/business/DailyReconciliationCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Receipt,
  ArrowRight,
  Loader2,
  Lock,
  Eye,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatKES } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { useSecurity } from "@/contexts/SecurityContext";
import { ManagerPasscodeModal } from "@/components/business/ManagerPasscodeModal";

interface DashboardStats {
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  todayOrders: number;
  chartData7d: { date: string; sales: number; expenses: number; profit: number }[];
  chartData30d: { date: string; sales: number; expenses: number; profit: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number; category: string }[];
  target: {
    title: string;
    targetAmount: number;
    achievedAmount: number;
    periodLabel: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const { isProtectionEnabled, isUnlocked, lock } = useSecurity();
  const [chartPeriod, setChartPeriod] = useState<"7d" | "30d" | "3m">("7d");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedByPin, setRevealedByPin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Financial metrics (Profit & Loss, Expenses) require PIN when protection is enabled
  const canViewFinancials = !isProtectionEnabled || isUnlocked || revealedByPin;

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setLoading(true);
        const data = await apiClient.get<DashboardStats>("/dashboard/stats/");
        if (isMounted && data) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [currentTenant?.id]);

  const chartData7d = stats?.chartData7d || [];
  const chartData30d = stats?.chartData30d || [];
  const chartData = chartPeriod === "7d" ? chartData7d : chartData30d;

  const topProducts = stats?.topProducts || [];

  const todaySales = stats?.todaySales ?? 0;
  const todayExpenses = stats?.todayExpenses ?? 0;
  const todayProfit = stats?.todayProfit ?? 0;
  const todayOrders = stats?.todayOrders ?? 0;

  const profitMargin = todaySales > 0 ? ((todayProfit / todaySales) * 100).toFixed(1) : "0.0";
  const avgOrderVal = todayOrders > 0 ? Math.round(todaySales / todayOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Good morning, {user?.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is how <strong className="text-slate-800">{currentTenant?.name || "Store"}</strong> is performing today.
            {!canViewFinancials && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Lock className="h-3 w-3" /> Staff View (Profit &amp; Expenses Protected)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canViewFinancials && isProtectionEnabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRevealedByPin(false);
                lock();
              }}
              className="gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs"
            >
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <span>Lock Financials</span>
            </Button>
          )}
          <Link href="/pos">
            <Button size="sm" className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Receipt className="h-4 w-4" />
              <span>Open POS Terminal</span>
            </Button>
          </Link>
          <Link href="/sales">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <ShoppingCart className="h-4 w-4 text-slate-500" />
              <span>Record Sale</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-slate-500 font-medium">Loading live store metrics...</span>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Sales"
              value={formatKES(todaySales)}
              change={0}
              periodText="Live total"
              icon={<ShoppingCart className="h-5 w-5" />}
              iconBg="bg-blue-50 text-blue-600"
            />

            {/* Expenses Card - Protected from Employees */}
            <StatCard
              title="Today's Expenses"
              value={
                canViewFinancials ? (
                  formatKES(todayExpenses)
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-slate-900">KES</span>
                    <button
                      type="button"
                      onClick={() => setIsPinModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition-all shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-600" />
                      <span>Unlock View</span>
                    </button>
                  </div>
                )
              }
              change={0}
              periodText={canViewFinancials ? "Live total" : "Protected with PIN · tap to unlock"}
              icon={canViewFinancials ? <TrendingDown className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              iconBg={canViewFinancials ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"}
            />

            {/* Estimated Net Profit - Protected from Employees */}
            <StatCard
              title="Net Profit"
              badge={
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
                  ✓ Net
                </span>
              }
              value={
                canViewFinancials ? (
                  formatKES(todayProfit)
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-slate-900">KES</span>
                    <button
                      type="button"
                      onClick={() => setIsPinModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition-all shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-600" />
                      <span>Unlock View</span>
                    </button>
                  </div>
                )
              }
              change={0}
              periodText={canViewFinancials ? `margin: ${profitMargin}%` : "Gross profit minus expenses"}
              icon={canViewFinancials ? <TrendingUp className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              iconBg={canViewFinancials ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}
            />

            <StatCard
              title="Total Orders Completed"
              value={String(todayOrders)}
              change={0}
              periodText={`avg: ${formatKES(avgOrderVal)} / order`}
              icon={<Receipt className="h-5 w-5" />}
              iconBg="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Daily Multi-Business Reconciliations (Only visible if authorized) */}
          {canViewFinancials ? (
            <DailyReconciliationCard />
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cashier POS Active &bull; Shift Logged In</h4>
                  <p className="text-[11px] text-slate-500">
                    Your register is actively logging transactions. Store financial totals are protected by Store Policy.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPinModalOpen(true)}
                className="text-xs font-bold gap-1.5 bg-white border-blue-200 text-blue-700"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Manager Reveal</span>
              </Button>
            </div>
          )}

          {/* Manager PIN Modal */}
          <ManagerPasscodeModal
            isOpen={isPinModalOpen}
            onClose={() => setIsPinModalOpen(false)}
            onSuccess={() => setRevealedByPin(true)}
            title="Reveal Financial KPIs"
            description="Enter the store manager or owner 4-digit PIN to reveal today's expenses and net profit margins."
            actionName="Reveal Financials"
          />

          {/* Main Charts and Targets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Performance Chart (2 cols) */}
            <Card className="lg:col-span-2 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-bold">Revenue and Profit Performance</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">Track daily sales velocity and net profit</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setChartPeriod("7d")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      chartPeriod === "7d" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setChartPeriod("30d")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      chartPeriod === "30d" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    This Month
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `KES ${val / 1000}k`}
                        />
                        <Tooltip
                          formatter={(val: any) => [formatKES(val), ""]}
                          contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                        />
                        <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                        <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      No sales history recorded yet for this period
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                    <span className="text-slate-600 font-medium">Sales Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 font-medium">Estimated Net Profit</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Monthly Sales Target and Top Performing Products */}
            <div className="space-y-6">
              <TargetProgress
                title={stats?.target?.title || "Monthly Sales Target"}
                targetAmount={stats?.target?.targetAmount || 1000000}
                achievedAmount={stats?.target?.achievedAmount || 0}
                periodLabel={stats?.target?.periodLabel || "Current Period"}
              />

              {/* Top Selling Products */}
              <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-bold">Top Performing Products</CardTitle>
                  <Link href="/products" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    <span>View Catalog</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 text-xs">
                    {topProducts.length > 0 ? (
                      topProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50/70 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="h-5 w-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.category}</p>
                            </div>
                          </div>
                          <div className="text-right pl-2">
                            <p className="font-bold text-slate-900">{formatKES(p.revenue)}</p>
                            <p className="text-[10px] text-slate-400">{p.unitsSold} sold</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No product sales recorded yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
