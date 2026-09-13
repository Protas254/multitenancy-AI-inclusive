import { SalesTarget } from "../types";
import { apiClient } from "./client";

export const targetsApi = {
  async getTargets(_tenantId?: string): Promise<SalesTarget[]> {
    try {
      const data = await apiClient.get<SalesTarget[]>("/targets/");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching targets:", err);
      return [];
    }
  },

  async createTarget(data: Omit<SalesTarget, "id" | "achievedAmount" | "status">): Promise<SalesTarget> {
    return await apiClient.post<SalesTarget>("/targets/", data);
  },

  async deleteTarget(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/targets/${id}/`);
      return true;
    } catch {
      return false;
    }
  },
};
