import React, { useState } from "react";
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [chartPeriod, setChartPeriod] = useState<"7d" | "30d" | "3m">("7d");

  // Chart datasets
  const chartData7d = [
    { date: "Mon 26", sales: 38000, expenses: 8000, profit: 30000 },
    { date: "Tue 27", sales: 42000, expenses: 9500, profit: 32500 },
    { date: "Wed 28", sales: 51000, expenses: 14500, profit: 36500 },
    { date: "Thu 29", sales: 48000, expenses: 7200, profit: 40800 },
    { date: "Fri 30", sales: 64000, expenses: 11000, profit: 53000 },
    { date: "Sat 31", sales: 58000, expenses: 9000, profit: 49000 },
    { date: "Today", sales: 45600, expenses: 8400, profit: 37200 },
  ];

  const chartData30d = [
    { date: "Week 1", sales: 165000, expenses: 38000, profit: 127000 },
    { date: "Week 2", sales: 184000, expenses: 42000, profit: 142000 },
    { date: "Week 3", sales: 195000, expenses: 45000, profit: 150000 },
    { date: "Week 4", sales: 176000, expenses: 40000, profit: 136000 },
  ];

  const chartData = chartPeriod === "7d" ? chartData7d : chartData30d;

  // Top selling products mockup
  const topProducts = [
    { name: "Classic Italian 2-Piece Slim Suit", unitsSold: 125, revenue: 125000, category: "Men's Formal" },
    { name: "Handcrafted Leather Oxford Shoes", unitsSold: 98, revenue: 98000, category: "Footwear" },
    { name: "Floral Wrap Silk Midi Dress", unitsSold: 76, revenue: 76000, category: "Women's Casual" },
    { name: "Egyptian Cotton Oxford Dress Shirt", unitsSold: 64, revenue: 64000, category: "Men's Formal" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Good morning, {user?.name?.split(" ")[0] || "John"} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is how <strong className="text-slate-800">{currentTenant.name}</strong> is performing today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatKES(45600)}
          change={12.5}
          periodText="vs yesterday"
          icon={<ShoppingCart className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Today's Expenses"
          value={formatKES(8400)}
          change={-4.2}
          periodText="vs yesterday"
          icon={<TrendingDown className="h-5 w-5" />}
          iconBg="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Estimated Net Profit"
          value={formatKES(37200)}
          change={15.3}
          periodText="margin: 81.5%"
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Orders Completed"
          value="47"
          change={8.4}
          periodText="avg: KES 970 / order"
          icon={<Receipt className="h-5 w-5" />}
          iconBg="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Daily Multi-Business Reconciliations */}
      <DailyReconciliationCard />

      {/* Main Charts & Targets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart (2 cols) */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold">Revenue & Profit Performance</CardTitle>
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

        {/* Right Column: Monthly Sales Target & Top Performing Products */}
        <div className="space-y-6">
          <TargetProgress
            title="September Company Target"
            targetAmount={1000000}
            achievedAmount={720000}
            periodLabel="1 Sep – 30 Sep 2026"
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
                {topProducts.map((p, idx) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
