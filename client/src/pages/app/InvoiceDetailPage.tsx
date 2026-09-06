import React, { useState, useEffect } from "react";
import { useParams } from "@/lib/navigation";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { invoicesApi } from "@/lib/api/invoices";
import { Invoice } from "@/lib/types";
import { InvoicePreview } from "@/components/business/InvoicePreview";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "@/lib/navigation";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentTenant } = useTenant();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editFormData, setEditFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    dueDate: "",
    status: "sent" as any,
    notes: "",
    terms: "",
  });

  const invoiceId = params.id as string;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await invoicesApi.getInvoiceById(invoiceId);
      setInvoice(data);
      if (data) {
        setEditFormData({
          customerName: data.customerName,
          customerEmail: data.customerEmail || "",
          customerPhone: data.customerPhone || "",
          dueDate: data.dueDate,
          status: data.status,
          notes: data.notes || "",
          terms: data.terms || "",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) loadData();
  }, [invoiceId, currentTenant.id]);

  const handleRecordPayment = async (data: any) => {
    if (!invoice) return;
    await invoicesApi.recordInvoicePayment(invoice.id, data.amount);
    setIsPaymentOpen(false);
    loadData();
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setIsSubmitting(true);
    try {
      await invoicesApi.updateInvoice(invoice.id, {
        customerName: editFormData.customerName,
        customerEmail: editFormData.customerEmail,
        customerPhone: editFormData.customerPhone,
        dueDate: editFormData.dueDate,
        status: editFormData.status,
        notes: editFormData.notes,
        terms: editFormData.terms,
      });
      setIsEditOpen(false);
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    setIsSubmitting(true);
    try {
      await invoicesApi.deleteInvoice(invoice.id);
      router.push("/invoices");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading invoice preview...</div>;
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Invoice not found.</p>
        <Link href="/invoices">
          <Button variant="outline" size="sm">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</h1>
            <p className="text-xs text-slate-500">Billed to {invoice.customerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-slate-700 hover:text-blue-600"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit Invoice</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete / Void</span>
          </Button>
        </div>
      </div>

      <InvoicePreview
        invoice={invoice}
        tenant={currentTenant}
        onRecordPayment={() => setIsPaymentOpen(true)}
      />

      {/* Edit Invoice Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="h-4 w-4 text-blue-600" />
              <span>Edit Invoice {invoice.invoiceNumber}</span>
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Record Invoice Payment"
        recipientName={invoice.customerName}
        totalBalance={invoice.balanceDue}
        onRecord={handleRecordPayment}
      />

      {/* Delete / Void Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteInvoice}
        title={`Delete Invoice ${invoice.invoiceNumber}?`}
        description={`Are you sure you want to delete this invoice for ${invoice.customerName}? This will permanently remove it from your records.`}
        confirmLabel="Delete Invoice"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
