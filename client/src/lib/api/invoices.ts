import { Invoice, InvoiceItem } from "../types";
import { INITIAL_INVOICES } from "../mock/initialData";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const invoicesApi = {
  async getInvoices(tenantId: string = "tenant-fashion"): Promise<Invoice[]> {
    const stored = apiClient.getStorage<Invoice[]>("invoices", INITIAL_INVOICES);
    return stored.filter((i) => i.tenantId === tenantId);
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoices = await this.getInvoices();
    return invoices.find((i) => i.id === id || i.invoiceNumber === id) || null;
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
    const current = apiClient.getStorage<Invoice[]>("invoices", INITIAL_INVOICES);
    const invoiceNumber = `INV-2026-${String(current.length + 46).padStart(4, "0")}`;

    const newInvoice: Invoice = {
      id: generateId("inv"),
      invoiceNumber,
      tenantId: payload.tenantId,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      customerAddress: payload.customerAddress,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      items: payload.items,
      subtotal: payload.subtotal,
      taxAmount: payload.taxAmount,
      discountAmount: payload.discountAmount,
      totalAmount: payload.totalAmount,
      amountPaid: 0,
      balanceDue: payload.totalAmount,
      status: "sent",
      notes: payload.notes,
      terms: payload.terms,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newInvoice, ...current];
    apiClient.setStorage("invoices", updated);
    return newInvoice;
  },

  async updateInvoiceStatus(id: string, status: any): Promise<Invoice> {
    const current = apiClient.getStorage<Invoice[]>("invoices", INITIAL_INVOICES);
    const index = current.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Invoice not found");

    current[index].status = status;
    apiClient.setStorage("invoices", current);
    return current[index];
  },

  async recordInvoicePayment(id: string, amount: number): Promise<Invoice> {
    const current = apiClient.getStorage<Invoice[]>("invoices", INITIAL_INVOICES);
    const index = current.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Invoice not found");

    const inv = current[index];
    inv.amountPaid += amount;
    inv.balanceDue = Math.max(0, inv.totalAmount - inv.amountPaid);
    if (inv.balanceDue === 0) {
      inv.status = "paid";
    } else {
      inv.status = "partially_paid";
    }

    apiClient.setStorage("invoices", current);
    return inv;
  },

  async updateInvoice(id: string, payload: Partial<Invoice>): Promise<Invoice> {
    const current = apiClient.getStorage<Invoice[]>("invoices", INITIAL_INVOICES);
    const index = current.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Invoice not found");

    const updatedInvoice = {
      ...current[index],
      ...payload,
    };

    if (payload.totalAmount !== undefined || payload.amountPaid !== undefined) {
      const tot = payload.totalAmount ?? updatedInvoice.totalAmount;
      const pd = payload.amountPaid ?? updatedInvoice.amountPaid;
      updatedInvoice.balanceDue = Math.max(0, tot - pd);
      if (updatedInvoice.balanceDue === 0 && updatedInvoice.status !== "cancelled") {
        updatedInvoice.status = "paid";
      }
    }

    current[index] = updatedInvoice;
    apiClient.setStorage("invoices", current);
    return updatedInvoice;
  },

  async deleteInvoice(id: string): Promise<boolean> {
    const current = apiClient.getStorage<Invoice[]>("invoices", INITIAL_INVOICES);
    const filtered = current.filter((i) => i.id !== id && i.invoiceNumber !== id);
    apiClient.setStorage("invoices", filtered);
    return true;
  },

  async voidInvoice(id: string): Promise<Invoice> {
    return this.updateInvoiceStatus(id, "cancelled");
  },
};
