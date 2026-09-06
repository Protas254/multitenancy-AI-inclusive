import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { salesApi } from "@/lib/api/sales";
import { Sale } from "@/lib/types";
import { formatKES, formatDateTime } from "@/lib/utils";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Receipt, ShoppingCart, Download } from "lucide-react";
import { ReceiptModal } from "@/components/business/ReceiptModal";

export default function SalesPage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);

  const loadSales = async () => {
    setIsLoading(true);
    try {
      const data = await salesApi.getSales(currentTenant.id);
      setSales(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [currentTenant.id]);

  const columns: Column<Sale>[] = [
    {
      header: "Sale #",
      accessorKey: "saleNumber",
      sortable: true,
      cell: (sale) => (
        <span className="font-bold text-slate-900 font-mono">{sale.saleNumber}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      sortable: true,
      cell: (sale) => (
        <div>
          <p className="font-medium text-slate-900">{sale.customerName || "Walk-in Customer"}</p>
          {sale.customerPhone && <p className="text-[11px] text-slate-400">{sale.customerPhone}</p>}
        </div>
      ),
    },
    {
      header: "Items",
      cell: (sale) => (
        <span className="text-xs text-slate-600">
          {sale.items.length} item{sale.items.length > 1 ? "s" : ""} (
          {sale.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ").slice(0, 30)}...)
        </span>
      ),
    },
    {
      header: "Total Amount",
      accessorKey: "totalAmount",
      sortable: true,
      cell: (sale) => (
        <span className="font-bold text-slate-900 font-mono">{formatKES(sale.totalAmount)}</span>
      ),
    },
    {
      header: "Payment",
      accessorKey: "paymentMethod",
      sortable: true,
      cell: (sale) => (
        <div className="space-y-0.5">
          <span className="font-semibold uppercase text-xs text-slate-700">{sale.paymentMethod}</span>
          {sale.paymentReference && (
            <p className="font-mono text-[10px] text-slate-400">{sale.paymentReference}</p>
          )}
        </div>
      ),
    },
    {
      header: "Cashier",
      accessorKey: "staffName",
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (sale) => <StatusBadge status={sale.status} />,
    },
    {
      header: "Date & Time",
      accessorKey: "date",
      sortable: true,
      cell: (sale) => <span className="text-xs text-slate-500">{formatDateTime(sale.date)}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (sale) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            title="Preview Receipt"
            onClick={() => setSelectedReceiptSale(sale)}
          >
            <Receipt className="h-3.5 w-3.5 text-slate-600" />
          </Button>
          <Link href={`/sales/${sale.id}`}>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" title="View Details">
              <Eye className="h-3.5 w-3.5 text-slate-600" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { label: "All Sales", value: "all", filterFn: () => true },
    { label: "Completed", value: "completed", filterFn: (s: Sale) => s.status === "completed" },
    { label: "M-Pesa", value: "mpesa", filterFn: (s: Sale) => s.paymentMethod === "mpesa" },
    { label: "Cash", value: "cash", filterFn: (s: Sale) => s.paymentMethod === "cash" },
    { label: "Credit Sales", value: "credit", filterFn: (s: Sale) => s.paymentMethod === "credit" || Boolean(s.isCreditSale) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Sales Transactions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit store sales, filter payment methods, and manage customer receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pos">
            <Button size="sm" className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>Record New Sale (POS)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={sales}
        searchKey="saleNumber"
        searchPlaceholder="Search sale number, customer or M-Pesa code..."
        filterTabs={filterTabs}
        isLoading={isLoading}
        emptyTitle="No sales recorded"
        emptyDescription="Start recording transactions using the POS terminal."
        emptyActionLabel="Open POS Terminal"
        onEmptyAction={() => router.push("/pos")}
        onRowClick={(sale) => router.push(`/sales/${sale.id}`)}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptSale}
        onClose={() => setSelectedReceiptSale(null)}
        sale={selectedReceiptSale}
        tenant={currentTenant}
      />
    </div>
  );
}
