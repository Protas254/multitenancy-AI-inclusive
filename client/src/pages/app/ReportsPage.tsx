import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { reportsApi, SalesReportData, FinancialPnLData } from "@/lib/api/reports";
import { formatKES, formatNumber, formatPercentage } from "@/lib/utils";
import { StatCard } from "@/components/business/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Download, Printer, Calendar } from "lucide-react";

export default function ReportsPage() {
  const { currentTenant } = useTenant();
  const [salesReport, setSalesReport] = useState<SalesReportData | null>(null);
  const [pnlReport, setPnlReport] = useState<FinancialPnLData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, pnlData] = await Promise.all([
        reportsApi.getSalesReport(currentTenant.id),
        reportsApi.getFinancialPnL(currentTenant.id),
      ]);
      setSalesReport(salesData);
      setPnlReport(pnlData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

  if (isLoading || !salesReport || !pnlReport) {
    return <div className="p-8 text-center text-xs text-slate-500">Generating analytics reports...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Reports & Business Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial P&L statements, sales velocity metrics, and category margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs font-semibold">
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Tabs: Sales, P&L Statement, Staff Performance */}
      <Tabs defaultValue="pnl" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pnl">Profit & Loss (P&L)</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="staff">Staff & Team Output</TabsTrigger>
        </TabsList>

        {/* TAB 1: P&L Statement */}
        <TabsContent value="pnl" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Gross Revenue"
              value={formatKES(pnlReport.grossRevenue)}
              change={14.2}
              periodText="vs last month"
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Cost of Goods (COGS)"
              value={formatKES(pnlReport.cogs)}
              icon={<TrendingDown className="h-5 w-5" />}
              iconBg="bg-slate-100 text-slate-700"
            />
            <StatCard
              title="Gross Profit"
              value={formatKES(pnlReport.grossProfit)}
              change={pnlReport.grossMarginPercent}
              periodText="gross margin"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Net Business Profit"
              value={formatKES(pnlReport.netProfit)}
              change={pnlReport.netMarginPercent}
              periodText="net margin"
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Cashflow Timeline Chart */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Monthly Revenue vs Expenses vs Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlReport.cashFlowTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickFormatter={(val) => `KES ${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatKES(val), ""]}
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar dataKey="revenue" name="Gross Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="net" name="Net Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Breakdown */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Expenses Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {pnlReport.expensesByCategory.map((exp, idx) => (
                  <div key={idx} className="flex justify-between p-3.5">
                    <span className="font-semibold text-slate-800">{exp.category}</span>
                    <span className="font-bold text-rose-600 font-mono">-{formatKES(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Sales Analytics */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales by Payment Method */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Payment Methods Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {salesReport.salesByPaymentMethod.map((pm, idx) => (
                    <div key={idx} className="flex justify-between p-3.5">
                      <div>
                        <p className="font-bold uppercase text-slate-900">{pm.method}</p>
                        <p className="text-[10px] text-slate-400">{pm.count} transactions</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{formatKES(pm.total)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales Velocity Timeline */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Daily Sales Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesReport.salesTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickFormatter={(val) => `KES ${val / 1000}k`}
                      />
                      <Tooltip formatter={(val: any) => [formatKES(val), "Sales"]} />
                      <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} fill="#dbeafe" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Staff Leaderboards */}
        <TabsContent value="staff" className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Sales Generated by Cashier / Staff</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {salesReport.salesByStaff.map((st, idx) => (
                  <div key={idx} className="flex justify-between p-3.5">
                    <div>
                      <p className="font-bold text-slate-900">{st.staffName}</p>
                      <p className="text-[10px] text-slate-400">{st.count} completed checkout orders</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-sm">{formatKES(st.total)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
