import { Customer } from "../types";
import { apiClient } from "./client";

export const customersApi = {
  async getCustomers(tenantId?: string): Promise<Customer[]> {
    try {
      const options = tenantId ? { headers: { "X-Tenant-ID": tenantId } } : {};
      const data = await apiClient.get<Customer[]>("/customers/", options);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching customers:", err);
      return [];
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      return await apiClient.get<Customer>(`/customers/${id}/`);
    } catch {
      return null;
    }
  },

  async createCustomer(data: any): Promise<Customer> {
    return await apiClient.post<Customer>("/customers/", data);
  },

  async updateCustomer(id: string, data: any): Promise<Customer> {
    return await apiClient.patch<Customer>(`/customers/${id}/`, data);
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/customers/${id}/`);
      return true;
    } catch {
      return false;
    }
  },
};
