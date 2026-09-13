import { Supplier } from "../types";
import { apiClient } from "./client";

export const suppliersApi = {
  async getSuppliers(_tenantId?: string): Promise<Supplier[]> {
    try {
      const data = await apiClient.get<Supplier[]>("/suppliers/");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching suppliers:", err);
      return [];
    }
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      return await apiClient.get<Supplier>(`/suppliers/${id}/`);
    } catch {
      return null;
    }
  },

  async createSupplier(data: any): Promise<Supplier> {
    return await apiClient.post<Supplier>("/suppliers/", data);
  },

  async updateSupplier(id: string, data: any): Promise<Supplier> {
    return await apiClient.patch<Supplier>(`/suppliers/${id}/`, data);
  },

  async deleteSupplier(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/suppliers/${id}/`);
      return true;
    } catch {
      return false;
    }
  },
};
