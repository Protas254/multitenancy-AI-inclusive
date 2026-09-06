import { CreditAccount, CreditPayment } from "../types";
import { INITIAL_CREDIT_ACCOUNTS, INITIAL_CREDIT_PAYMENTS, INITIAL_CUSTOMERS } from "../mock/initialData";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const creditApi = {
  async getAccounts(tenantId: string = "tenant-fashion"): Promise<CreditAccount[]> {
    const stored = apiClient.getStorage<CreditAccount[]>("credit_accounts", INITIAL_CREDIT_ACCOUNTS);
    return stored.filter((c) => c.tenantId === tenantId);
  },

  async getPayments(tenantId: string = "tenant-fashion"): Promise<CreditPayment[]> {
    const stored = apiClient.getStorage<CreditPayment[]>("credit_payments", INITIAL_CREDIT_PAYMENTS);
    return stored.filter((p) => p.tenantId === tenantId);
  },

  async recordPayment(payload: {
    creditAccountId: string;
    amount: number;
    paymentMethod: any;
    referenceCode?: string;
    recordedBy: string;
    notes?: string;
  }): Promise<CreditPayment> {
    const accounts = apiClient.getStorage<CreditAccount[]>("credit_accounts", INITIAL_CREDIT_ACCOUNTS);
    const payments = apiClient.getStorage<CreditPayment[]>("credit_payments", INITIAL_CREDIT_PAYMENTS);

    const accIndex = accounts.findIndex((a) => a.id === payload.creditAccountId);
    if (accIndex === -1) throw new Error("Credit account not found");

    const acc = accounts[accIndex];
    acc.paidAmount += payload.amount;
    acc.balanceDue = Math.max(0, acc.totalAmount - acc.paidAmount);
    if (acc.balanceDue === 0) {
      acc.status = "cleared";
    }

    const newPayment: CreditPayment = {
      id: generateId("cpay"),
      tenantId: acc.tenantId,
      creditAccountId: acc.id,
      entityType: acc.entityType,
      entityName: acc.entityName,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      referenceCode: payload.referenceCode,
      date: new Date().toISOString(),
      recordedBy: payload.recordedBy,
      notes: payload.notes,
    };

    // If customer, decrease their outstanding credit in CRM
    if (acc.entityType === "customer") {
      const customers = apiClient.getStorage("customers", INITIAL_CUSTOMERS);
      const cIndex = customers.findIndex((c: any) => c.id === acc.entityId || c.name === acc.entityName);
      if (cIndex !== -1) {
        customers[cIndex].outstandingCredit = Math.max(0, customers[cIndex].outstandingCredit - payload.amount);
        apiClient.setStorage("customers", customers);
      }
    }

    apiClient.setStorage("credit_accounts", accounts);
    apiClient.setStorage("credit_payments", [newPayment, ...payments]);
    return newPayment;
  },

  async createAccount(payload: {
    tenantId: string;
    entityType: "customer" | "supplier";
    entityId?: string;
    entityName: string;
    entityPhone?: string;
    referenceDocId: string;
    referenceDocType?: "sale" | "invoice" | "purchase";
    totalAmount: number;
    paidAmount?: number;
    dueDate: string;
    notes?: string;
  }): Promise<CreditAccount> {
    const accounts = apiClient.getStorage<CreditAccount[]>("credit_accounts", INITIAL_CREDIT_ACCOUNTS);
    const paidAmount = payload.paidAmount || 0;
    const balanceDue = Math.max(0, payload.totalAmount - paidAmount);

    let status: "current" | "due_soon" | "overdue" | "cleared" = "current";
    if (balanceDue === 0) {
      status = "cleared";
    } else {
      const due = new Date(payload.dueDate).getTime();
      const now = Date.now();
      if (due < now) {
        status = "overdue";
      } else if (due - now < 3 * 24 * 60 * 60 * 1000) {
        status = "due_soon";
      }
    }

    const newAccount: CreditAccount = {
      id: generateId("cacc"),
      tenantId: payload.tenantId,
      entityType: payload.entityType,
      entityId: payload.entityId || generateId(payload.entityType === "customer" ? "cust" : "sup"),
      entityName: payload.entityName,
      entityPhone: payload.entityPhone || "+254 700 000 000",
      referenceDocId: payload.referenceDocId,
      referenceDocType: payload.referenceDocType || (payload.entityType === "customer" ? "sale" : "purchase"),
      totalAmount: payload.totalAmount,
      paidAmount,
      balanceDue,
      dueDate: payload.dueDate,
      createdAt: new Date().toISOString(),
      status,
    };

    if (payload.entityType === "customer") {
      const customers = apiClient.getStorage("customers", INITIAL_CUSTOMERS);
      const cIndex = customers.findIndex((c: any) => c.name.toLowerCase() === payload.entityName.toLowerCase() || (payload.entityId && c.id === payload.entityId));
      if (cIndex !== -1) {
        customers[cIndex].outstandingCredit = (customers[cIndex].outstandingCredit || 0) + balanceDue;
        apiClient.setStorage("customers", customers);
      }
    }

    const updated = [newAccount, ...accounts];
    apiClient.setStorage("credit_accounts", updated);
    return newAccount;
  },

  async updateAccount(id: string, payload: Partial<CreditAccount>): Promise<CreditAccount> {
    const accounts = apiClient.getStorage<CreditAccount[]>("credit_accounts", INITIAL_CREDIT_ACCOUNTS);
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Credit account not found");

    const acc = accounts[index];
    const totalAmount = payload.totalAmount ?? acc.totalAmount;
    const paidAmount = payload.paidAmount ?? acc.paidAmount;
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    let status = payload.status ?? acc.status;
    if (balanceDue === 0) {
      status = "cleared";
    }

    const updatedAccount: CreditAccount = {
      ...acc,
      ...payload,
      totalAmount,
      paidAmount,
      balanceDue,
      status,
    };

    accounts[index] = updatedAccount;
    apiClient.setStorage("credit_accounts", accounts);
    return updatedAccount;
  },

  async deleteAccount(id: string): Promise<boolean> {
    const accounts = apiClient.getStorage<CreditAccount[]>("credit_accounts", INITIAL_CREDIT_ACCOUNTS);
    const filtered = accounts.filter((a) => a.id !== id);
    apiClient.setStorage("credit_accounts", filtered);
    return true;
  },
};
