import { LoyaltyReward, LoyaltyTransaction } from "../types";
import { apiClient } from "./client";

export const loyaltyApi = {
  async getRewards(_tenantId?: string): Promise<LoyaltyReward[]> {
    return apiClient.get<LoyaltyReward[]>("/loyalty-rewards/");
  },

  async getTransactions(_tenantId?: string): Promise<LoyaltyTransaction[]> {
    return apiClient.get<LoyaltyTransaction[]>("/loyalty-transactions/");
  },

  async createReward(data: Omit<LoyaltyReward, "id">): Promise<LoyaltyReward> {
    return apiClient.post<LoyaltyReward>("/loyalty-rewards/", data);
  },

  async redeemReward(customerId: string, rewardId: string): Promise<LoyaltyTransaction> {
    return apiClient.post<LoyaltyTransaction>(`/loyalty-rewards/${rewardId}/redeem/`, { customerId });
  },
};
