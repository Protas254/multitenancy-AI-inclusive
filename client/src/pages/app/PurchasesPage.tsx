import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { purchasesApi } from "@/lib/api/purchases";
import { suppliersApi } from "@/lib/api/suppliers";
import { productsApi } from "@/lib/api/products";
import { Purchase, Supplier, Product, PurchaseItem } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, CheckCircle, Truck, Package, PlusCircle, Trash2 } from "lucide-react";

export default function PurchasesPage() {
  const { currentTenant } = useTenant();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [poData, supData, prodData] = await Promise.all([
        purchasesApi.getPurchases(currentTenant.id),
        suppliersApi.getSuppliers(currentTenant.id),
        productsApi.getProducts(currentTenant.id),
      ]);
      setPurchases(poData);
      setSuppliers(supData);
      setProducts(prodData);
      if (supData.length > 0) setSelectedSupplierId(supData[0].id);
      if (prodData.length > 0) {
        setItems([{ productId: prodData[0].id, quantity: 10, unitCost: prodData[0].buyingPrice }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleReceiveStock = async (purchaseId: string) => {
    await purchasesApi.receiveStock(purchaseId, "John Kamau");
    loadData();
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || items.length === 0) return;
    setIsSubmitting(true);

    try {
      const supplier = suppliers.find((s) => s.id === selectedSupplierId);
      const purchaseItems: PurchaseItem[] = items.map((i) => {
        const prod = products.find((p) => p.id === i.productId);
        return {
          productId: i.productId,
          productName: prod?.name || "Product",
          sku: prod?.sku || "SKU",
          quantityOrdered: i.quantity,
          quantityReceived: 0,
          unitCost: i.unitCost,
          total: i.quantity * i.unitCost,
        };
      });

      const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
      const tax = Math.round(subtotal * 0.16);
      const totalAmount = subtotal + tax;

      await purchasesApi.createPurchase({
        tenantId: currentTenant.id,
        supplierId: selectedSupplierId,
        supplierName: supplier?.name || "Supplier",
        items: purchaseItems,
        subtotal,
        tax,
        shipping: 0,
        totalAmount,
        amountPaid: Number(amountPaid),
        notes,
      });

      setIsAddModalOpen(false);
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Purchase>[] = [
    {
      header: "PO #",
      accessorKey: "purchaseNumber",
      sortable: true,
      cell: (po) => <span className="font-bold text-slate-900 font-mono">{po.purchaseNumber}</span>,
    },
    {
      header: "Supplier",
      accessorKey: "supplierName",
      sortable: true,
      cell: (po) => <span className="font-semibold text-slate-800">{po.supplierName}</span>,
    },
    {
      header: "Items Ordered",
      cell: (po) => (
        <span className="text-xs text-slate-600">
          {po.items.map((i) => `${i.productName} (${i.quantityOrdered})`).join(", ").slice(0, 35)}...
        </span>
      ),
    },
    {
      header: "Total Cost",
      accessorKey: "totalAmount",
      sortable: true,
      cell: (po) => <span className="font-mono text-xs font-bold text-slate-900">{formatKES(po.totalAmount)}</span>,
    },
    {
      header: "Paid / Balance",
      cell: (po) => (
        <div className="text-xs">
          <span className="text-emerald-600 font-medium">{formatKES(po.amountPaid)}</span> /{" "}
          <span className="text-rose-600 font-medium">{formatKES(po.balance)}</span>
        </div>
      ),
    },
    {
      header: "Delivery Status",
      accessorKey: "status",
      cell: (po) => <StatusBadge status={po.status} />,
    },
    {
      header: "Payment",
      accessorKey: "paymentStatus",
      cell: (po) => <StatusBadge status={po.paymentStatus} />,
    },
    {
      header: "Date",
      accessorKey: "date",
      sortable: true,
      cell: (po) => <span className="text-xs text-slate-500">{formatDate(po.date)}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (po) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {po.status === "pending" && (
            <Button
              size="sm"
              onClick={() => handleReceiveStock(po.id)}
              className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 font-bold"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Receive Stock</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Purchases & Supplier Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage purchase orders, restock inventory, and track supplier payables.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Purchase Order</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        searchKey="purchaseNumber"
        searchPlaceholder="Search PO number or supplier name..."
        isLoading={isLoading}
        emptyTitle="No purchase orders"
        emptyDescription="Create your first supplier PO to restock inventory."
        emptyActionLabel="Create Purchase Order"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      {/* New Purchase Order Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Supplier Purchase Order</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePO} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Line items list */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Order Items</label>
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const list = [...items];
                      list[idx].productId = e.target.value;
                      const p = products.find((prod) => prod.id === e.target.value);
                      if (p) list[idx].unitCost = p.buyingPrice;
                      setItems(list);
                    }}
                    className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    className="w-20 h-9 text-xs"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const list = [...items];
                      list[idx].quantity = Number(e.target.value);
                      setItems(list);
                    }}
                  />
                  <Input
                    type="number"
                    min="0"
                    className="w-28 h-9 text-xs"
                    placeholder="Unit Cost"
                    value={item.unitCost}
                    onChange={(e) => {
                      const list = [...items];
                      list[idx].unitCost = Number(e.target.value);
                      setItems(list);
                    }}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (products.length > 0) {
                    setItems([...items, { productId: products[0].id, quantity: 10, unitCost: products[0].buyingPrice }]);
                  }
                }}
                className="w-full gap-1 text-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Deposit / Amount Paid (KES)</label>
                <Input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
                <Input
                  placeholder="e.g. Delivery terms"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
