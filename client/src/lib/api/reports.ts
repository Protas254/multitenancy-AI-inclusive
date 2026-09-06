import { Sale, Expense, Product } from "../types";
import { salesApi } from "./sales";
import { expensesApi } from "./expenses";
import { productsApi } from "./products";

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
    const catMap: Record<string, number> = {};
    validSales.forEach((s) => {
      s.items.forEach((item) => {
        const cat = "Apparel & Accessories";
        catMap[cat] = (catMap[cat] || 0) + item.total;
      });
    });
    const salesByCategory = Object.entries(catMap).map(([categoryName, total]) => ({ categoryName, total }));

    // Timeline mockup
    const salesTimeline = [
      { date: "26 Aug", amount: 38000, orders: 12 },
      { date: "27 Aug", amount: 45000, orders: 15 },
      { date: "28 Aug", amount: 52000, orders: 18 },
      { date: "29 Aug", amount: 48000, orders: 14 },
      { date: "30 Aug", amount: 64000, orders: 22 },
      { date: "31 Aug", amount: 58000, orders: 19 },
      { date: "01 Sep", amount: 45600, orders: 16 },
    ];

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
    const grossRevenue = validSales.reduce((sum, s) => sum + s.totalAmount, 0) || 720000;
    
    // Calculate COGS
    let cogs = 0;
    validSales.forEach((s) => {
      s.items.forEach((i) => {
        cogs += (i.buyingPrice || i.unitPrice * 0.5) * i.quantity;
      });
    });
    if (cogs === 0) cogs = Math.round(grossRevenue * 0.48);

    const grossProfit = grossRevenue - cogs;
    const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) || 165000;
    const netProfit = grossProfit - totalExpenses;
    const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Expenses breakdown
    const expMap: Record<string, number> = {};
    expenses.forEach((e) => {
      expMap[e.category] = (expMap[e.category] || 0) + e.amount;
    });
    const expensesByCategory = Object.entries(expMap).map(([category, amount]) => ({ category, amount }));

    const cashFlowTimeline = [
      { date: "May 2026", revenue: 580000, expense: 140000, net: 440000 },
      { date: "Jun 2026", revenue: 640000, expense: 155000, net: 485000 },
      { date: "Jul 2026", revenue: 690000, expense: 160000, net: 530000 },
      { date: "Aug 2026", revenue: 745000, expense: 165000, net: 580000 },
      { date: "Sep 2026 (Est)", revenue: 720000, expense: 165000, net: 555000 },
    ];

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
};
