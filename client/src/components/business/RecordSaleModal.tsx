import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { productsApi } from "@/lib/api/products";
import { customersApi } from "@/lib/api/customers";
import { salesApi } from "@/lib/api/sales";
import { Product, Customer, PaymentMethod, Sale, SaleItem } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  User,
  Smartphone,
  Banknote,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

interface ItemRow {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  buyingPrice: number;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentTenant, currentBranch } = useTenant();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form State
  const [customerId, setCustomerId] = useState<string>("");
  const [walkinName, setWalkinName] = useState<string>("");
  const [walkinPhone, setWalkinPhone] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [mpesaCode, setMpesaCode] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        try {
          const [prods, custs] = await Promise.all([
            productsApi.getProducts(currentTenant.id),
            customersApi.getCustomers(currentTenant.id),
          ]);
          setProducts(prods);
          setCustomers(custs);

          // Add 1 default empty item row if none
          if (items.length === 0 && prods.length > 0) {
            const first = prods[0];
            setItems([
              {
                productId: first.id,
                productName: first.name,
                sku: first.sku,
                quantity: 1,
                unitPrice: first.sellingPrice,
                buyingPrice: first.buyingPrice,
              },
            ]);
          }
        } catch {
          // ignore
        }
      };
      load();
    }
  }, [isOpen, currentTenant.id]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        quantity: 1,
        unitPrice: defaultProd.sellingPrice,
        buyingPrice: defaultProd.buyingPrice,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: prod.id,
              productName: prod.name,
              sku: prod.sku,
              unitPrice: prod.sellingPrice,
              buyingPrice: prod.buyingPrice,
            }
          : item
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty);
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: validQty } : item))
    );
  };

  const handlePriceChange = (index: number, price: number) => {
    const validPrice = Math.max(0, price);
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, unitPrice: validPrice } : item))
    );
  };

  const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (items.length === 0) {
      setErrorMsg("Please add at least one product item to the sale.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCust = customers.find((c) => c.id === customerId);
      const isCredit = paymentMethod === "credit";

      const saleItems: SaleItem[] = items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        buyingPrice: it.buyingPrice,
        discount: 0,
        total: it.quantity * it.unitPrice,
      }));

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const saleNumber = `SALE-${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`;

      const newSale = await salesApi.recordSale({
        tenantId: currentTenant.id,
        branchId: currentBranch?.id || "br-main",
        saleNumber,
        customerId: selectedCust?.id,
        customerName: selectedCust?.name || walkinName || "Walk-in Customer",
        customerPhone: selectedCust?.phone || walkinPhone || undefined,
        items: saleItems,
        subtotal: totalAmount,
        discountTotal: 0,
        taxTotal: 0,
        totalAmount,
        paymentMethod,
        paymentReference:
          paymentMethod === "mpesa"
            ? mpesaCode || `MPESA-${Math.floor(100000 + Math.random() * 900000)}`
            : undefined,
        isCreditSale: isCredit,
        status: "completed",
        staffId: user?.id || "stf-admin",
        staffName: user?.name || "Store Admin",
        notes: notes || undefined,
      });

      onSuccess(newSale);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to record sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <span>Record New Sale</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>Customer</span>
              </label>
              <span className="text-[11px] text-slate-400">Walk-in or Registered</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    if (e.target.value) {
                      const c = customers.find((cust) => cust.id === e.target.value);
                      if (c) {
                        setWalkinName(c.name);
                        setWalkinPhone(c.phone);
                      }
                    }
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Registered Customer (Optional) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {!customerId && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Walk-in Customer Name"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Input
                    placeholder="Phone (optional)"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="h-9 text-xs w-36 shrink-0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Products and Quantities</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-7 text-xs gap-1 border-slate-200"
              >
                <Plus className="h-3.5 w-3.5 text-blue-600" />
                <span>Add Product</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs shadow-2xs"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) &mdash; {formatKES(p.sellingPrice)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400">Price:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-right rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="text-right min-w-[80px] font-mono font-bold text-slate-900">
                      {formatKES(item.quantity * item.unitPrice)}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === "cash"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Banknote className="h-5 w-5 text-emerald-600" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("mpesa")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === "mpesa"
                    ? "border-blue-600 bg-blue-50/50 text-blue-800 font-bold shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Smartphone className="h-5 w-5 text-blue-600" />
                <span className="text-xs">M-Pesa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("credit")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === "credit"
                    ? "border-purple-600 bg-purple-50/50 text-purple-800 font-bold shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <CreditCard className="h-5 w-5 text-purple-600" />
                <span className="text-xs">Credit Sale</span>
              </button>
            </div>

            {paymentMethod === "mpesa" && (
              <div className="pt-2">
                <Input
                  placeholder="M-Pesa Reference Code (e.g. QK8912LX9Z)"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Notes / Remarks (Optional)</label>
            <Input
              placeholder="e.g. Paid in full, customer collected at counter"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Total Summary Callout */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Total Payable
              </span>
              <span className="text-xs text-slate-300">
                {items.reduce((s, i) => s + i.quantity, 0)} total item(s)
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white">
                {formatKES(totalAmount)}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={items.length === 0 || totalAmount <= 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Complete and Record Sale</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
