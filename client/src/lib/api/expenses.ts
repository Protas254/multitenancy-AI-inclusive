import { Expense } from "../types";
import { apiClient } from "./client";

export const expensesApi = {
  async getExpenses(_tenantId?: string): Promise<Expense[]> {
    try {
      const data = await apiClient.get<Expense[]>("/expenses/");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching expenses:", err);
      return [];
    }
  },

  async createExpense(data: Omit<Expense, "id">): Promise<Expense> {
    return await apiClient.post<Expense>("/expenses/", data);
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/expenses/${id}/`);
      return true;
    } catch {
      return false;
    }
  },
};
