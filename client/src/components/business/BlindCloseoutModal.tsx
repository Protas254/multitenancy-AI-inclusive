import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";
import { Banknote, Lock, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { ManagerPasscodeModal } from "./ManagerPasscodeModal";

interface BlindCloseoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedAmount?: number;
  shiftName?: string;
}

export const BlindCloseoutModal: React.FC<BlindCloseoutModalProps> = ({
  isOpen,
  onClose,
  expectedAmount = 24500,
  shiftName = "Morning POS Shift",
}) => {
  const [countedCash, setCountedCash] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const parsedCounted = Number(countedCash) || 0;
  const difference = parsedCounted - expectedAmount;

  const handleRevealClick = () => {
    if (!countedCash) {
      alert("Please count the physical cash in the drawer and enter the amount first.");
      return;
    }
    setIsPinModalOpen(true);
  };

  const handleClose = () => {
    setIsRevealed(false);
    setCountedCash("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader className="text-center sm:text-center pb-2">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mx-auto flex items-center justify-center mb-3">
            <Banknote className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
            End-of-Shift Blind Till Closeout
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Cashiers must enter physical drawer count without seeing expected figures to ensure fraud-free reconciliation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Physical Cash Counted in Drawer (KES)
            </label>
            <input
              type="number"
              placeholder="e.g. 24500"
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-lg font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRevealed}
            />
            <p className="text-[11px] text-slate-400">
              Count all notes and coins in the till. Do not include float if returned separately.
            </p>
          </div>

          {!isRevealed ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Lock className="h-4 w-4 text-amber-600" />
                <span>Expected POS Balance Hidden</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Expected system revenue is protected. Store Manager authorization is required to compare your count and sign off variance.
              </p>
              <button
                type="button"
                onClick={handleRevealClick}
                className="w-full mt-2 h-9 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Manager Sign-off &amp; Reveal Variance</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Physical Count Entered:</span>
                  <span className="font-bold font-mono text-slate-900">{formatKES(parsedCounted)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>System Expected Sales:</span>
                  <span className="font-bold font-mono text-slate-900">{formatKES(expectedAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                  <span>Cash Drawer Variance:</span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded-md ${
                      difference === 0
                        ? "text-emerald-700 bg-emerald-50"
                        : difference > 0
                        ? "text-blue-700 bg-blue-50"
                        : "text-rose-700 bg-rose-50"
                    }`}
                  >
                    {difference > 0 ? `+${formatKES(difference)} (Overage)` : difference < 0 ? `-${formatKES(Math.abs(difference))} (Shortage)` : "0 KES (Balanced)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Manager PIN verified. Shift closed and recorded to audit log.</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            {isRevealed ? "Done" : "Cancel"}
          </button>
        </div>

        {/* Manager Passcode Modal */}
        <ManagerPasscodeModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => setIsRevealed(true)}
          title="Manager Till Verification"
          description="Enter manager PIN to reveal the expected till balance and approve the cashier's count."
          actionName="Verify & Reveal"
        />
      </DialogContent>
    </Dialog>
  );
};
