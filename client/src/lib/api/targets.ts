import { SalesTarget } from "../types";
import { INITIAL_TARGETS } from "../mock/initialData";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const targetsApi = {
  async getTargets(tenantId: string = "tenant-fashion"): Promise<SalesTarget[]> {
    const stored = apiClient.getStorage<SalesTarget[]>("targets", INITIAL_TARGETS);
    return stored.filter((t) => t.tenantId === tenantId);
  },

  async createTarget(data: Omit<SalesTarget, "id" | "achievedAmount" | "status">): Promise<SalesTarget> {
    const current = apiClient.getStorage<SalesTarget[]>("targets", INITIAL_TARGETS);
    const newTarget: SalesTarget = {
      ...data,
      id: generateId("tgt"),
      achievedAmount: 0,
      status: "active",
    };
    const updated = [newTarget, ...current];
    apiClient.setStorage("targets", updated);
    return newTarget;
  },

  async deleteTarget(id: string): Promise<boolean> {
    const current = apiClient.getStorage<SalesTarget[]>("targets", INITIAL_TARGETS);
    apiClient.setStorage("targets", current.filter((t) => t.id !== id));
    return true;
  },
};
