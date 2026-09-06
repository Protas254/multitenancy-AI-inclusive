import { Customer } from "../types";
import { INITIAL_CUSTOMERS } from "../mock/initialData";
import { apiClient } from "./client";

export const customersApi = {
  async getCustomers(tenantId: string = "tenant-fashion"): Promise<Customer[]> {
    try {
      return await apiClient.get<Customer[]>("/customers/");
    } catch {
      const stored = apiClient.getStorage<Customer[]>("customers", INITIAL_CUSTOMERS);
      return stored.filter((c) => c.tenantId === tenantId);
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      return await apiClient.get<Customer>(`/customers/${id}/`);
    } catch {
      const customers = await this.getCustomers();
      return customers.find((c) => c.id === id) || null;
    }
  },

  async createCustomer(data: any): Promise<Customer> {
    try {
      return await apiClient.post<Customer>("/customers/", data);
    } catch {
      const current = apiClient.getStorage<Customer[]>("customers", INITIAL_CUSTOMERS);
      const newCust: Customer = {
        ...data,
        id: "cust-" + Date.now(),
        totalPurchases: data.totalPurchases || 0,
        loyaltyPoints: data.loyaltyPoints || 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [newCust, ...current];
      apiClient.setStorage("customers", updated);
      return newCust;
    }
  },
};
