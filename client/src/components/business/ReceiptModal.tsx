import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Printer, Download, CheckCircle2 } from "lucide-react";
import { Sale, Tenant } from "@/lib/types";
import { formatKES, formatDateTime } from "@/lib/utils";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  tenant: Tenant;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  tenant,
}) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="p-4 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <DialogTitle className="text-base font-bold text-slate-900">
              Receipt Preview
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 gap-1 text-xs">
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Receipt Canvas */}
        <div className="p-6 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm font-mono text-xs text-slate-800 space-y-3"
          >
            {/* Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              <h2 className="font-bold text-sm text-slate-950 uppercase tracking-tight">
                {tenant.name}
              </h2>
              <p className="text-[11px] text-slate-600 whitespace-pre-line">
                {tenant.settings.receiptHeader || tenant.address}
              </p>
              <p className="text-[11px] text-slate-500">Tel: {tenant.phone}</p>
              {tenant.settings.taxNumber && (
                <p className="text-[11px] text-slate-500">PIN: {tenant.settings.taxNumber}</p>
              )}
            </div>

            {/* Sale Details Meta */}
            <div className="space-y-0.5 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-900">{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{formatDateTime(sale.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Served By:</span>
                <span>{sale.staffName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold">{sale.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold text-slate-900 pb-1 border-b border-slate-200">
                <span>ITEM / QTY</span>
                <span>TOTAL</span>
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-slate-900 font-medium">
                    <span className="truncate max-w-[200px]">{item.productName}</span>
                    <span>{formatKES(item.total)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>
                      {item.quantity} × {formatKES(item.unitPrice)}
                      {item.discount > 0 ? ` (-${formatKES(item.discount)})` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{formatKES(sale.subtotal)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-{formatKES(sale.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>VAT (16% Incl):</span>
                <span>{formatKES(sale.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>{formatKES(sale.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-0.5 text-[11px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Via:</span>
                <span className="font-bold uppercase text-slate-900">{sale.paymentMethod}</span>
              </div>
              {sale.paymentReference && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref Code:</span>
                  <span className="font-mono text-slate-800">{sale.paymentReference}</span>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-slate-500 pt-1 space-y-0.5">
              <p className="whitespace-pre-line">{tenant.settings.receiptFooter}</p>
              <p className="pt-2 font-mono text-[9px] text-slate-400">Powered by StockGrid Retail Cloud</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
