import { StockMovement, StockAdjustmentRequest, Product } from "../types";
import { apiClient } from "./client";
import { productsApi } from "./products";
import { generateId } from "../utils";

export const inventoryApi = {
  async getMovements(tenantId?: string): Promise<StockMovement[]> {
    const stored = apiClient.getStorage<StockMovement[]>("stock_movements", []);
    return tenantId ? stored.filter((m) => m.tenantId === tenantId) : stored;
  },

  async adjustStock(req: StockAdjustmentRequest, staffName: string = "Staff", tenantId: string = ""): Promise<Product> {
    const prod = await productsApi.getProductById(req.productId);
    if (!prod) throw new Error("Product not found");

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
    const updated = await productsApi.updateProduct(prod.id, { currentStock: newStock });

    const movements = apiClient.getStorage<StockMovement[]>("stock_movements", []);
    const newMovement: StockMovement = {
      id: generateId("mov"),
      tenantId: tenantId || prod.tenantId,
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

    apiClient.setStorage("stock_movements", [newMovement, ...movements]);
    return updated;
  },
};
