import { DailyReconciliation } from "../types";
import { apiClient } from "./client";

export const reconciliationsApi = {
  async getDailyReconciliations(tenantId?: string): Promise<DailyReconciliation[]> {
    try {
      const data = await apiClient.get<DailyReconciliation[]>("/reconciliations/");
      if (!Array.isArray(data)) return [];
      if (!tenantId) return data;
      return data.filter((r) => r.tenantId === tenantId);
    } catch {
      return [];
    }
  },

  async getAllReconciliations(): Promise<DailyReconciliation[]> {
    try {
      const data = await apiClient.get<DailyReconciliation[]>("/reconciliations/");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async saveReconciliation(payload: {
    tenantId: string;
    tenantName?: string;
    branchId?: string;
    branchName?: string;
    openingFloat?: number;
    cashSales: number;
    cashExpenses: number;
    actualCash: number;
    mpesaExpected: number;
    mpesaActual: number;
    cardExpected?: number;
    cardActual?: number;
    reconciledBy: string;
    notes?: string;
  }): Promise<DailyReconciliation> {
    const openingFloat = payload.openingFloat || 0;
    const cardActual = payload.cardActual || 0;
    const cardExpected = payload.cardExpected || 0;
    const expectedCash = payload.cashSales - payload.cashExpenses;
    const cashDiscrepancy = payload.actualCash - expectedCash;
    const mpesaDiscrepancy = payload.mpesaActual - payload.mpesaExpected;
    const cardDiscrepancy = cardActual - cardExpected;

    const hasDiscrepancy =
      Math.abs(cashDiscrepancy) > 5 ||
      Math.abs(mpesaDiscrepancy) > 5;

    const body = {
      date: new Date().toISOString().split("T")[0],
      openingFloat,
      cashSales: payload.cashSales,
      cashExpenses: payload.cashExpenses,
      expectedCash,
      actualCash: payload.actualCash,
      cashDiscrepancy,
      mpesaExpected: payload.mpesaExpected,
      mpesaActual: payload.mpesaActual,
      mpesaDiscrepancy,
      cardExpected,
      cardActual,
      cardDiscrepancy,
      totalCollected: payload.cashSales + payload.mpesaActual,
      status: hasDiscrepancy ? "discrepancy" : "reconciled",
      reconciledBy: payload.reconciledBy,
      notes: payload.notes || "",
    };

    return await apiClient.post<DailyReconciliation>("/reconciliations/", body);
  },
};

