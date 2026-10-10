import { Invoice, InvoiceItem } from "../types";
import { apiClient } from "./client";

export const invoicesApi = {
  async getInvoices(_tenantId?: string): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>("/invoices/");
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      return await apiClient.get<Invoice>(`/invoices/${id}/`);
    } catch {
      return null;
    }
  },

  async createInvoice(payload: {
    tenantId: string;
    customerId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    issueDate: string;
    dueDate: string;
    items: InvoiceItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    notes?: string;
    terms?: string;
  }): Promise<Invoice> {
    return apiClient.post<Invoice>("/invoices/", payload);
  },

  async updateInvoiceStatus(id: string, status: any): Promise<Invoice> {
    return apiClient.patch<Invoice>(`/invoices/${id}/`, { status });
  },

  async recordInvoicePayment(id: string, amount: number): Promise<Invoice> {
    return apiClient.post<Invoice>(`/invoices/${id}/record_payment/`, { amount });
  },

  async updateInvoice(id: string, payload: Partial<Invoice>): Promise<Invoice> {
    return apiClient.patch<Invoice>(`/invoices/${id}/`, payload);
  },

  async deleteInvoice(id: string): Promise<boolean> {
    await apiClient.delete(`/invoices/${id}/`);
    return true;
  },

  async voidInvoice(id: string): Promise<Invoice> {
    return this.updateInvoiceStatus(id, "cancelled");
  },
};
