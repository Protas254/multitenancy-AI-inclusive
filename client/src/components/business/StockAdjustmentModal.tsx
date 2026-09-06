import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Product, StockAdjustmentRequest } from "@/lib/types";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAdjust: (req: StockAdjustmentRequest) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onAdjust,
}) => {
  const [type, setType] = useState<"increase" | "decrease" | "set">("increase");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("Manual inventory count adjustment");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!product) return null;

  const currentStock = product.currentStock;
  const newStockPreview =
    type === "increase"
      ? currentStock + quantity
      : type === "decrease"
      ? Math.max(0, currentStock - quantity)
      : quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdjust({
        productId: product.id,
        type,
        quantity,
        reason,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Update stock level for <strong className="text-slate-900">{product.name}</strong>. Current stock:{" "}
            <strong className="text-slate-900">{currentStock} units</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType("increase")}
              className={`py-2 text-xs font-semibold rounded-lg border ${
                type === "increase" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200"
              }`}
            >
              + Add Stock
            </button>
            <button
              type="button"
              onClick={() => setType("decrease")}
              className={`py-2 text-xs font-semibold rounded-lg border ${
                type === "decrease" ? "border-red-600 bg-red-50 text-red-700" : "border-slate-200"
              }`}
            >
              - Reduce Stock
            </button>
            <button
              type="button"
              onClick={() => setType("set")}
              className={`py-2 text-xs font-semibold rounded-lg border ${
                type === "set" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200"
              }`}
            >
              = Set Exact
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Quantity</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="Manual inventory count adjustment">Manual physical count audit</option>
              <option value="Damaged / expired goods write-off">Damaged / expired goods</option>
              <option value="Customer return restocked">Customer return</option>
              <option value="Supplier sample">Supplier sample</option>
              <option value="Internal store transfer">Store transfer</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
            <Input
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* New Stock Preview Banner */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600">Resulting Stock Level:</span>
            <span className="font-bold text-slate-900 text-sm">{newStockPreview} units</span>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
