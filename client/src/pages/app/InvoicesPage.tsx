import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { invoicesApi } from "@/lib/api/invoices";
import { Invoice } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/business/PaymentModal";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Pencil, Trash2, DollarSign, Ban } from "lucide-react";

export default function InvoicesPage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    dueDate: "",
    status: "sent" as any,
    notes: "",
    terms: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await invoicesApi.getInvoices(currentTenant.id);
      setInvoices(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const openEditModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setEditFormData({
      customerName: inv.customerName,
      customerEmail: inv.customerEmail || "",
      customerPhone: inv.customerPhone || "",
      dueDate: inv.dueDate,
      status: inv.status,
      notes: inv.notes || "",
      terms: inv.terms || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    try {
      await invoicesApi.updateInvoice(selectedInvoice.id, {
        customerName: editFormData.customerName,
        customerEmail: editFormData.customerEmail,
        customerPhone: editFormData.customerPhone,
        dueDate: editFormData.dueDate,
        status: editFormData.status,
        notes: editFormData.notes,
        terms: editFormData.terms,
      });
      setIsEditOpen(false);
      setSelectedInvoice(null);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (data: { amount: number }) => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    try {
      await invoicesApi.recordInvoicePayment(selectedInvoice.id, data.amount);
      setIsPaymentOpen(false);
      setSelectedInvoice(null);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    try {
      await invoicesApi.deleteInvoice(selectedInvoice.id);
      setIsDeleteOpen(false);
      setSelectedInvoice(null);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice #",
      accessorKey: "invoiceNumber",
      sortable: true,
      cell: (inv) => <span className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</span>,
    },
    {
      header: "Billed Customer",
      accessorKey: "customerName",
      sortable: true,
      cell: (inv) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{inv.customerName}</p>
          {inv.customerEmail && <p className="text-[11px] text-slate-400">{inv.customerEmail}</p>}
        </div>
      ),
    },
    {
      header: "Issue Date",
      accessorKey: "issueDate",
      sortable: true,
      cell: (inv) => <span className="text-xs text-slate-600">{formatDate(inv.issueDate)}</span>,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      sortable: true,
      cell: (inv) => <span className="text-xs text-slate-600 font-medium">{formatDate(inv.dueDate)}</span>,
    },
    {
      header: "Invoice Total",
      accessorKey: "totalAmount",
      sortable: true,
      cell: (inv) => <span className="font-mono text-xs font-bold text-slate-900">{formatKES(inv.totalAmount)}</span>,
    },
    {
      header: "Balance Due",
      accessorKey: "balanceDue",
      sortable: true,
      cell: (inv) => (
        <span
          className={`font-mono text-xs font-bold ${
            inv.balanceDue > 0 ? "text-rose-600 font-black" : "text-emerald-600"
          }`}
        >
          {formatKES(inv.balanceDue)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (inv) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Read / View */}
          <Link href={`/invoices/${inv.id}`}>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" title="View and Print Invoice">
              <Eye className="h-3.5 w-3.5 text-slate-600" />
            </Button>
          </Link>

          {/* Record Payment if balance due */}
          {inv.balanceDue > 0 && inv.status !== "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
              title="Record Payment"
              onClick={() => {
                setSelectedInvoice(inv);
                setIsPaymentOpen(true);
              }}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Pay</span>
            </Button>
          )}

          {/* Update / Edit */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            title="Edit Invoice Details"
            onClick={() => openEditModal(inv)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Delete / Void */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete or Void Invoice"
            onClick={() => {
              setSelectedInvoice(inv);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const filterTabs = [
    { label: "All Invoices", value: "all", filterFn: () => true },
    { label: "Unpaid / Sent", value: "sent", filterFn: (i: Invoice) => i.status === "sent" },
    { label: "Overdue", value: "overdue", filterFn: (i: Invoice) => i.status === "overdue" },
    { label: "Paid", value: "paid", filterFn: (i: Invoice) => i.status === "paid" },
    { label: "Cancelled", value: "cancelled", filterFn: (i: Invoice) => i.status === "cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Commercial Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate printable A4 invoices, track corporate clients, and manage settlement dues.
          </p>
        </div>

        <Link href="/invoices/new">
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>Create New Invoice</span>
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoice number or customer name..."
        filterTabs={filterTabs}
        isLoading={isLoading}
        emptyTitle="No invoices created"
        emptyDescription="Draft professional invoices with custom tax rates and payment terms."
        emptyActionLabel="Create Invoice"
        onEmptyAction={() => router.push("/invoices/new")}
        onRowClick={(inv) => router.push(`/invoices/${inv.id}`)}
      />

      {/* Edit Invoice Modal (Update) */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="h-4 w-4 text-blue-600" />
              <span>Edit Invoice {selectedInvoice?.invoiceNumber}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateInvoice} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Billed Customer Name</label>
              <Input
                value={editFormData.customerName}
                onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Customer Phone</label>
                <Input
                  value={editFormData.customerPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Customer Email</label>
                <Input
                  type="email"
                  value={editFormData.customerEmail}
                  onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Payment Due Date</label>
                <Input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Invoice Status</label>
                <select
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent / Unpaid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled / Void</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Notes / Scope</label>
              <Input
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Payment Terms</label>
              <Input
                value={editFormData.terms}
                onChange={(e) => setEditFormData({ ...editFormData, terms: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false);
            setSelectedInvoice(null);
          }}
          title={`Record Payment for ${selectedInvoice.invoiceNumber}`}
          recipientName={selectedInvoice.customerName}
          totalBalance={selectedInvoice.balanceDue}
          onRecord={handleRecordPayment}
        />
      )}

      {/* Delete / Void Confirmation Modal (Delete) */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={handleDeleteInvoice}
        title={`Delete Invoice ${selectedInvoice?.invoiceNumber}?`}
        description={`Are you sure you want to delete this invoice for ${selectedInvoice?.customerName}? This will remove it from the ledger. If you prefer to keep the record for audit purposes, you can edit the status to 'Cancelled / Void' instead.`}
        confirmLabel="Delete Invoice"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
