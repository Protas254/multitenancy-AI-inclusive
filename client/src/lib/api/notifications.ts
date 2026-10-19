import { NotificationItem } from "../types";
import { apiClient } from "./client";

export const notificationsApi = {
  async getNotifications(_tenantId?: string): Promise<NotificationItem[]> {
    try {
      const data = await apiClient.get<NotificationItem[]>("/notifications/");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching notifications:", err);
      return [];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      await apiClient.patch(`/notifications/${id}/`, { isRead: true });
      return true;
    } catch {
      return false;
    }
  },

  async markAllAsRead(_tenantId?: string): Promise<boolean> {
    try {
      const list = await this.getNotifications();
      await Promise.all(list.map((n) => this.markAsRead(n.id)));
      return true;
    } catch {
      return false;
    }
  },

  async recordManagerOverride(actionTitle: string, reason?: string, managerName?: string): Promise<void> {
    try {
      await apiClient.post("/notifications/manager-override/", {
        actionTitle,
        reason,
        managerName,
      });
    } catch (err) {
      console.warn("Failed to record manager override:", err);
    }
  },

  async runBackgroundChecks(_tenantId?: string): Promise<void> {
    try {
      await apiClient.post("/notifications/run-checks/", {});
    } catch (err) {
      console.warn("Failed to trigger background checks:", err);
    }
  },
};
