import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "@/lib/navigation";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { salesApi } from "@/lib/api/sales";
import { Sale } from "@/lib/types";
import { formatKES, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/business/StatusBadge";
import { ReceiptModal } from "@/components/business/ReceiptModal";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, Ban, User, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);

  const saleId = params.id as string;

  useEffect(() => {
    async function loadSale() {
      setIsLoading(true);
      try {
        const data = await salesApi.getSaleById(saleId);
        setSale(data);
      } finally {
        setIsLoading(false);
      }
    }
    if (saleId) loadSale();
  }, [saleId]);

  const handleVoidSale = async () => {
    if (!sale) return;
    setIsVoiding(true);
    try {
      const updated = await salesApi.voidSale(sale.id, "Voided by store manager request");
      setSale(updated);
      setIsVoidDialogOpen(false);
    } finally {
      setIsVoiding(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading sale details...</div>;
  }

  if (!sale) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Sale transaction not found.</p>
        <Link href="/sales">
          <Button variant="outline" size="sm">Back to Sales</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/sales">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 font-mono">{sale.saleNumber}</h1>
              <StatusBadge status={sale.status} />
            </div>
            <p className="text-xs text-slate-500">Recorded on {formatDateTime(sale.date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsReceiptOpen(true)} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </Button>
          {sale.status === "completed" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsVoidDialogOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Void Sale</span>
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Customer, Staff, Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <User className="h-3.5 w-3.5 text-blue-600" />
            <span>Customer</span>
          </div>
          <p className="text-sm font-bold text-slate-900 pt-1">{sale.customerName || "Walk-in Customer"}</p>
          {sale.customerPhone && <p className="text-slate-500">{sale.customerPhone}</p>}
        </Card>

        <Card className="p-4 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Staff Cashier</span>
          </div>
          <p className="text-sm font-bold text-slate-900 pt-1">{sale.staffName}</p>
          <p className="text-slate-500">Branch: Nairobi CBD</p>
        </Card>

        <Card className="p-4 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <CreditCard className="h-3.5 w-3.5 text-purple-600" />
            <span>Payment Info</span>
          </div>
          <p className="text-sm font-bold text-slate-900 uppercase pt-1">{sale.paymentMethod}</p>
          {sale.paymentReference && <p className="font-mono text-slate-500">Ref: {sale.paymentReference}</p>}
        </Card>
      </div>

      {/* Items Breakdown Table */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold">Purchased Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Item and SKU</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Unit Price</th>
                <th className="p-4 text-right">Discount</th>
                <th className="p-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{item.productName}</p>
                    <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                  </td>
                  <td className="p-4 text-center font-medium">{item.quantity}</td>
                  <td className="p-4 text-right font-mono">{formatKES(item.unitPrice)}</td>
                  <td className="p-4 text-right text-emerald-600 font-mono">
                    {item.discount > 0 ? `-${formatKES(item.discount)}` : "—"}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900 font-mono">
                    {formatKES(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatKES(sale.subtotal)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Total Discount:</span>
                  <span className="font-mono">-{formatKES(sale.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>VAT (16% Incl):</span>
                <span className="font-mono">{formatKES(sale.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-blue-600 font-mono">{formatKES(sale.totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={sale}
        tenant={currentTenant}
      />

      <ConfirmDialog
        isOpen={isVoidDialogOpen}
        onClose={() => setIsVoidDialogOpen(false)}
        onConfirm={handleVoidSale}
        title="Void Sale Transaction"
        description="Are you sure you want to void this sale? This action will mark the transaction as voided and adjust reporting accordingly."
        confirmLabel="Void Sale"
        variant="destructive"
        isLoading={isVoiding}
      />
    </div>
  );
}
