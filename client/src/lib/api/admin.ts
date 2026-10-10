import { PlatformTenantOverview, SaaSPlan } from "../types";
import { apiClient } from "./client";

export const adminApi = {
  async getTenants(): Promise<PlatformTenantOverview[]> {
    const dbTenants = await apiClient.get<any[]>("/tenants/");
    if (Array.isArray(dbTenants)) {
      return dbTenants.map((t) => ({
        id: t.id,
        name: t.name,
        ownerName: t.ownerName || "Business Owner",
        ownerEmail: t.ownerEmail || t.email || "owner@store.co.ke",
        businessType: t.businessType || "Retail Supermarket",
        plan: t.plan || "pro",
        status: t.status || "active",
        staffCount: t.staffCount ?? 0,
        productsCount: t.productsCount ?? 0,
        monthlyRevenue: t.monthlyRevenue ?? 0,
        totalSalesVolume: t.totalSalesVolume ?? 0,
        createdAt: t.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  },

  async getPlatformStats() {
    return apiClient.get<{
      totalTenants: number;
      activeTenants: number;
      mrr: number;
      totalSalesVolume: number;
      churnRate: number;
      newTenantsThisMonth: number;
    }>("/admin/stats/");
  },

  async getPlans(): Promise<SaaSPlan[]> {
    return apiClient.get<SaaSPlan[]>("/plans/");
  },

  async updateTenantStatus(id: string, status: any): Promise<boolean> {
    await apiClient.patch(`/tenants/${id}/`, { status });
    return true;
  },
};
