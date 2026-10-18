import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, KeyRound, CheckCircle2, Lock, X } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useSecurity } from "@/contexts/SecurityContext";

interface ManagerPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  actionName?: string;
}

export const ManagerPasscodeModal: React.FC<ManagerPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Security Authorization Required",
  description = "This action requires 4-digit security PIN authorization to access protected business metrics.",
  actionName = "Authorize Action",
}) => {
  const { currentTenant } = useTenant();
  const { verifyPin, unlock } = useSecurity();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = (pinToTest?: string) => {
    const code = pinToTest !== undefined ? pinToTest : pin;
    setError("");

    if (!code) {
      setError("Please enter the 4-digit security PIN.");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (verifyPin(code)) {
        unlock(code);
        setPin("");
        setError("");
        setIsVerifying(false);
        onSuccess();
        onClose();
      } else {
        setIsVerifying(false);
        setError("Invalid PIN. Please enter the correct 4-digit security PIN.");
        setPin("");
      }
    }, 250);
  };

  const handleKeypadPress = (val: string) => {
    if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 4) {
        handleVerify(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-6 bg-white rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader className="text-center sm:text-center pb-2">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center justify-center my-3 space-y-2">
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`h-4 w-4 rounded-full border-2 transition-all ${
                    isFilled
                      ? "bg-blue-600 border-blue-600 scale-110 shadow-sm"
                      : "border-slate-300 bg-slate-50"
                  }`}
                />
              );
            })}
          </div>

          {error ? (
            <p className="text-[11px] font-semibold text-rose-600 text-center animate-shake">
              {error}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 text-center">
              Enter 4-digit Store Manager PIN (Default: <strong className="text-slate-600">1234</strong>)
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="h-12 w-16 mx-auto rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-100 active:text-blue-700 text-base font-bold text-slate-800 transition-colors shadow-2xs flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 w-16 mx-auto rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-colors flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress("0")}
            className="h-12 w-16 mx-auto rounded-xl bg-slate-100 hover:bg-slate-200 text-base font-bold text-slate-800 transition-colors shadow-2xs flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 w-16 mx-auto rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-rose-600 transition-colors flex items-center justify-center"
          >
            Delete
          </button>
        </div>

        {/* Cancel and Action Footer */}
        <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPin("");
              setError("");
              onClose();
            }}
            className="text-xs text-slate-500"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleVerify()}
            disabled={pin.length < 4 || isVerifying}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            {actionName}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
