import { Sale, SaleFilterParams } from "../types";
import { apiClient } from "./client";

export const salesApi = {
  async getSales(_tenantId?: string, params?: SaleFilterParams): Promise<Sale[]> {
    try {
      let sales = await apiClient.get<Sale[]>("/sales/");
      if (!Array.isArray(sales)) return [];
      if (params?.status && params.status !== "all") {
        sales = sales.filter((s) => s.status === params.status);
      }
      if (params?.paymentMethod && params.paymentMethod !== "all") {
        sales = sales.filter((s) => s.paymentMethod === params.paymentMethod);
      }
      return sales;
    } catch (err) {
      console.warn("Error fetching sales:", err);
      return [];
    }
  },

  async getSaleById(id: string): Promise<Sale | null> {
    try {
      return await apiClient.get<Sale>(`/sales/${id}/`);
    } catch {
      return null;
    }
  },

  async createSale(saleData: any): Promise<Sale> {
    return await apiClient.post<Sale>("/sales/", saleData);
  },

  async recordSale(saleData: any): Promise<Sale> {
    return this.createSale(saleData);
  },

  async voidSale(id: string, reason?: string): Promise<Sale> {
    return await apiClient.patch<Sale>(`/sales/${id}/`, { status: "voided", notes: reason });
  },
};
