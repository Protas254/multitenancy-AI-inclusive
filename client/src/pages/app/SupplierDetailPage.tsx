import React, { useState, useEffect } from "react";
import { useParams } from "@/lib/navigation";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { suppliersApi } from "@/lib/api/suppliers";
import { purchasesApi } from "@/lib/api/purchases";
import { productsApi } from "@/lib/api/products";
import { Supplier, Purchase, Product } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Building, Phone, Mail, MapPin, DollarSign, Truck, Package } from "lucide-react";

export default function SupplierDetailPage() {
  const params = useParams();
  const { currentTenant } = useTenant();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supplierId = params.id as string;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sup, allPos, allProds] = await Promise.all([
        suppliersApi.getSupplierById(supplierId),
        purchasesApi.getPurchases(currentTenant.id),
        productsApi.getProducts(currentTenant.id),
      ]);
      setSupplier(sup);
      if (sup) {
        setPurchases(allPos.filter((p) => p.supplierId === sup.id || p.supplierName === sup.name));
        setProducts(allProds.filter((p) => p.supplierId === sup.id || p.supplierName === sup.name));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) loadData();
  }, [supplierId, currentTenant.id]);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading supplier profile...</div>;
  }

  if (!supplier) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Supplier not found.</p>
        <Link href="/suppliers">
          <Button variant="outline" size="sm">Back to Suppliers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/suppliers">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{supplier.name}</h1>
              <StatusBadge status={supplier.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              {supplier.contactPerson && <span>Attn: <strong>{supplier.contactPerson}</strong></span>}
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {supplier.phone}</span>
              {supplier.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {supplier.email}</span>}
            </div>
          </div>
        </div>

        <Link href="/purchases">
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700">
            <Truck className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Purchases</p>
          <span className="text-2xl font-black text-slate-900 font-mono">{formatKES(supplier.totalPurchases)}</span>
          <p className="text-[10px] text-slate-400">{purchases.length} purchase orders</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Amount Paid</p>
          <span className="text-2xl font-black text-emerald-600 font-mono">{formatKES(supplier.amountPaid)}</span>
          <p className="text-[10px] text-slate-400">Settled to date</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Outstanding Payable</p>
          <span
            className={`text-2xl font-black font-mono ${
              supplier.outstandingBalance > 0 ? "text-rose-600" : "text-slate-700"
            }`}
          >
            {formatKES(supplier.outstandingBalance)}
          </span>
          <p className="text-[10px] text-slate-400">Due on credit POs</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pos">Purchase Orders ({purchases.length})</TabsTrigger>
          <TabsTrigger value="products">Supplied Catalog ({products.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <Card className="shadow-xs">
            <CardContent className="p-0">
              {purchases.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No purchase orders placed yet.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">PO #</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5 text-right">Total Cost</th>
                      <th className="p-3.5">Delivery</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {purchases.map((po) => (
                      <tr key={po.id}>
                        <td className="p-3.5 font-bold font-mono text-slate-900">{po.purchaseNumber}</td>
                        <td className="p-3.5 text-slate-600">
                          {po.items.map((i) => `${i.productName} (x${i.quantityOrdered})`).join(", ")}
                        </td>
                        <td className="p-3.5 text-right font-bold font-mono text-slate-900">
                          {formatKES(po.totalAmount)}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={po.status} />
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={po.paymentStatus} />
                        </td>
                        <td className="p-3.5 text-slate-500">{formatDate(po.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="shadow-xs">
            <CardContent className="p-0">
              {products.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No products mapped to this supplier.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5">SKU</th>
                      <th className="p-3.5 text-right">Cost Price</th>
                      <th className="p-3.5 text-right">Selling Price</th>
                      <th className="p-3.5 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3.5 font-semibold text-slate-900">{p.name}</td>
                        <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                        <td className="p-3.5 text-right font-mono">{formatKES(p.buyingPrice)}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          {formatKES(p.sellingPrice)}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold">{p.currentStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
