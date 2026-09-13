import { LoyaltyReward, LoyaltyTransaction, Customer } from "../types";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const loyaltyApi = {
  async getRewards(tenantId: string = "tenant-fashion"): Promise<LoyaltyReward[]> {
    const stored = apiClient.getStorage<LoyaltyReward[]>("loyalty_rewards", []);
    return stored.filter((r) => r.tenantId === tenantId);
  },

  async getTransactions(tenantId: string = "tenant-fashion"): Promise<LoyaltyTransaction[]> {
    const stored = apiClient.getStorage<LoyaltyTransaction[]>("loyalty_transactions", []);
    return stored.filter((t) => t.tenantId === tenantId);
  },

  async createReward(data: Omit<LoyaltyReward, "id">): Promise<LoyaltyReward> {
    const current = apiClient.getStorage<LoyaltyReward[]>("loyalty_rewards", []);
    const newReward: LoyaltyReward = { ...data, id: generateId("rew") };
    apiClient.setStorage("loyalty_rewards", [newReward, ...current]);
    return newReward;
  },

  async redeemReward(customerId: string, rewardId: string): Promise<LoyaltyTransaction> {
    const rewards = await this.getRewards();
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) throw new Error("Reward not found");

    const customers = apiClient.getStorage<Customer[]>("customers", []);
    const cIndex = customers.findIndex((c) => c.id === customerId);
    if (cIndex === -1) throw new Error("Customer not found");

    const customer = customers[cIndex];
    if (customer.loyaltyPoints < reward.pointsRequired) {
      throw new Error(`Insufficient points. Customer has ${customer.loyaltyPoints} points, needs ${reward.pointsRequired}.`);
    }

    customer.loyaltyPoints -= reward.pointsRequired;
    apiClient.setStorage("customers", customers);

    const txs = apiClient.getStorage<LoyaltyTransaction[]>("loyalty_transactions", []);
    const newTx: LoyaltyTransaction = {
      id: generateId("ltx"),
      tenantId: reward.tenantId,
      customerId: customer.id,
      customerName: customer.name,
      type: "redeemed",
      points: reward.pointsRequired,
      description: `Redeemed ${reward.title}`,
      date: new Date().toISOString(),
    };

    apiClient.setStorage("loyalty_transactions", [newTx, ...txs]);
    return newTx;
  },
};
