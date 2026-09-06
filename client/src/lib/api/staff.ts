import { StaffMember } from "../types";
import { INITIAL_STAFF } from "../mock/initialData";
import { apiClient } from "./client";

export const staffApi = {
  async getStaff(tenantId: string = "tenant-fashion"): Promise<StaffMember[]> {
    try {
      return await apiClient.get<StaffMember[]>("/staff/");
    } catch {
      const stored = apiClient.getStorage<StaffMember[]>("staff", INITIAL_STAFF);
      return stored.filter((s) => s.tenantId === tenantId);
    }
  },

  async getStaffById(id: string): Promise<StaffMember | null> {
    try {
      return await apiClient.get<StaffMember>(`/staff/${id}/`);
    } catch {
      const staff = await this.getStaff();
      return staff.find((s) => s.id === id) || null;
    }
  },

  async createStaff(data: any): Promise<StaffMember> {
    try {
      return await apiClient.post<StaffMember>("/staff/", data);
    } catch {
      const current = apiClient.getStorage<StaffMember[]>("staff", INITIAL_STAFF);
      const newStaff: StaffMember = {
        ...data,
        id: "stf-" + Date.now(),
      };
      const updated = [newStaff, ...current];
      apiClient.setStorage("staff", updated);
      return newStaff;
    }
  },
};
