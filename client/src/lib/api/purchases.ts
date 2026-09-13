import { Purchase, PurchaseItem } from "../types";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const purchasesApi = {
  async getPurchases(tenantId?: string): Promise<Purchase[]> {
    const stored = apiClient.getStorage<Purchase[]>("purchases", []);
    return tenantId ? stored.filter((p) => p.tenantId === tenantId) : stored;
  },

  async getPurchaseById(id: string): Promise<Purchase | null> {
    const purchases = await this.getPurchases();
    return purchases.find((p) => p.id === id || p.purchaseNumber === id) || null;
  },

  async createPurchase(data: {
    tenantId: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    totalAmount: number;
    amountPaid: number;
    expectedDeliveryDate?: string;
    notes?: string;
  }): Promise<Purchase> {
    const current = apiClient.getStorage<Purchase[]>("purchases", []);
    const poNumber = `PO-2026-${String(current.length + 91).padStart(3, "0")}`;
    const balance = Math.max(0, data.totalAmount - data.amountPaid);
    const paymentStatus = balance === 0 ? "paid" : data.amountPaid > 0 ? "partially_paid" : "unpaid";

    const newPO: Purchase = {
      id: generateId("po"),
      purchaseNumber: poNumber,
      tenantId: data.tenantId,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      totalAmount: data.totalAmount,
      amountPaid: data.amountPaid,
      balance,
      status: "pending",
      paymentStatus,
      date: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: data.expectedDeliveryDate,
      notes: data.notes,
    };

    const updated = [newPO, ...current];
    apiClient.setStorage("purchases", updated);
    return newPO;
  },

  async receiveStock(purchaseId: string, staffName: string = "Store Manager"): Promise<Purchase> {
    const current = apiClient.getStorage<Purchase[]>("purchases", []);
    const index = current.findIndex((p) => p.id === purchaseId);
    if (index === -1) throw new Error("Purchase order not found");

    const po = current[index];
    po.status = "received";
    po.receivedDate = new Date().toISOString();

    // Increment inventory products stock
    const products = apiClient.getStorage<any[]>("products", []);
    const movements = apiClient.getStorage<any[]>("stock_movements", []);

    po.items.forEach((item) => {
      item.quantityReceived = item.quantityOrdered;
      const prodIndex = products.findIndex((p: any) => p.id === item.productId);
      if (prodIndex !== -1) {
        const prev = products[prodIndex].currentStock;
        const next = prev + item.quantityOrdered;
        products[prodIndex].currentStock = next;

        movements.unshift({
          id: generateId("mov"),
          tenantId: po.tenantId,
          productId: item.productId,
          productName: item.productName,
          type: "purchase",
          quantity: item.quantityOrdered,
          previousStock: prev,
          newStock: next,
          referenceId: po.purchaseNumber,
          reason: `Restocked from ${po.supplierName}`,
          staffName,
          date: new Date().toISOString(),
        });
      }
    });

    apiClient.setStorage("products", products);
    apiClient.setStorage("stock_movements", movements);
    apiClient.setStorage("purchases", current);
    return po;
  },
};
