import { Tenant } from "../types";
import { INITIAL_TENANTS } from "../mock/initialData";
import { apiClient } from "./client";

export const tenantsApi = {
  async getTenants(): Promise<Tenant[]> {
    try {
      return await apiClient.get<Tenant[]>("/tenants/");
    } catch {
      return apiClient.getStorage<Tenant[]>("tenants", INITIAL_TENANTS);
    }
  },

  async getTenantById(id: string): Promise<Tenant | null> {
    try {
      return await apiClient.get<Tenant>(`/tenants/${id}/`);
    } catch {
      const tenants = await this.getTenants();
      return tenants.find((t) => t.id === id) || null;
    }
  },

  async updateTenantSettings(id: string, settings: any): Promise<Tenant> {
    try {
      return await apiClient.patch<Tenant>(`/tenants/${id}/`, { settings });
    } catch {
      const tenants = await this.getTenants();
      const tenant = tenants.find((t) => t.id === id);
      if (!tenant) throw new Error("Tenant not found");
      tenant.settings = { ...tenant.settings, ...settings };
      apiClient.setStorage("tenants", tenants);
      return tenant;
    }
  },

  async createTenant(data: any): Promise<Tenant> {
    try {
      return await apiClient.post<Tenant>("/tenants/", data);
    } catch {
      const current = apiClient.getStorage<Tenant[]>("tenants", INITIAL_TENANTS);
      const newTenant: Tenant = {
        ...data,
        id: "tenant-" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newTenant, ...current];
      apiClient.setStorage("tenants", updated);
      return newTenant;
    }
  },
};
