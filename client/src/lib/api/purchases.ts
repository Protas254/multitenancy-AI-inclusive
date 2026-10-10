import { Purchase, PurchaseItem } from "../types";
import { apiClient } from "./client";

export const purchasesApi = {
  async getPurchases(_tenantId?: string): Promise<Purchase[]> {
    return apiClient.get<Purchase[]>("/purchases/");
  },

  async getPurchaseById(id: string): Promise<Purchase | null> {
    try {
      return await apiClient.get<Purchase>(`/purchases/${id}/`);
    } catch {
      return null;
    }
  },

  async createPurchase(data: {
    tenantId: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    totalAmount: number;
    amountPaid: number;
    expectedDeliveryDate?: string;
    notes?: string;
  }): Promise<Purchase> {
    return apiClient.post<Purchase>("/purchases/", data);
  },

  async receiveStock(purchaseId: string, staffName: string = "Store Manager"): Promise<Purchase> {
    return apiClient.post<Purchase>(`/purchases/${purchaseId}/receive/`, { staffName });
  },
};
