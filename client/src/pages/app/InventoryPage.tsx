import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { productsApi } from "@/lib/api/products";
import { inventoryApi } from "@/lib/api/inventory";
import { Product, StockMovement, StockAdjustmentRequest } from "@/lib/types";
import { formatKES, formatDateTime } from "@/lib/utils";
import { StatCard } from "@/components/business/StatCard";
import { DataTable, Column } from "@/components/business/DataTable";
import { StockAdjustmentModal } from "@/components/business/StockAdjustmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Boxes, SlidersHorizontal, AlertTriangle, ArrowRightLeft, TrendingUp, DollarSign } from "lucide-react";

export default function InventoryPage() {
  const { currentTenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodData, movData] = await Promise.all([
        productsApi.getProducts(currentTenant.id),
        inventoryApi.getMovements(currentTenant.id),
      ]);
      setProducts(prodData);
      setMovements(movData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleAdjustStock = async (req: StockAdjustmentRequest) => {
    await inventoryApi.adjustStock(req, "John Kamau", currentTenant.id);
    loadData();
  };

  // Metrics
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + p.currentStock * p.buyingPrice, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const potentialProfit = totalRetailValuation - totalCostValuation;

  const productColumns: Column<Product>[] = [
    {
      header: "Product & SKU",
      accessorKey: "name",
      sortable: true,
      cell: (p) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{p.name}</p>
          <p className="font-mono text-[11px] text-slate-400">{p.sku}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "categoryName",
      sortable: true,
    },
    {
      header: "Current Stock",
      accessorKey: "currentStock",
      sortable: true,
      cell: (p) => (
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
            p.currentStock <= 0
              ? "bg-red-100 text-red-700"
              : p.currentStock <= p.minStockLevel
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {p.currentStock} units
        </span>
      ),
    },
    {
      header: "Cost Value",
      cell: (p) => (
        <span className="font-mono text-xs text-slate-600 font-medium">
          {formatKES(p.currentStock * p.buyingPrice)}
        </span>
      ),
    },
    {
      header: "Retail Value",
      cell: (p) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {formatKES(p.currentStock * p.sellingPrice)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => {
              setSelectedProduct(p);
              setIsAdjustOpen(true);
            }}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Adjust</span>
          </Button>
        </div>
      ),
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    {
      header: "Product",
      accessorKey: "productName",
      sortable: true,
      cell: (m) => <span className="font-semibold text-slate-900">{m.productName}</span>,
    },
    {
      header: "Type & Ref",
      accessorKey: "type",
      sortable: true,
      cell: (m) => (
        <div>
          <span className="capitalize font-medium text-slate-800">{m.type.replace("_", " ")}</span>
          {m.referenceId && <p className="font-mono text-[10px] text-slate-400">{m.referenceId}</p>}
        </div>
      ),
    },
    {
      header: "Change",
      accessorKey: "quantity",
      sortable: true,
      cell: (m) => (
        <span
          className={`font-mono text-xs font-bold ${
            m.quantity >= 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {m.quantity >= 0 ? `+${m.quantity}` : m.quantity}
        </span>
      ),
    },
    {
      header: "New Stock",
      accessorKey: "newStock",
      sortable: true,
      cell: (m) => <span className="font-mono text-xs font-bold text-slate-900">{m.newStock}</span>,
    },
    {
      header: "Reason",
      accessorKey: "reason",
    },
    {
      header: "Staff",
      accessorKey: "staffName",
    },
    {
      header: "Date",
      accessorKey: "date",
      sortable: true,
      cell: (m) => <span className="text-xs text-slate-500">{formatDateTime(m.date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Inventory & Stock Control</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time stock valuation, physical count audits, and movement logs.
        </p>
      </div>

      {/* Valuation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Count"
          value={`${totalStockUnits} units`}
          icon={<Boxes className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Stock Cost Valuation"
          value={formatKES(totalCostValuation)}
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-slate-100 text-slate-700"
        />
        <StatCard
          title="Retail Sales Value"
          value={formatKES(totalRetailValuation)}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Projected Profit Margin"
          value={formatKES(potentialProfit)}
          change={potentialProfit > 0 ? 52.4 : 0}
          periodText="estimated return"
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Low Stock Attention Section */}
      {products.filter((p) => p.currentStock <= p.minStockLevel).length > 0 && (
        <Card className="border-amber-200/80 bg-amber-50/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Low Stock Attention</CardTitle>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {products.filter((p) => p.currentStock <= p.minStockLevel).length} items below minimum threshold
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-amber-100 text-xs">
              {products
                .filter((p) => p.currentStock <= p.minStockLevel)
                .map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between p-3.5">
                    <div>
                      <p className="font-semibold text-slate-900">{prod.name}</p>
                      <p className="text-[10px] text-slate-500">
                        SKU: {prod.sku} • Category: {prod.categoryName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                        {prod.currentStock} remaining (min: {prod.minStockLevel})
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-amber-300 hover:bg-amber-100 text-amber-900 gap-1"
                        onClick={() => {
                          setSelectedProduct(prod);
                          setIsAdjustOpen(true);
                        }}
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>Adjust</span>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Stock Overview vs Movement Audit Trail */}
      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Current Stock ({products.length})</TabsTrigger>
          <TabsTrigger value="movements">Movement Audit Log ({movements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <DataTable
            columns={productColumns}
            data={products}
            searchKey="name"
            searchPlaceholder="Filter inventory by name or SKU..."
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <DataTable
            columns={movementColumns}
            data={movements}
            searchKey="productName"
            searchPlaceholder="Filter movement history..."
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustOpen}
        onClose={() => {
          setIsAdjustOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAdjust={handleAdjustStock}
      />
    </div>
  );
}
