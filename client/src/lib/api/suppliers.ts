import { Supplier } from "../types";
import { INITIAL_SUPPLIERS } from "../mock/initialData";
import { apiClient } from "./client";

export const suppliersApi = {
  async getSuppliers(tenantId: string = "tenant-fashion"): Promise<Supplier[]> {
    try {
      return await apiClient.get<Supplier[]>("/suppliers/");
    } catch {
      const stored = apiClient.getStorage<Supplier[]>("suppliers", INITIAL_SUPPLIERS);
      return stored.filter((s) => s.tenantId === tenantId);
    }
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      return await apiClient.get<Supplier>(`/suppliers/${id}/`);
    } catch {
      const suppliers = await this.getSuppliers();
      return suppliers.find((s) => s.id === id) || null;
    }
  },

  async createSupplier(data: any): Promise<Supplier> {
    try {
      return await apiClient.post<Supplier>("/suppliers/", data);
    } catch {
      const current = apiClient.getStorage<Supplier[]>("suppliers", INITIAL_SUPPLIERS);
      const newSup: Supplier = {
        ...data,
        id: "sup-" + Date.now(),
      };
      const updated = [newSup, ...current];
      apiClient.setStorage("suppliers", updated);
      return newSup;
    }
  },
};
