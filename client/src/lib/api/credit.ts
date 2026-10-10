import { CreditAccount, CreditPayment } from "../types";
import { apiClient } from "./client";

export const creditApi = {
  async getAccounts(_tenantId?: string): Promise<CreditAccount[]> {
    return apiClient.get<CreditAccount[]>("/credit-accounts/");
  },

  async getPayments(_tenantId?: string): Promise<CreditPayment[]> {
    return apiClient.get<CreditPayment[]>("/credit-payments/");
  },

  async recordPayment(payload: {
    creditAccountId: string;
    amount: number;
    paymentMethod: any;
    referenceCode?: string;
    recordedBy: string;
    notes?: string;
  }): Promise<CreditPayment> {
    return apiClient.post<CreditPayment>("/credit-payments/", payload);
  },

  async createAccount(payload: {
    tenantId?: string;
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
    return apiClient.post<CreditAccount>("/credit-accounts/", payload);
  },

  async updateAccount(id: string, payload: Partial<CreditAccount>): Promise<CreditAccount> {
    return apiClient.patch<CreditAccount>(`/credit-accounts/${id}/`, payload);
  },

  async deleteAccount(id: string): Promise<boolean> {
    await apiClient.delete(`/credit-accounts/${id}/`);
    return true;
  },
};
