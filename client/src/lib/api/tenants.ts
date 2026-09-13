import { Tenant } from "../types";
import { apiClient } from "./client";

export const tenantsApi = {
  async getTenants(): Promise<Tenant[]> {
    try {
      const data = await apiClient.get<Tenant[]>("/tenants/");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching tenants:", err);
      return [];
    }
  },

  async getTenantById(id: string): Promise<Tenant | null> {
    try {
      return await apiClient.get<Tenant>(`/tenants/${id}/`);
    } catch {
      return null;
    }
  },

  async updateTenantSettings(id: string, settings: any): Promise<Tenant> {
    return await apiClient.patch<Tenant>(`/tenants/${id}/`, { settings });
  },

  async createTenant(data: any): Promise<Tenant> {
    return await apiClient.post<Tenant>("/tenants/", data);
  },
};
