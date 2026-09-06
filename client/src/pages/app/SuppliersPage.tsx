import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { suppliersApi } from "@/lib/api/suppliers";
import { Supplier } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Eye, Building, Phone, Mail } from "lucide-react";

export default function SuppliersPage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Supplier Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await suppliersApi.getSuppliers(currentTenant.id);
      setSuppliers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) return;
    setIsSubmitting(true);

    try {
      await suppliersApi.createSupplier({
        tenantId: currentTenant.id,
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson || undefined,
        phone: newSupplier.phone,
        email: newSupplier.email || undefined,
        address: newSupplier.address || undefined,
        productsCount: 0,
        status: "active",
      });

      setIsAddOpen(false);
      setNewSupplier({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      });
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Supplier>[] = [
    {
      header: "Supplier Company",
      accessorKey: "name",
      sortable: true,
      cell: (s) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{s.name}</p>
          {s.contactPerson && <p className="text-[11px] text-slate-400">Attn: {s.contactPerson}</p>}
        </div>
      ),
    },
    {
      header: "Phone & Email",
      accessorKey: "phone",
      cell: (s) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-700 font-medium">{s.phone}</p>
          {s.email && <p className="text-[11px] text-slate-400">{s.email}</p>}
        </div>
      ),
    },
    {
      header: "Location",
      accessorKey: "address",
      cell: (s) => <span className="text-xs text-slate-500">{s.address || "—"}</span>,
    },
    {
      header: "Total Invoiced",
      accessorKey: "totalPurchases",
      sortable: true,
      cell: (s) => <span className="font-mono text-xs font-bold text-slate-900">{formatKES(s.totalPurchases)}</span>,
    },
    {
      header: "Amount Paid",
      accessorKey: "amountPaid",
      sortable: true,
      cell: (s) => <span className="font-mono text-xs text-emerald-600 font-semibold">{formatKES(s.amountPaid)}</span>,
    },
    {
      header: "Outstanding Balance",
      accessorKey: "outstandingBalance",
      sortable: true,
      cell: (s) => (
        <span
          className={`font-mono text-xs font-bold ${
            s.outstandingBalance > 0 ? "text-rose-600 font-black" : "text-slate-500"
          }`}
        >
          {formatKES(s.outstandingBalance)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/suppliers/${s.id}`}>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" title="Supplier Profile">
              <Eye className="h-3.5 w-3.5 text-slate-600" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Suppliers Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage vendor contacts, track purchase order histories, and audit supplier debt payables.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Supplier</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchKey="name"
        searchPlaceholder="Search supplier name, contact person or phone..."
        isLoading={isLoading}
        emptyTitle="No suppliers added"
        emptyDescription="Add vendors to start placing replenishment purchase orders."
        emptyActionLabel="Add Supplier"
        onEmptyAction={() => setIsAddOpen(true)}
        onRowClick={(s) => router.push(`/suppliers/${s.id}`)}
      />

      {/* Add Supplier Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Register Supplier Vendor</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSupplier} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Company / Supplier Name</label>
              <Input
                placeholder="e.g. Kenya Garments Ltd"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Contact Person</label>
                <Input
                  placeholder="e.g. Rajesh Patel"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <Input
                  placeholder="e.g. +254 722 000 000"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input
                type="email"
                placeholder="orders@supplier.com"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Physical Address / Warehouse</label>
              <Input
                placeholder="e.g. Industrial Area, Enterprise Rd, Nairobi"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Supplier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
