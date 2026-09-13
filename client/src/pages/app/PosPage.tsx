import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { salesApi } from "@/lib/api/sales";
import { productsApi } from "@/lib/api/products";
import { customersApi } from "@/lib/api/customers";
import { Product, Category, Customer, PaymentMethod, Sale } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReceiptModal } from "@/components/business/ReceiptModal";
import {
  Search,
  ScanLine,
  Plus,
  Minus,
  Trash2,
  User,
  CheckCircle2,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  Tag,
  AlertCircle,
} from "lucide-react";

export default function PosPage() {
  const { currentTenant, currentBranch } = useTenant();
  const { user } = useAuth();
  const {
    cart,
    selectedCustomer,
    paymentMethod,
    paymentReference,
    notes,
    isCreditSale,
    subtotal,
    discountTotal,
    taxTotal,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemDiscount,
    setSelectedCustomer,
    setPaymentMethod,
    setPaymentReference,
    setNotes,
    setIsCreditSale,
    clearCart,
    toSaleItems,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (currentTenant.id) {
      productsApi.getProducts(currentTenant.id).then(setProducts).catch(() => {});
      productsApi.getCategories(currentTenant.id).then(setCategories).catch(() => {});
      customersApi.getCustomers(currentTenant.id).then(setCustomers).catch(() => {});
    }
  }, [currentTenant.id]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const sale = await salesApi.recordSale({
        tenantId: currentTenant.id,
        branchId: currentBranch.id,
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        items: toSaleItems(),
        subtotal,
        discountTotal,
        taxTotal,
        totalAmount,
        paymentMethod: isCreditSale ? "credit" : paymentMethod,
        paymentReference: paymentReference || (paymentMethod === "mpesa" ? `MPESA-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
        isCreditSale,
        notes,
        staffId: user?.id || "stf-1",
        staffName: user?.name || "Staff Cashier",
      });

      setCompletedSale(sale);
      setIsReceiptOpen(true);
      clearCart();
    } catch (err: any) {
      alert(err.message || "Failed to complete sale.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4">
      {/* LEFT PANEL: Products Catalog & Search */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Category Header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search by name, SKU, or scan barcode (e.g. 61640001001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 text-xs"
              autoFocus
            />
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-3 shrink-0 gap-1.5 text-xs text-slate-700"
              title="Barcode Scanner Ready"
            >
              <ScanLine className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Scanner Active</span>
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table (Rows & Columns) */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10 select-none">
              <tr>
                <th className="py-3 px-4">Product &amp; SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-center">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-xs">
                    No products found matching &ldquo;{searchQuery}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.currentStock <= 0;
                  const isLowStock = product.currentStock <= product.minStockLevel;
                  const cartItem = cart.find((item) => item.product.id === product.id);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`group transition-colors ${
                        isOutOfStock
                          ? "opacity-50 bg-slate-50/70 cursor-not-allowed"
                          : "hover:bg-blue-50/50 cursor-pointer"
                      } ${cartItem ? "bg-blue-50/20" : ""}`}
                    >
                      {/* Product & SKU */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-400">{product.sku}</span>
                            {product.barcode && (
                              <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.2 rounded text-slate-500">
                                {product.barcode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                          {product.categoryName || "General"}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-xs text-slate-950">
                          {formatKES(product.sellingPrice)}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? "bg-red-100 text-red-700"
                              : isLowStock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isOutOfStock ? "Out of stock" : `${product.currentStock} left`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {cartItem && (
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">
                              {cartItem.quantity} in cart
                            </span>
                          )}
                          <Button
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(product)}
                            className="h-8 px-3 text-xs font-semibold gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PANEL: Live Cart & Checkout Slip */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Customer Selector & Title */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Current Sale Slip</span>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-red-600 hover:underline font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCustomer?.id || ""}
              onChange={(e) => {
                const cust = customers.find((c) => c.id === e.target.value) || null;
                setSelectedCustomer(cust);
              }}
              className="flex-1 h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.loyaltyTier} - {c.loyaltyPoints} pts)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <p>Cart is empty</p>
              <p className="text-[11px]">Click products or scan barcodes to add items</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="pt-2.5 first:pt-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {item.product.name}
                    </h5>
                    <p className="text-[11px] font-mono text-slate-500">
                      {formatKES(item.product.sellingPrice)} each
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {formatKES(item.product.sellingPrice * item.quantity - item.discount)}
                  </span>
                </div>

                {/* Quantity Controls & Discount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-6 w-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-2xs"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.currentStock}
                      className="h-6 w-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-2xs disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Tag className="h-3 w-3" />
                      <input
                        type="number"
                        placeholder="Disc"
                        value={item.discount || ""}
                        onChange={(e) => updateItemDiscount(item.product.id, Number(e.target.value))}
                        className="w-14 h-6 px-1.5 text-[11px] rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations & Payment Selection */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
          {/* Subtotal, Discount & Total */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>{formatKES(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Total Discount:</span>
                <span>-{formatKES(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>VAT Included (16%):</span>
              <span>{formatKES(taxTotal)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-950 pt-1.5 border-t border-slate-200">
              <span>Payable Total:</span>
              <span className="text-blue-600 font-mono">{formatKES(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("mpesa");
                  setIsCreditSale(false);
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === "mpesa" && !isCreditSale
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span className="text-[11px]">M-Pesa</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cash");
                  setIsCreditSale(false);
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === "cash" && !isCreditSale
                    ? "border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Banknote className="h-4 w-4" />
                <span className="text-[11px]">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("card");
                  setIsCreditSale(false);
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === "card" && !isCreditSale
                    ? "border-purple-600 bg-purple-50 text-purple-800 font-bold shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-[11px]">Card</span>
              </button>
            </div>
          </div>

          {/* Credit Sale Toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isCreditSale}
              onChange={(e) => setIsCreditSale(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-slate-300"
            />
            <span className="font-semibold text-rose-700">Record as Credit Sale (Pay Later)</span>
          </label>

          {/* Complete Sale Button */}
          <Button
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || isProcessing}
            isLoading={isProcessing}
            className="w-full h-12 text-sm font-black bg-blue-600 hover:bg-blue-700 shadow-md"
          >
            Complete Sale & Print Receipt ({formatKES(totalAmount)})
          </Button>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
        tenant={currentTenant}
      />
    </div>
  );
}
