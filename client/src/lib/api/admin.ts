import { PlatformTenantOverview, SaaSPlan } from "../types";
import { SAAS_PLANS } from "../mock/initialData";
import { apiClient } from "./client";

export const adminApi = {
  async getTenants(): Promise<PlatformTenantOverview[]> {
    try {
      const dbTenants = await apiClient.get<any[]>("/tenants/");
      if (Array.isArray(dbTenants) && dbTenants.length > 0) {
        return dbTenants.map((t) => ({
          id: t.id,
          name: t.name,
          ownerName: "Protas / Business Owner",
          ownerEmail: t.email || "owner@store.co.ke",
          businessType: t.businessType || "Retail Supermarket",
          plan: t.plan || "pro",
          status: t.status || "active",
          staffCount: 3,
          productsCount: 15,
          monthlyRevenue: 180000,
          totalSalesVolume: 450000,
          createdAt: t.createdAt || new Date().toISOString(),
        }));
      }
      return apiClient.getStorage<PlatformTenantOverview[]>("platform_tenants", []);
    } catch {
      return apiClient.getStorage<PlatformTenantOverview[]>("platform_tenants", []);
    }
  },

  async getPlatformStats() {
    const tenants = await this.getTenants();
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.status === "active").length;
    const totalMRR = 2450000;
    const totalSalesVolume = tenants.reduce((sum, t) => sum + (t.totalSalesVolume || 0), 0);

    return {
      totalTenants,
      activeTenants,
      mrr: totalMRR,
      totalSalesVolume,
      churnRate: 2.1,
      newTenantsThisMonth: totalTenants,
    };
  },

  async getPlans(): Promise<SaaSPlan[]> {
    return SAAS_PLANS;
  },

  async updateTenantStatus(id: string, status: any): Promise<boolean> {
    try {
      await apiClient.patch(`/tenants/${id}/`, { status });
      return true;
    } catch {
      const tenants = apiClient.getStorage<PlatformTenantOverview[]>("platform_tenants", []);
      const index = tenants.findIndex((t) => t.id === id);
      if (index !== -1) {
        tenants[index].status = status;
        apiClient.setStorage("platform_tenants", tenants);
      }
      return true;
    }
  },
};
