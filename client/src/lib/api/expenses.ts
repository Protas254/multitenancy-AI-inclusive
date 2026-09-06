import { Expense } from "../types";
import { INITIAL_EXPENSES } from "../mock/initialData";
import { apiClient } from "./client";

export const expensesApi = {
  async getExpenses(tenantId: string = "tenant-fashion"): Promise<Expense[]> {
    try {
      return await apiClient.get<Expense[]>("/expenses/");
    } catch {
      const stored = apiClient.getStorage<Expense[]>("expenses", INITIAL_EXPENSES);
      return stored.filter((e) => e.tenantId === tenantId);
    }
  },

  async createExpense(data: Omit<Expense, "id">): Promise<Expense> {
    try {
      return await apiClient.post<Expense>("/expenses/", data);
    } catch {
      const current = apiClient.getStorage<Expense[]>("expenses", INITIAL_EXPENSES);
      const newExp: Expense = {
        ...data,
        id: "exp-" + Date.now(),
      };
      const updated = [newExp, ...current];
      apiClient.setStorage("expenses", updated);
      return newExp;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/expenses/${id}/`);
      return true;
    } catch {
      const current = apiClient.getStorage<Expense[]>("expenses", INITIAL_EXPENSES);
      const filtered = current.filter((e) => e.id !== id);
      apiClient.setStorage("expenses", filtered);
      return true;
    }
  },
};
