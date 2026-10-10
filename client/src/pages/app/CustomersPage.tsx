import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { customersApi } from "@/lib/api/customers";
import { Customer } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Eye, Users, Award, CreditCard, ShoppingCart } from "lucide-react";

export default function CustomersPage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Customer Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    creditLimit: 30000,
    notes: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await customersApi.getCustomers(currentTenant.id);
      setCustomers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;
    setIsSubmitting(true);

    try {
      await customersApi.createCustomer({
        tenantId: currentTenant.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email || undefined,
        address: newCustomer.address || undefined,
        creditLimit: Number(newCustomer.creditLimit),
        status: "active",
        notes: newCustomer.notes || undefined,
      });

      setIsAddOpen(false);
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
        creditLimit: 30000,
        notes: "",
      });
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: "Customer Name",
      accessorKey: "name",
      sortable: true,
      cell: (c) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{c.name}</p>
          <p className="text-[11px] text-slate-400">{c.phone}</p>
        </div>
      ),
    },
    {
      header: "Loyalty Tier",
      accessorKey: "loyaltyTier",
      sortable: true,
      cell: (c) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={c.loyaltyTier} />
          <span className="font-mono text-xs text-slate-500 font-bold">({c.loyaltyPoints} pts)</span>
        </div>
      ),
    },
    {
      header: "Total Spent",
      accessorKey: "totalPurchases",
      sortable: true,
      cell: (c) => <span className="font-mono text-xs font-bold text-slate-900">{formatKES(c.totalPurchases)}</span>,
    },
    {
      header: "Orders",
      accessorKey: "orderCount",
      sortable: true,
      cell: (c) => <span className="font-mono text-xs text-slate-600">{c.orderCount} orders</span>,
    },
    {
      header: "Outstanding Credit",
      accessorKey: "outstandingCredit",
      sortable: true,
      cell: (c) => (
        <span
          className={`font-mono text-xs font-bold ${
            c.outstandingCredit > 0 ? "text-rose-600 font-black" : "text-emerald-600"
          }`}
        >
          {c.outstandingCredit > 0 ? formatKES(c.outstandingCredit) : "KES 0 (Clear)"}
        </span>
      ),
    },
    {
      header: "Credit Limit",
      accessorKey: "creditLimit",
      cell: (c) => <span className="font-mono text-xs text-slate-400">{formatKES(c.creditLimit)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/customers/${c.id}`}>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" title="Customer 360">
              <Eye className="h-3.5 w-3.5 text-slate-600" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { label: "All Customers", value: "all", filterFn: () => true },
    { label: "With Credit Balance", value: "credit", filterFn: (c: Customer) => c.outstandingCredit > 0 },
    { label: "Platinum VIP", value: "platinum", filterFn: (c: Customer) => c.loyaltyTier === "Platinum" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Customers CRM and Loyalty</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain customer relationship profiles, track credit receivables, and manage reward tiers.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customer name or phone..."
        filterTabs={filterTabs}
        isLoading={isLoading}
        emptyTitle="No customers yet"
        emptyDescription="Add customers or capture their details during POS sales."
        emptyActionLabel="Add Customer"
        onEmptyAction={() => setIsAddOpen(true)}
        onRowClick={(c) => router.push(`/customers/${c.id}`)}
      />

      {/* Add Customer Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Register Customer</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input
                placeholder="e.g. Dr. Peter Mwangi"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <Input
                  placeholder="e.g. +254 722 000 000"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address (Optional)</label>
                <Input
                  type="email"
                  placeholder="name@gmail.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Address / Location</label>
                <Input
                  placeholder="e.g. Kilimani, Nairobi"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Credit Limit (KES)</label>
                <Input
                  type="number"
                  min="0"
                  value={newCustomer.creditLimit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Notes / Preferences</label>
              <Input
                placeholder="e.g. VIP client, preferred sizing..."
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
