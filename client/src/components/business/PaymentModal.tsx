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
import { PaymentMethod } from "@/lib/types";
import { formatKES } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  recipientName: string;
  totalBalance: number;
  onRecord: (data: {
    amount: number;
    paymentMethod: PaymentMethod;
    referenceCode: string;
    notes: string;
  }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  title = "Record Payment",
  recipientName,
  totalBalance,
  onRecord,
}) => {
  const [amount, setAmount] = useState<number>(totalBalance);
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [referenceCode, setReferenceCode] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setIsSubmitting(true);
    try {
      await onRecord({
        amount,
        paymentMethod: method,
        referenceCode,
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Record payment for <strong className="text-slate-900">{recipientName}</strong>. Current outstanding balance:{" "}
            <strong className="text-blue-600 font-mono">{formatKES(totalBalance)}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Payment Amount (KES)</label>
            <Input
              type="number"
              min="1"
              max={totalBalance}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(["mpesa", "cash", "bank_transfer"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                    method === m
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {m === "mpesa" ? "M-Pesa" : m === "cash" ? "Cash" : "Bank Transfer"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Reference Code / Receipt No (Optional)
            </label>
            <Input
              placeholder="e.g. QK8912LX9Z"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
            <Input
              placeholder="e.g. Settled via Paybill"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
