import { DailyReconciliation } from "../types";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const INITIAL_RECONCILIATIONS: DailyReconciliation[] = [
  {
    id: "rec-2026-001",
    tenantId: "tenant-fashion",
    tenantName: "Protas Fashion Store",
    branchId: "br-cbd",
    branchName: "Nairobi CBD Flagship",
    date: new Date().toISOString().split("T")[0],
    openingFloat: 0,
    cashSales: 18500,
    cashExpenses: 3200,
    expectedCash: 15300,
    actualCash: 15300,
    cashDiscrepancy: 0,
    mpesaExpected: 22600,
    mpesaActual: 22600,
    mpesaDiscrepancy: 0,
    cardExpected: 0,
    cardActual: 0,
    cardDiscrepancy: 0,
    totalCollected: 41100,
    status: "reconciled",
    reconciledBy: "John Kamau",
    verifiedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    notes: "Shift closed and verified. Safe drop executed successfully. Zero discrepancy.",
  },
  {
    id: "rec-2026-002",
    tenantId: "tenant-fashion",
    tenantName: "Protas Fashion Store",
    branchId: "br-westlands",
    branchName: "Westlands Mall Branch",
    date: new Date().toISOString().split("T")[0],
    openingFloat: 0,
    cashSales: 14200,
    cashExpenses: 1500,
    expectedCash: 12700,
    actualCash: 12500,
    cashDiscrepancy: -200, // KES 200 minor cash shortage
    mpesaExpected: 31000,
    mpesaActual: 31000,
    mpesaDiscrepancy: 0,
    cardExpected: 0,
    cardActual: 0,
    cardDiscrepancy: 0,
    totalCollected: 45200,
    status: "discrepancy",
    reconciledBy: "Faith Wambui",
    verifiedAt: "20:15",
    notes: "KES 200 change shortage at register #2 reported during rush hour.",
  },
  {
    id: "rec-2026-003",
    tenantId: "tenant-supermarket",
    tenantName: "QuickMart Express",
    branchId: "br-kileleshwa",
    branchName: "Kileleshwa Branch",
    date: new Date().toISOString().split("T")[0],
    openingFloat: 0,
    cashSales: 68400,
    cashExpenses: 8200,
    expectedCash: 60200,
    actualCash: 60200,
    cashDiscrepancy: 0,
    mpesaExpected: 94500,
    mpesaActual: 94500,
    mpesaDiscrepancy: 0,
    cardExpected: 0,
    cardActual: 0,
    cardDiscrepancy: 0,
    totalCollected: 162900,
    status: "reconciled",
    reconciledBy: "David Omondi",
    verifiedAt: "21:30",
    notes: "Cash matched with POS sales minus supplier cash payouts and Safaricom Till report.",
  },
  {
    id: "rec-2026-004",
    tenantId: "tenant-hardware",
    tenantName: "Nairobi Hardware & Electricals",
    branchId: "br-industrial",
    branchName: "Industrial Area Depot",
    date: new Date().toISOString().split("T")[0],
    openingFloat: 0,
    cashSales: 42000,
    cashExpenses: 5000,
    expectedCash: 37000,
    actualCash: 0,
    cashDiscrepancy: 0,
    mpesaExpected: 78000,
    mpesaActual: 0,
    mpesaDiscrepancy: 0,
    cardExpected: 0,
    cardActual: 0,
    cardDiscrepancy: 0,
    totalCollected: 120000,
    status: "pending",
    reconciledBy: "Pending Staff Count",
    notes: "Shift ongoing. Daily closeout scheduled for 18:00 EAT.",
  },
];

export const reconciliationsApi = {
  async getDailyReconciliations(tenantId?: string): Promise<DailyReconciliation[]> {
    const stored = apiClient.getStorage<DailyReconciliation[]>("daily_reconciliations", INITIAL_RECONCILIATIONS);
    if (!tenantId) return stored;
    return stored.filter((r) => r.tenantId === tenantId);
  },

  async getAllReconciliations(): Promise<DailyReconciliation[]> {
    return apiClient.getStorage<DailyReconciliation[]>("daily_reconciliations", INITIAL_RECONCILIATIONS);
  },

  async saveReconciliation(payload: {
    tenantId: string;
    tenantName: string;
    branchId: string;
    branchName: string;
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
    const current = apiClient.getStorage<DailyReconciliation[]>("daily_reconciliations", INITIAL_RECONCILIATIONS);
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

    const newRecord: DailyReconciliation = {
      id: generateId("rec"),
      tenantId: payload.tenantId,
      tenantName: payload.tenantName,
      branchId: payload.branchId,
      branchName: payload.branchName,
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
      verifiedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      notes: payload.notes,
    };

    // If an entry already exists for this branch today, replace it; else prepend
    const existingIndex = current.findIndex(
      (r) => r.branchId === payload.branchId && r.date === newRecord.date
    );

    let updated: DailyReconciliation[];
    if (existingIndex !== -1) {
      updated = [...current];
      updated[existingIndex] = newRecord;
    } else {
      updated = [newRecord, ...current];
    }

    apiClient.setStorage("daily_reconciliations", updated);
    return newRecord;
  },
};
