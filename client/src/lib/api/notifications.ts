import { NotificationItem } from "../types";
import { INITIAL_NOTIFICATIONS } from "../mock/initialData";
import { apiClient } from "./client";

export const notificationsApi = {
  async getNotifications(tenantId: string = "tenant-fashion"): Promise<NotificationItem[]> {
    const stored = apiClient.getStorage<NotificationItem[]>("notifications", INITIAL_NOTIFICATIONS);
    return stored.filter((n) => n.tenantId === tenantId);
  },

  async markAsRead(id: string): Promise<boolean> {
    const current = apiClient.getStorage<NotificationItem[]>("notifications", INITIAL_NOTIFICATIONS);
    const index = current.findIndex((n) => n.id === id);
    if (index !== -1) {
      current[index].isRead = true;
      apiClient.setStorage("notifications", current);
    }
    return true;
  },

  async markAllAsRead(tenantId: string = "tenant-fashion"): Promise<boolean> {
    const current = apiClient.getStorage<NotificationItem[]>("notifications", INITIAL_NOTIFICATIONS);
    current.forEach((n) => {
      if (n.tenantId === tenantId) n.isRead = true;
    });
    apiClient.setStorage("notifications", current);
    return true;
  },
};
