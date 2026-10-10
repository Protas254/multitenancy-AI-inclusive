import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
  reportsApi,
  SalesReportData,
  FinancialPnLData,
  MonthlyReconciliationSummary,
  CustomerReportData,
  OperationsReportData,
  PayrollReportData,
  ReferralReportData,
} from "@/lib/api/reports";
import { formatKES, formatNumber } from "@/lib/utils";
import { StatCard } from "@/components/business/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Banknote,
  Smartphone,
  Users,
  Package,
  Award,
  CreditCard,
  Building,
} from "lucide-react";

type ReportTab =
  | "overview"
  | "revenue"
  | "customers"
  | "operations"
  | "payroll"
  | "referrals"
  | "reconciliation";

export default function ReportsPage() {
  const { currentTenant } = useTenant();

  // Active Tab - defaults to reconciliation matching the user's focus
  const [activeTab, setActiveTab] = useState<ReportTab>("reconciliation");

  // Filter Dropdown States
  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedRange, setSelectedRange] = useState("Last 12 Months");

  // Reports Data
  const [pnlReport, setPnlReport] = useState<FinancialPnLData | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReportData | null>(null);
  const [reconSummary, setReconSummary] = useState<MonthlyReconciliationSummary[]>([]);
  const [customerReport, setCustomerReport] = useState<CustomerReportData | null>(null);
  const [opsReport, setOpsReport] = useState<OperationsReportData | null>(null);
  const [payrollReport, setPayrollReport] = useState<PayrollReportData | null>(null);
  const [referralReport, setReferralReport] = useState<ReferralReportData | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Modal for Month Drilldown
  const [selectedMonthRecon, setSelectedMonthRecon] = useState<MonthlyReconciliationSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = ["2024", "2025", "2026", "2027"];
  const ranges = ["Last 12 Months", "Last 6 Months", "Last 3 Months", "This Year", "All Time"];

  const loadAllReports = async () => {
    setIsLoading(true);
    try {
      const [pnl, sales, recons, cust, ops, pay, refs] = await Promise.all([
        reportsApi.getFinancialPnL(currentTenant.id),
        reportsApi.getSalesReport(currentTenant.id),
        reportsApi.getMonthlyReconciliationSummary(currentTenant.id, parseInt(selectedYear, 10)),
        reportsApi.getCustomerReport(currentTenant.id),
        reportsApi.getOperationsReport(currentTenant.id),
        reportsApi.getPayrollReport(currentTenant.id),
        reportsApi.getReferralsReport(currentTenant.id),
      ]);
      setPnlReport(pnl);
      setSalesReport(sales);
      setReconSummary(recons);
      setCustomerReport(cust);
      setOpsReport(ops);
      setPayrollReport(pay);
      setReferralReport(refs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, [currentTenant.id, selectedYear]);

  // Format currency with "Ksh" to match the user's UI screenshot
  const formatKsh = (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return "Ksh 0";
    return `Ksh ${Math.abs(Math.round(val)).toLocaleString("en-KE")}`;
  };

  // Format Variance with explicit + or - sign
  const formatVariance = (val: number) => {
    if (val > 0) {
      return <span className="text-[#2563eb] font-semibold">+{formatKsh(val)}</span>;
    }
    if (val < 0) {
      return <span className="text-[#dc2626] font-semibold">-{formatKsh(Math.abs(val))}</span>;
    }
    return <span className="text-[#10b981] font-semibold">Ksh 0</span>;
  };

  // Export to Excel (CSV format)
  const handleExportExcel = () => {
    let csvContent = "";
    let filename = `report_${activeTab}_${selectedMonth}_${selectedYear}.csv`;

    if (activeTab === "reconciliation") {
      filename = `monthly_reconciliation_${selectedYear}.csv`;
      csvContent = "Month,Physical Total,System Total,Variance,Discrepancy Days\n";
      reconSummary.forEach((r) => {
        csvContent += `"${r.month}","${r.physicalTotal}","${r.systemTotal}","${r.variance}","${r.discrepancyDays}"\n`;
      });
    } else if (activeTab === "revenue") {
      filename = `revenue_report_${selectedYear}.csv`;
      csvContent = "Payment Method,Total Amount,Transaction Count\n";
      salesReport?.salesByPaymentMethod.forEach((p) => {
        csvContent += `"${p.method}","${p.total}","${p.count}"\n`;
      });
    } else {
      csvContent = "Report,Value\n";
      csvContent += `"Generated For","${currentTenant.name}"\n`;
      csvContent += `"Date","${new Date().toLocaleDateString()}"\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleRowClick = (item: MonthlyReconciliationSummary) => {
    setSelectedMonthRecon(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pt-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-sm select-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "overview"
                ? "bg-white text-orange-600 border border-orange-200 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "revenue"
                ? "bg-white text-orange-600 border border-orange-200 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "customers"
                ? "bg-white text-orange-600 border border-orange-200 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("operations")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "operations"
                ? "bg-white text-orange-600 border border-orange-200 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Operations
          </button>
          <button
            onClick={() => setActiveTab("payroll")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "payroll"
                ? "bg-white text-orange-600 border border-orange-200 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Payroll
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "referrals"
                ? "bg-white text-orange-600 border border-orange-200 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Referrals
          </button>
          <button
            onClick={() => setActiveTab("reconciliation")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "reconciliation"
                ? "bg-white text-orange-600 border border-orange-200 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Reconciliation
          </button>
        </div>

        {/* Right Action Controls: Month, Year, Range, PDF, Excel */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Year Selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Range Selector */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="appearance-none h-9 pl-8 pr-8 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer max-w-[130px] sm:max-w-none text-ellipsis"
            >
              {ranges.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* PDF Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPDF}
            className="h-9 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200 rounded-lg shadow-xs gap-1.5 bg-white"
          >
            <FileText className="h-4 w-4 text-rose-600" />
            <span>PDF</span>
          </Button>

          {/* Excel Button */}
          <Button
            size="sm"
            onClick={handleExportExcel}
            className="h-9 px-3.5 text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white rounded-lg shadow-xs gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-white" />
            <span>Excel</span>
          </Button>
        </div>
      </div>

      {/* TAB CONTENT: Reconciliation (Star Feature from Screenshot) */}
      {activeTab === "reconciliation" && (
        <Card className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Heading and Subtitle */}
            <h2 className="text-2xl md:text-3xl font-serif text-[#1e293b] font-bold tracking-tight">
              Monthly Reconciliation Summary
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Comparison of reported physical counts vs system records
            </p>

            {/* Reconciliation Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-700">
                    <th className="pb-4 pl-1 font-medium">Month</th>
                    <th className="pb-4 text-center font-medium">Physical Total</th>
                    <th className="pb-4 text-center font-medium">System Total</th>
                    <th className="pb-4 text-center font-medium">Variance</th>
                    <th className="pb-4 text-right pr-2 font-medium">Discrepancy Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-sm">
                  {reconSummary.map((item, idx) => (
                    <tr
                      key={idx}
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Month */}
                      <td className="py-4 pl-1 font-medium text-slate-900 text-xs sm:text-sm">
                        {item.month}
                      </td>

                      {/* Physical Total */}
                      <td className="py-4 text-center text-xs sm:text-sm font-medium text-slate-800">
                        {formatKsh(item.physicalTotal)}
                      </td>

                      {/* System Total */}
                      <td className="py-4 text-center text-xs sm:text-sm font-medium text-slate-800">
                        {formatKsh(item.systemTotal)}
                      </td>

                      {/* Variance */}
                      <td className="py-4 text-center text-xs sm:text-sm">
                        {formatVariance(item.variance)}
                      </td>

                      {/* Discrepancy Days */}
                      <td className="py-4 text-right pr-2">
                        <span className="inline-flex items-center justify-center bg-[#ffedd5]/70 text-[#c2410c] text-xs font-semibold px-3 py-0.5 rounded-full">
                          {item.discrepancyDays}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: Overview */}
      {activeTab === "overview" && pnlReport && (
        <div className="space-y-6">
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

          <Card className="shadow-xs rounded-2xl border border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Monthly Revenue vs Expenses vs Net Profit
              </CardTitle>
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

          <Card className="shadow-xs rounded-2xl border border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">Expenses Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {pnlReport.expensesByCategory.map((exp, idx) => (
                  <div key={idx} className="flex justify-between p-4">
                    <span className="font-semibold text-slate-800">{exp.category}</span>
                    <span className="font-bold text-rose-600 font-mono">-{formatKES(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Revenue */}
      {activeTab === "revenue" && salesReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-xs rounded-2xl border border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">Payment Methods Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {salesReport.salesByPaymentMethod.map((pm, idx) => (
                  <div key={idx} className="flex justify-between p-4">
                    <div>
                      <p className="font-bold uppercase text-slate-900">{pm.method}</p>
                      <p className="text-[10px] text-slate-400">{pm.count} transactions recorded</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{formatKES(pm.total)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs rounded-2xl border border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-900">Daily Sales Volume</CardTitle>
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
      )}

      {/* TAB CONTENT: Customers */}
      {activeTab === "customers" && customerReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Clients"
              value={formatNumber(customerReport.totalCustomers)}
              icon={<Users className="h-5 w-5" />}
              iconBg="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="New This Month"
              value={`+${customerReport.newCustomersThisMonth}`}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Outstanding Credit"
              value={formatKES(customerReport.totalCreditOutstanding)}
              icon={<CreditCard className="h-5 w-5" />}
              iconBg="bg-rose-50 text-rose-600"
            />
            <StatCard
              title="Total Loyalty Points"
              value={formatNumber(customerReport.totalLoyaltyPoints)}
              icon={<Award className="h-5 w-5" />}
              iconBg="bg-amber-50 text-amber-600"
            />
          </div>

          <Card className="rounded-2xl border border-slate-100 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Top Customers by Lifetime Spend</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-5">Customer Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Completed Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Credit Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerReport.topCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No customer transaction records available.
                        </td>
                      </tr>
                    ) : (
                      customerReport.topCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{c.phone}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">{c.ordersCount} orders</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">{formatKES(c.totalSpent)}</td>
                          <td className="py-3.5 px-4 font-bold text-rose-600 font-mono">{formatKES(c.outstandingCredit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Operations */}
      {activeTab === "operations" && opsReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active SKUs"
              value={formatNumber(opsReport.totalProducts)}
              icon={<Package className="h-5 w-5" />}
              iconBg="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Stock Valuation"
              value={formatKES(opsReport.totalStockValue)}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Low Stock Alerts"
              value={formatNumber(opsReport.lowStockItemsCount)}
              icon={<AlertCircle className="h-5 w-5" />}
              iconBg="bg-rose-50 text-rose-600"
            />
            <StatCard
              title="Total Purchases"
              value={formatKES(opsReport.totalPurchasesAmount)}
              icon={<Building className="h-5 w-5" />}
              iconBg="bg-purple-50 text-purple-600"
            />
          </div>

          <Card className="rounded-2xl border border-slate-100 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Inventory Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {opsReport.categoriesBreakdown.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-bold text-slate-900">{c.category}</p>
                      <p className="text-[10px] text-slate-400">{c.count} items in catalog</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{formatKES(c.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Payroll */}
      {activeTab === "payroll" && payrollReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Staff on Payroll"
              value={formatNumber(payrollReport.totalStaff)}
              icon={<Users className="h-5 w-5" />}
              iconBg="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Monthly Gross Payroll"
              value={formatKES(payrollReport.totalMonthlyPayroll)}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-slate-100 text-slate-800"
            />
            <StatCard
              title="Statutory Deductions"
              value={formatKES(payrollReport.totalDeductions)}
              icon={<TrendingDown className="h-5 w-5" />}
              iconBg="bg-rose-50 text-rose-600"
            />
            <StatCard
              title="Net Disbursed Pay"
              value={formatKES(payrollReport.totalNetPay)}
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconBg="bg-emerald-50 text-emerald-600"
            />
          </div>

          <Card className="rounded-2xl border border-slate-100 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Payroll Runs History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {payrollReport.recentRuns.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No payroll runs recorded yet.</div>
                ) : (
                  payrollReport.recentRuns.map((r) => (
                    <div key={r.id} className="flex justify-between items-center p-4">
                      <div>
                        <p className="font-bold text-slate-900">{r.periodMonth}</p>
                        <p className="text-[10px] text-slate-400">{r.totalEmployees} employees • Status: {r.status}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{formatKES(r.totalNet)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Referrals */}
      {activeTab === "referrals" && referralReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Loyalty Members"
              value={formatNumber(referralReport.totalLoyaltyMembers)}
              icon={<Users className="h-5 w-5" />}
              iconBg="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Points Awarded"
              value={formatNumber(referralReport.totalPointsIssued)}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Points Redeemed"
              value={formatNumber(referralReport.totalPointsRedeemed)}
              icon={<Award className="h-5 w-5" />}
              iconBg="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Active Rewards"
              value={formatNumber(referralReport.activeRewardsCount)}
              icon={<Package className="h-5 w-5" />}
              iconBg="bg-purple-50 text-purple-600"
            />
          </div>

          <Card className="rounded-2xl border border-slate-100 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Top Patrons by Loyalty and Referrals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {referralReport.topPatrons.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-amber-600 font-semibold">{p.tier} Tier Member</p>
                    </div>
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      {formatNumber(p.points)} pts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Month Breakdown Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-slate-900">
              {selectedMonthRecon?.month} — Closing Verifications
            </DialogTitle>
          </DialogHeader>

          {selectedMonthRecon && (
            <div className="space-y-4 text-xs mt-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400">Reported Physical Count</p>
                  <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {formatKsh(selectedMonthRecon.physicalTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">System Recorded Total</p>
                  <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {formatKsh(selectedMonthRecon.systemTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Net Variance</p>
                  <p className="text-base font-bold font-mono mt-0.5">
                    {formatVariance(selectedMonthRecon.variance)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Discrepancy Ratio</p>
                  <p className="text-base font-bold text-orange-700 mt-0.5">
                    {selectedMonthRecon.discrepancyDays} recorded days
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Daily Closing Logs</h4>
                {selectedMonthRecon.logs && selectedMonthRecon.logs.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {selectedMonthRecon.logs.map((log) => (
                      <div key={log.id} className="p-3 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>{log.date}</span>
                          <span className="font-mono text-blue-600">
                            {formatKsh((log.actualCash || 0) + (log.mpesaActual || 0))}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Cash: {formatKsh(log.actualCash)} • M-Pesa: {formatKsh(log.mpesaActual)} • Staff: {log.reconciledBy}
                        </p>
                        {log.notes && (
                          <p className="text-[10px] text-slate-400 italic">"{log.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    Historical aggregated baseline closing records for {selectedMonthRecon.month}. Detailed daily logs are archived in safe deposit register.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
