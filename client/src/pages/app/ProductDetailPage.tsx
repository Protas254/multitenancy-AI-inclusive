import React, { useState, useEffect } from "react";
import { useParams } from "@/lib/navigation";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { productsApi } from "@/lib/api/products";
import { inventoryApi } from "@/lib/api/inventory";
import { Product, StockMovement, StockAdjustmentRequest } from "@/lib/types";
import { formatKES, formatDateTime } from "@/lib/utils";
import { StockAdjustmentModal } from "@/components/business/StockAdjustmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Boxes, TrendingUp, AlertTriangle, Building, SlidersHorizontal, Package } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const { currentTenant } = useTenant();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const productId = params.id as string;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prod = await productsApi.getProductById(productId);
      setProduct(prod);
      if (prod) {
        const allMovements = await inventoryApi.getMovements(currentTenant.id);
        setMovements(allMovements.filter((m) => m.productId === prod.id));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) loadData();
  }, [productId, currentTenant.id]);

  const handleAdjustStock = async (req: StockAdjustmentRequest) => {
    const updated = await inventoryApi.adjustStock(req, "John Kamau", currentTenant.id);
    setProduct(updated);
    loadData();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Product not found.</p>
        <Link href="/products">
          <Button variant="outline" size="sm">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const marginKES = product.sellingPrice - product.buyingPrice;
  const marginPercent = product.sellingPrice > 0 ? (marginKES / product.sellingPrice) * 100 : 0;
  const totalValuation = product.currentStock * product.buyingPrice;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{product.name}</h1>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {product.sku}
              </span>
            </div>
            <p className="text-xs text-slate-500">Category: {product.categoryName}</p>
          </div>
        </div>

        <Button
          onClick={() => setIsAdjustModalOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Adjust Stock Count</span>
        </Button>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Stock</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{product.currentStock}</span>
            <span className="text-xs text-slate-500">units</span>
          </div>
          <p className="text-[10px] text-slate-400">Min threshold: {product.minStockLevel}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Selling Price</p>
          <span className="text-2xl font-black text-slate-900 font-mono">{formatKES(product.sellingPrice)}</span>
          <p className="text-[10px] text-slate-400">Buying: {formatKES(product.buyingPrice)}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Profit Margin</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{marginPercent.toFixed(0)}%</span>
            <span className="text-xs text-emerald-700 font-semibold">({formatKES(marginKES)}/unit)</span>
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stock Value</p>
          <span className="text-2xl font-black text-blue-600 font-mono">{formatKES(totalValuation)}</span>
          <p className="text-[10px] text-slate-400">At cost price</p>
        </Card>
      </div>

      {/* Supplier and Barcode Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Building className="h-4 w-4 text-blue-600" />
            <span>Supplier Information</span>
          </h3>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Supplier Name:</span>
              <span className="font-semibold text-slate-900">{product.supplierName || "Direct / Local Manufacturer"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auto Reorder Status:</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Package className="h-4 w-4 text-purple-600" />
            <span>Barcode and Identifiers</span>
          </h3>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Barcode / EAN:</span>
              <span className="font-mono font-semibold text-slate-900">{product.barcode || "No Barcode Assigned"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Internal SKU:</span>
              <span className="font-mono font-semibold text-slate-900">{product.sku}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Movements Audit Timeline */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold">Stock Movement Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {movements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No stock movements recorded yet.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Type and Ref</th>
                  <th className="p-3.5 text-center">Change</th>
                  <th className="p-3.5 text-center">Prev Stock</th>
                  <th className="p-3.5 text-center">New Stock</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Staff</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {movements.map((mov) => (
                  <tr key={mov.id}>
                    <td className="p-3.5 font-semibold text-slate-900">
                      <span className="capitalize">{mov.type.replace("_", " ")}</span>
                      {mov.referenceId && <p className="font-mono text-[10px] text-slate-400">{mov.referenceId}</p>}
                    </td>
                    <td className="p-3.5 text-center font-bold font-mono">
                      <span className={mov.quantity >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {mov.quantity >= 0 ? `+${mov.quantity}` : mov.quantity}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono">{mov.previousStock}</td>
                    <td className="p-3.5 text-center font-bold font-mono text-slate-900">{mov.newStock}</td>
                    <td className="p-3.5 text-slate-600">{mov.reason}</td>
                    <td className="p-3.5 text-slate-600">{mov.staffName}</td>
                    <td className="p-3.5 text-slate-400">{formatDateTime(mov.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={product}
        onAdjust={handleAdjustStock}
      />
    </div>
  );
}
