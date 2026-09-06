import { Sale, SaleFilterParams } from "../types";
import { INITIAL_SALES } from "../mock/initialData";
import { apiClient } from "./client";

export const salesApi = {
  async getSales(tenantId: string = "tenant-fashion", params?: SaleFilterParams): Promise<Sale[]> {
    try {
      return await apiClient.get<Sale[]>("/sales/");
    } catch {
      let sales = apiClient.getStorage<Sale[]>("sales", INITIAL_SALES);
      sales = sales.filter((s) => s.tenantId === tenantId);
      if (params?.status && params.status !== "all") {
        sales = sales.filter((s) => s.status === params.status);
      }
      if (params?.paymentMethod && params.paymentMethod !== "all") {
        sales = sales.filter((s) => s.paymentMethod === params.paymentMethod);
      }
      return sales;
    }
  },

  async getSaleById(id: string): Promise<Sale | null> {
    try {
      return await apiClient.get<Sale>(`/sales/${id}/`);
    } catch {
      const sales = await this.getSales();
      return sales.find((s) => s.id === id) || null;
    }
  },

  async createSale(saleData: any): Promise<Sale> {
    try {
      return await apiClient.post<Sale>("/sales/", saleData);
    } catch {
      const current = apiClient.getStorage<Sale[]>("sales", INITIAL_SALES);
      const newSale: Sale = {
        ...saleData,
        id: "sale-" + Date.now(),
        date: new Date().toISOString(),
      };
      const updated = [newSale, ...current];
      apiClient.setStorage("sales", updated);
      return newSale;
    }
  },

  async recordSale(saleData: any): Promise<Sale> {
    return this.createSale(saleData);
  },

  async voidSale(id: string, reason?: string): Promise<Sale> {
    try {
      return await apiClient.patch<Sale>(`/sales/${id}/`, { status: "voided", notes: reason });
    } catch {
      const current = apiClient.getStorage<Sale[]>("sales", INITIAL_SALES);
      const sale = current.find((s) => s.id === id);
      if (!sale) throw new Error("Sale not found");
      sale.status = "voided";
      apiClient.setStorage("sales", current);
      return sale;
    }
  },
};
