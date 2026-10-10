import { StockMovement, StockAdjustmentRequest, Product } from "../types";
import { apiClient } from "./client";

export const inventoryApi = {
  async getMovements(_tenantId?: string): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>("/stock-movements/");
  },

  async adjustStock(req: StockAdjustmentRequest, staffName: string = "Staff", tenantId: string = ""): Promise<Product> {
    return apiClient.post<Product>("/stock-movements/adjust/", {
      productId: req.productId,
      type: req.type,
      quantity: req.quantity,
      reason: req.reason,
      notes: req.notes,
      staffName,
      tenantId,
    });
  },
};
