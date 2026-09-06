import { StockMovement, StockAdjustmentRequest, Product } from "../types";
import { INITIAL_STOCK_MOVEMENTS, INITIAL_PRODUCTS } from "../mock/initialData";
import { apiClient } from "./client";
import { generateId } from "../utils";

export const inventoryApi = {
  async getMovements(tenantId: string = "tenant-fashion"): Promise<StockMovement[]> {
    const stored = apiClient.getStorage<StockMovement[]>("stock_movements", INITIAL_STOCK_MOVEMENTS);
    return stored.filter((m) => m.tenantId === tenantId);
  },

  async adjustStock(req: StockAdjustmentRequest, staffName: string = "John Kamau", tenantId: string = "tenant-fashion"): Promise<Product> {
    const products = apiClient.getStorage<Product[]>("products", INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === req.productId);
    if (index === -1) throw new Error("Product not found");

    const prod = products[index];
    const prevStock = prod.currentStock;
    let newStock = prevStock;

    if (req.type === "increase") {
      newStock = prevStock + req.quantity;
    } else if (req.type === "decrease") {
      newStock = Math.max(0, prevStock - req.quantity);
    } else if (req.type === "set") {
      newStock = Math.max(0, req.quantity);
    }

    const diff = newStock - prevStock;
    prod.currentStock = newStock;
    prod.updatedAt = new Date().toISOString();

    const movements = apiClient.getStorage<StockMovement[]>("stock_movements", INITIAL_STOCK_MOVEMENTS);
    const newMovement: StockMovement = {
      id: generateId("mov"),
      tenantId,
      productId: prod.id,
      productName: prod.name,
      type: diff >= 0 ? "adjustment_increase" : "adjustment_decrease",
      quantity: diff,
      previousStock: prevStock,
      newStock,
      referenceId: generateId("ADJ"),
      reason: `${req.reason}${req.notes ? " - " + req.notes : ""}`,
      staffName,
      date: new Date().toISOString(),
    };

    apiClient.setStorage("products", products);
    apiClient.setStorage("stock_movements", [newMovement, ...movements]);
    return prod;
  },
};
