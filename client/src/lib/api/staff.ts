import { StaffMember } from "../types";
import { apiClient } from "./client";

export const staffApi = {
  async getStaff(_tenantId?: string): Promise<StaffMember[]> {
    try {
      const data = await apiClient.get<StaffMember[]>("/staff/");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching staff:", err);
      return [];
    }
  },

  async getStaffById(id: string): Promise<StaffMember | null> {
    try {
      return await apiClient.get<StaffMember>(`/staff/${id}/`);
    } catch {
      return null;
    }
  },

  async createStaff(data: any): Promise<StaffMember> {
    return await apiClient.post<StaffMember>("/staff/", data);
  },

  async updateStaff(id: string, data: any): Promise<StaffMember> {
    return await apiClient.patch<StaffMember>(`/staff/${id}/`, data);
  },

  async deleteStaff(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/staff/${id}/`);
      return true;
    } catch {
      return false;
    }
  },
};
