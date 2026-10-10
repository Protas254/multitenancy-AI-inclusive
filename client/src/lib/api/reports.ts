import { Sale, Expense, Product, Customer, PayrollRun } from "../types";
import { apiClient } from "./client";
import { salesApi } from "./sales";
import { expensesApi } from "./expenses";
import { productsApi } from "./products";
import { customersApi } from "./customers";
import { payrollApi } from "./payroll";
import { loyaltyApi } from "./loyalty";
import { reconciliationsApi } from "./reconciliations";
import { purchasesApi } from "./purchases";

export interface SalesReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByPaymentMethod: { method: string; total: number; count: number }[];
  salesByStaff: { staffName: string; total: number; count: number }[];
  salesByCategory: { categoryName: string; total: number }[];
  salesTimeline: { date: string; amount: number; orders: number }[];
}

export interface FinancialPnLData {
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  totalExpenses: number;
  netProfit: number;
  netMarginPercent: number;
  expensesByCategory: { category: string; amount: number }[];
  cashFlowTimeline: { date: string; revenue: number; expense: number; net: number }[];
}

export interface MonthlyReconciliationSummary {
  month: string;
  year: number;
  monthName: string;
  physicalTotal: number;
  systemTotal: number;
  variance: number;
  discrepancyDays: string;
  reconciledDays: number;
  discrepancyCount: number;
  logs?: any[];
}

export interface CustomerReportData {
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalCreditOutstanding: number;
  totalLoyaltyPoints: number;
  topCustomers: {
    id: string;
    name: string;
    phone: string;
    totalSpent: number;
    ordersCount: number;
    outstandingCredit: number;
  }[];
}

export interface OperationsReportData {
  totalProducts: number;
  totalStockValue: number;
  totalStockQuantity: number;
  lowStockItemsCount: number;
  totalPurchases: number;
  totalPurchasesAmount: number;
  categoriesBreakdown: { category: string; count: number; value: number }[];
}

export interface PayrollReportData {
  totalStaff: number;
  totalMonthlyPayroll: number;
  totalDeductions: number;
  totalNetPay: number;
  recentRuns: PayrollRun[];
}

export interface ReferralReportData {
  totalLoyaltyMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeRewardsCount: number;
  topPatrons: {
    name: string;
    points: number;
    tier: string;
  }[];
}

export const reportsApi = {
  async getSalesReport(tenantId: string = "tenant-fashion"): Promise<SalesReportData> {
    const sales = await salesApi.getSales(tenantId);
    const validSales = sales.filter((s) => s.status === "completed");

    const totalRevenue = validSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalOrders = validSales.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Payment methods aggregation
    const pmMap: Record<string, { total: number; count: number }> = {};
    validSales.forEach((s) => {
      const pm = s.paymentMethod.toUpperCase();
      if (!pmMap[pm]) pmMap[pm] = { total: 0, count: 0 };
      pmMap[pm].total += s.totalAmount;
      pmMap[pm].count += 1;
    });
    const salesByPaymentMethod = Object.entries(pmMap).map(([method, data]) => ({ method, ...data }));

    // Staff aggregation
    const staffMap: Record<string, { total: number; count: number }> = {};
    validSales.forEach((s) => {
      if (!staffMap[s.staffName]) staffMap[s.staffName] = { total: 0, count: 0 };
      staffMap[s.staffName].total += s.totalAmount;
      staffMap[s.staffName].count += 1;
    });
    const salesByStaff = Object.entries(staffMap).map(([staffName, data]) => ({ staffName, ...data }));

    // Category aggregation
    const products = await productsApi.getProducts(tenantId).catch(() => []);
    const prodMap = new Map(products.map((p) => [p.id, p.categoryName || "General"]));
    const catMap: Record<string, number> = {};
    validSales.forEach((s) => {
      s.items.forEach((item) => {
        const cat = prodMap.get(item.productId) || "General";
        catMap[cat] = (catMap[cat] || 0) + item.total;
      });
    });
    const salesByCategory = Object.entries(catMap).map(([categoryName, total]) => ({ categoryName, total }));

    const timelineMap: Record<string, { amount: number; orders: number }> = {};
    validSales.forEach((s) => {
      const saleDate = s.date || s.createdAt;
      const d = saleDate ? new Date(saleDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "Today";
      if (!timelineMap[d]) timelineMap[d] = { amount: 0, orders: 0 };
      timelineMap[d].amount += s.totalAmount;
      timelineMap[d].orders += 1;
    });
    const salesTimeline = Object.entries(timelineMap).map(([date, data]) => ({
      date,
      amount: data.amount,
      orders: data.orders,
    }));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      salesByPaymentMethod,
      salesByStaff,
      salesByCategory,
      salesTimeline,
    };
  },

  async getFinancialPnL(tenantId: string = "tenant-fashion"): Promise<FinancialPnLData> {
    const sales = await salesApi.getSales(tenantId);
    const expenses = await expensesApi.getExpenses(tenantId);

    const validSales = sales.filter((s) => s.status === "completed");
    const grossRevenue = validSales.reduce((sum, s) => sum + s.totalAmount, 0);
    
    // Calculate COGS
    let cogs = 0;
    validSales.forEach((s) => {
      s.items.forEach((i) => {
        cogs += (i.buyingPrice || i.unitPrice * 0.5) * i.quantity;
      });
    });

    const grossProfit = grossRevenue - cogs;
    const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;
    const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    const expMap: Record<string, number> = {};
    expenses.forEach((e) => {
      expMap[e.category] = (expMap[e.category] || 0) + e.amount;
    });
    const expensesByCategory = Object.entries(expMap).map(([category, amount]) => ({ category, amount }));

    const cfMap: Record<string, { revenue: number; expense: number }> = {};
    validSales.forEach((s) => {
      const saleDate = s.date || s.createdAt;
      const m = saleDate ? new Date(saleDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Current";
      if (!cfMap[m]) cfMap[m] = { revenue: 0, expense: 0 };
      cfMap[m].revenue += s.totalAmount;
    });
    expenses.forEach((e) => {
      const m = e.date ? new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Current";
      if (!cfMap[m]) cfMap[m] = { revenue: 0, expense: 0 };
      cfMap[m].expense += e.amount;
    });
    const cashFlowTimeline = Object.entries(cfMap).map(([date, val]) => ({
      date,
      revenue: val.revenue,
      expense: val.expense,
      net: val.revenue - val.expense,
    }));

    return {
      grossRevenue,
      cogs,
      grossProfit,
      grossMarginPercent,
      totalExpenses,
      netProfit,
      netMarginPercent,
      expensesByCategory,
      cashFlowTimeline,
    };
  },

  async getMonthlyReconciliationSummary(
    tenantId?: string,
    selectedYear: number = 2026,
    _range: string = "12"
  ): Promise<MonthlyReconciliationSummary[]> {
    try {
      const serverData = await apiClient.get<any[]>(`/reports/monthly-reconciliation/?year=${selectedYear}`);
      if (Array.isArray(serverData) && serverData.length > 0) {
        return serverData.map((item) => {
          const [disc, total] = (item.discrepancyRatio || "0/0").split("/").map(Number);
          return {
            month: item.month,
            year: selectedYear,
            monthName: item.month.split(" ")[0],
            physicalTotal: item.physicalTotal || 0,
            systemTotal: item.systemTotal || 0,
            variance: item.variance || 0,
            discrepancyDays: item.discrepancyRatio || "0/0",
            reconciledDays: total || 0,
            discrepancyCount: disc || 0,
            logs: [],
          };
        });
      }
    } catch (e) {
      console.warn("Failed to fetch monthly reconciliation report from API:", e);
    }

    // Direct aggregation from live daily reconciliation endpoint
    const dailyLogs = await reconciliationsApi.getDailyReconciliations(tenantId);
    const liveByMonth: Record<string, { physical: number; system: number; discDays: number; totalDays: number; logs: any[] }> = {};

    dailyLogs.forEach((log) => {
      const date = new Date(log.date);
      if (isNaN(date.getTime())) return;
      const monthStr = date.toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!liveByMonth[monthStr]) {
        liveByMonth[monthStr] = { physical: 0, system: 0, discDays: 0, totalDays: 0, logs: [] };
      }
      const reported = (log.actualCash || 0) + (log.mpesaActual || 0) + (log.cardActual || 0);
      const expected = (log.cashSales || 0) + (log.mpesaExpected || 0) + (log.cardExpected || 0);
      liveByMonth[monthStr].physical += reported;
      liveByMonth[monthStr].system += expected;
      liveByMonth[monthStr].totalDays += 1;
      if (log.status === "discrepancy" || Math.abs(reported - expected) > 5) {
        liveByMonth[monthStr].discDays += 1;
      }
      liveByMonth[monthStr].logs.push(log);
    });

    return Object.entries(liveByMonth).map(([mStr, data]) => {
      const variance = data.physical - data.system;
      const discrepancyDays = `${data.discDays}/${data.totalDays}`;
      return {
        month: mStr,
        year: parseInt(mStr.split(" ")[1], 10) || selectedYear,
        monthName: mStr.split(" ")[0],
        physicalTotal: data.physical,
        systemTotal: data.system,
        variance,
        discrepancyDays,
        reconciledDays: data.totalDays,
        discrepancyCount: data.discDays,
        logs: data.logs,
      };
    });
  },

  async getCustomerReport(tenantId: string = "tenant-fashion"): Promise<CustomerReportData> {
    const customers = await customersApi.getCustomers(tenantId);
    const totalCustomers = customers.length;
    const totalCreditOutstanding = customers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

    const topCustomers = [...customers]
      .sort((a, b) => (b.totalPurchases || 0) - (a.totalPurchases || 0))
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "—",
        totalSpent: c.totalPurchases || 0,
        ordersCount: c.orderCount || 0,
        outstandingCredit: c.outstandingCredit || 0,
      }));

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newCustomersThisMonth = customers.filter((c) => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return {
      totalCustomers,
      newCustomersThisMonth,
      totalCreditOutstanding,
      totalLoyaltyPoints,
      topCustomers,
    };
  },

  async getOperationsReport(tenantId: string = "tenant-fashion"): Promise<OperationsReportData> {
    const products = await productsApi.getProducts(tenantId);
    const purchases = await purchasesApi.getPurchases(tenantId);

    const totalProducts = products.length;
    const totalStockQuantity = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
    const totalStockValue = products.reduce((sum, p) => sum + (p.buyingPrice || 0) * (p.currentStock || 0), 0);
    const lowStockItemsCount = products.filter((p) => (p.currentStock || 0) <= (p.minStockLevel || 5)).length;

    const totalPurchases = purchases.length;
    const totalPurchasesAmount = purchases.reduce((sum, po) => sum + po.totalAmount, 0);

    const catMap: Record<string, { count: number; value: number }> = {};
    products.forEach((p) => {
      const cat = p.categoryName || "General";
      if (!catMap[cat]) catMap[cat] = { count: 0, value: 0 };
      catMap[cat].count += 1;
      catMap[cat].value += (p.buyingPrice || 0) * (p.currentStock || 0);
    });

    const categoriesBreakdown = Object.entries(catMap).map(([category, d]) => ({
      category,
      count: d.count,
      value: d.value,
    }));

    return {
      totalProducts,
      totalStockValue,
      totalStockQuantity,
      lowStockItemsCount,
      totalPurchases,
      totalPurchasesAmount,
      categoriesBreakdown,
    };
  },

  async getPayrollReport(tenantId: string = "tenant-fashion"): Promise<PayrollReportData> {
    const runs = await payrollApi.getPayrollRuns(tenantId);
    const totalMonthlyPayroll = runs.reduce((sum, r) => sum + (r.totalGross || 0), 0);
    const totalDeductions = runs.reduce((sum, r) => sum + (r.totalDeductions || 0), 0);
    const totalNetPay = runs.reduce((sum, r) => sum + (r.totalNet || 0), 0);

    return {
      totalStaff: runs[0]?.totalEmployees || 0,
      totalMonthlyPayroll,
      totalDeductions,
      totalNetPay,
      recentRuns: runs,
    };
  },

  async getReferralsReport(tenantId: string = "tenant-fashion"): Promise<ReferralReportData> {
    const rewards = await loyaltyApi.getRewards(tenantId);
    const txs = await loyaltyApi.getTransactions(tenantId);
    const customers = await customersApi.getCustomers(tenantId);

    const totalPointsIssued = txs.filter((t) => t.type === "earned").reduce((sum, t) => sum + t.points, 0);
    const totalPointsRedeemed = txs.filter((t) => t.type === "redeemed").reduce((sum, t) => sum + t.points, 0);

    const topPatrons = customers
      .filter((c) => (c.loyaltyPoints || 0) > 0)
      .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        points: c.loyaltyPoints || 0,
        tier: (c.loyaltyPoints || 0) > 500 ? "Gold" : (c.loyaltyPoints || 0) > 200 ? "Silver" : "Bronze",
      }));

    return {
      totalLoyaltyMembers: customers.length,
      totalPointsIssued,
      totalPointsRedeemed,
      activeRewardsCount: rewards.length,
      topPatrons,
    };
  },
};
