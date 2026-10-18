import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { useSecurity } from "@/contexts/SecurityContext";
import { productsApi } from "@/lib/api/products";
import { suppliersApi } from "@/lib/api/suppliers";
import { Product, Category, Supplier } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Eye, Edit2, Package, Tag, AlertTriangle, Boxes, Settings2, Trash2, Check, X, Pencil, Lock, KeyRound } from "lucide-react";
import { ManagerPasscodeModal } from "@/components/business/ManagerPasscodeModal";

export default function ProductsPage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage Categories Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    buyingPrice: 0,
    currentStock: 1,
    sellingPrice: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodData, catData, supData] = await Promise.all([
        productsApi.getProducts(currentTenant.id),
        productsApi.getCategories(currentTenant.id),
        suppliersApi.getSuppliers(currentTenant.id),
      ]);
      setProducts(prodData);
      setCategories(catData);
      setSuppliers(supData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setIsSavingCat(true);
    try {
      await productsApi.createCategory(currentTenant.id, newCatName.trim());
      setNewCatName("");
      await loadData();
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleSaveEditCategory = async () => {
    if (!editingCatId || !editingCatName.trim()) return;
    setIsSavingCat(true);
    try {
      await productsApi.updateCategory(editingCatId, editingCatName.trim());
      setEditingCatId(null);
      setEditingCatName("");
      await loadData();
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Products in it will keep their category label.")) return;
    await productsApi.deleteCategory(id);
    await loadData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    setIsSubmitting(true);

    try {
      const created = await productsApi.createProduct({
        tenantId: currentTenant.id,
        name: newProduct.name.trim(),
        buyingPrice: Number(newProduct.buyingPrice) || 0,
        currentStock: Number(newProduct.currentStock) || 0,
        sellingPrice: Number(newProduct.sellingPrice) || 0,
        isActive: true,
      } as any);

      setProducts((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewProduct({
        name: "",
        buyingPrice: 0,
        currentStock: 1,
        sellingPrice: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { hasPermission } = useAuth();
  const { isProtectionEnabled, isUnlocked } = useSecurity();
  const [revealedWholesaleByPin, setRevealedWholesaleByPin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Wholesale cost prices protected by Owner Security PIN
  const canViewWholesale = !isProtectionEnabled || isUnlocked || revealedWholesaleByPin;

  const columns: Column<Product>[] = [
    {
      header: "Product and SKU",
      accessorKey: "name",
      sortable: true,
      cell: (p) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
            {p.barcode && <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-500">{p.barcode}</span>}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "categoryName",
      sortable: true,
      cell: (p) => <span className="text-xs text-slate-600 font-medium">{p.categoryName}</span>,
    },
    ...(canViewWholesale
      ? [
          {
            header: "Buying Price",
            accessorKey: "buyingPrice" as keyof Product,
            sortable: true,
            cell: (p: Product) => <span className="font-mono text-xs text-slate-600">{formatKES(p.buyingPrice)}</span>,
          },
        ]
      : []),
    {
      header: "Selling Price",
      accessorKey: "sellingPrice",
      sortable: true,
      cell: (p) => <span className="font-mono text-xs font-bold text-slate-900">{formatKES(p.sellingPrice)}</span>,
    },
    ...(canViewWholesale
      ? [
          {
            header: "Margin",
            cell: (p: Product) => {
              const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.buyingPrice) / p.sellingPrice) * 100 : 0;
              return (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {margin.toFixed(0)}%
                </span>
              );
            },
          },
        ]
      : []),
    {
      header: "Stock Level",
      accessorKey: "currentStock",
      sortable: true,
      cell: (p) => {
        const isLow = p.currentStock <= p.minStockLevel;
        const isOut = p.currentStock <= 0;

        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                isOut
                  ? "bg-red-100 text-red-700"
                  : isLow
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {p.currentStock} units
            </span>
            {isLow && !isOut && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
          </div>
        );
      },
    },
    {
      header: "Supplier",
      accessorKey: "supplierName",
      cell: (p) => <span className="text-xs text-slate-500">{p.supplierName || "—"}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/products/${p.id}`}>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" title="View 360 Details">
              <Eye className="h-3.5 w-3.5 text-slate-600" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { label: "All Catalog", value: "all", filterFn: () => true },
    { label: "Low Stock Alert", value: "low", filterFn: (p: Product) => p.currentStock <= p.minStockLevel && p.currentStock > 0 },
    { label: "Out of Stock", value: "out", filterFn: (p: Product) => p.currentStock <= 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage merchandise, barcodes, cost-selling price margins, and reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canViewWholesale && (
            <Button
              onClick={() => setIsPinModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100"
            >
              <KeyRound className="h-4 w-4 text-amber-600" />
              <span>Unlock Wholesale Costs</span>
            </Button>
          )}
          <Button
            onClick={() => setIsCatModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold"
          >
            <Settings2 className="h-4 w-4" />
            <span>Manage Categories</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search product name, SKU, or barcode..."
        filterTabs={filterTabs}
        isLoading={isLoading}
        emptyTitle="No products in catalog"
        emptyDescription="Add your store inventory to start selling."
        emptyActionLabel="Add Product"
        onEmptyAction={() => setIsAddModalOpen(true)}
        onRowClick={(p) => router.push(`/products/${p.id}`)}
      />

      {/* Manage Categories Modal */}
      <Dialog open={isCatModalOpen} onOpenChange={(open) => { setIsCatModalOpen(open); if (!open) { setEditingCatId(null); setEditingCatName(""); setNewCatName(""); } }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {/* Category List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {categories.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No categories yet. Add one below.</p>
              )}
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50 group">
                  {editingCatId === cat.id ? (
                    <>
                      <Input
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="h-7 text-xs flex-1"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveEditCategory(); if (e.key === "Escape") { setEditingCatId(null); setEditingCatName(""); } }}
                      />
                      <button onClick={handleSaveEditCategory} disabled={isSavingCat} className="text-emerald-600 hover:text-emerald-700 p-1 rounded">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setEditingCatId(null); setEditingCatName(""); }} className="text-slate-400 hover:text-slate-600 p-1 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-slate-800 truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{cat.productCount ?? 0} items</span>
                      <button
                        onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Rename"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* New Category Form */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">Add New Category</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Summer Collection"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="h-8 text-xs flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory(); }}
                />
                <Button
                  onClick={handleCreateCategory}
                  disabled={isSavingCat || !newCatName.trim()}
                  size="sm"
                  className="h-8 text-xs gap-1 bg-slate-900 hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCatModalOpen(false)} className="text-xs">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProduct} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Product Name</label>
              <Input
                placeholder="e.g. Fresh Farm Milk 500ml"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Buying Price (KES)</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={newProduct.buyingPrice || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, buyingPrice: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Quantity</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="1"
                  value={newProduct.currentStock || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Selling Price (KES)</label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={newProduct.sellingPrice || ""}
                onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="font-bold">
                Save Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Manager PIN Modal */}
      <ManagerPasscodeModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => setRevealedWholesaleByPin(true)}
        title="Unlock Wholesale Costs & Margins"
        description="Enter the store manager or owner 4-digit PIN to display Buying Prices and profit margins on the floor."
        actionName="Unlock Wholesale Prices"
      />
    </div>
  );
}
