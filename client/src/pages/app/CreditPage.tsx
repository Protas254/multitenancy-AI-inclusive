import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { creditApi } from "@/lib/api/credit";
import { CreditAccount, CreditPayment, PaymentMethod } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/business/StatCard";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, DollarSign, AlertTriangle, CheckCircle2, Clock, Plus, Pencil, Trash2 } from "lucide-react";

export default function CreditPage() {
  const { currentTenant } = useTenant();
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [payments, setPayments] = useState<CreditPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD modals state
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    entityType: "customer" as "customer" | "supplier",
    entityName: "",
    entityPhone: "",
    referenceDocId: "",
    totalAmount: "",
    paidAmount: "0",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });

  const [editFormData, setEditFormData] = useState({
    entityName: "",
    entityPhone: "",
    totalAmount: "",
    paidAmount: "",
    dueDate: "",
    status: "current" as any,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accData, payData] = await Promise.all([
        creditApi.getAccounts(currentTenant.id),
        creditApi.getPayments(currentTenant.id),
      ]);
      setAccounts(accData);
      setPayments(payData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.entityName || !createFormData.totalAmount) return;
    setIsSubmitting(true);
    try {
      await creditApi.createAccount({
        tenantId: currentTenant.id,
        entityType: createFormData.entityType,
        entityName: createFormData.entityName,
        entityPhone: createFormData.entityPhone,
        referenceDocId: createFormData.referenceDocId || `${createFormData.entityType === "customer" ? "INV" : "PO"}-${Date.now().toString().slice(-4)}`,
        referenceDocType: createFormData.entityType === "customer" ? "sale" : "purchase",
        totalAmount: parseFloat(createFormData.totalAmount) || 0,
        paidAmount: parseFloat(createFormData.paidAmount) || 0,
        dueDate: createFormData.dueDate,
        notes: createFormData.notes,
      });
      setIsCreateOpen(false);
      setCreateFormData({
        entityType: "customer",
        entityName: "",
        entityPhone: "",
        referenceDocId: "",
        totalAmount: "",
        paidAmount: "0",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: "",
      });
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (acc: CreditAccount) => {
    setSelectedAccount(acc);
    setEditFormData({
      entityName: acc.entityName,
      entityPhone: acc.entityPhone,
      totalAmount: String(acc.totalAmount),
      paidAmount: String(acc.paidAmount),
      dueDate: acc.dueDate,
      status: acc.status,
    });
    setIsEditOpen(true);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setIsSubmitting(true);
    try {
      await creditApi.updateAccount(selectedAccount.id, {
        entityName: editFormData.entityName,
        entityPhone: editFormData.entityPhone,
        totalAmount: parseFloat(editFormData.totalAmount) || selectedAccount.totalAmount,
        paidAmount: parseFloat(editFormData.paidAmount) || selectedAccount.paidAmount,
        dueDate: editFormData.dueDate,
        status: editFormData.status,
      });
      setIsEditOpen(false);
      setSelectedAccount(null);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    setIsSubmitting(true);
    try {
      await creditApi.deleteAccount(selectedAccount.id);
      setIsDeleteOpen(false);
      setSelectedAccount(null);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (data: {
    amount: number;
    paymentMethod: PaymentMethod;
    referenceCode: string;
    notes: string;
  }) => {
    if (!selectedAccount) return;
    await creditApi.recordPayment({
      creditAccountId: selectedAccount.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceCode: data.referenceCode,
      recordedBy: "John Kamau",
      notes: data.notes,
    });
    loadData();
  };

  // Metrics
  const customerReceivables = accounts
    .filter((a) => a.entityType === "customer")
    .reduce((sum, a) => sum + a.balanceDue, 0);

  const supplierPayables = accounts
    .filter((a) => a.entityType === "supplier")
    .reduce((sum, a) => sum + a.balanceDue, 0);

  const overdueAmount = accounts
    .filter((a) => a.status === "overdue")
    .reduce((sum, a) => sum + a.balanceDue, 0);

  const columns: Column<CreditAccount>[] = [
    {
      header: "Debtor / Creditor",
      accessorKey: "entityName",
      sortable: true,
      cell: (a) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{a.entityName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                a.entityType === "customer"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {a.entityType}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{a.referenceDocId}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Total Incurred",
      accessorKey: "totalAmount",
      sortable: true,
      cell: (a) => <span className="font-mono text-xs text-slate-600">{formatKES(a.totalAmount)}</span>,
    },
    {
      header: "Paid So Far",
      accessorKey: "paidAmount",
      sortable: true,
      cell: (a) => <span className="font-mono text-xs text-emerald-600 font-semibold">{formatKES(a.paidAmount)}</span>,
    },
    {
      header: "Outstanding Balance",
      accessorKey: "balanceDue",
      sortable: true,
      cell: (a) => (
        <span
          className={`font-mono text-xs font-black ${
            a.balanceDue > 0 ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {formatKES(a.balanceDue)}
        </span>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      sortable: true,
      cell: (a) => <span className="text-xs text-slate-500 font-medium">{formatDate(a.dueDate)}</span>,
    },
    {
      header: "Aging Status",
      accessorKey: "status",
      cell: (a) => <StatusBadge status={a.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (a) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Collect / Pay action */}
          {a.balanceDue > 0 && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedAccount(a);
                setIsPaymentOpen(true);
              }}
              className={`h-7 text-xs gap-1 font-bold ${
                a.entityType === "customer"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>{a.entityType === "customer" ? "Collect" : "Pay"}</span>
            </Button>
          )}

          {/* Edit Entry */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            title="Edit Debt/Credit Details"
            onClick={() => openEditModal(a)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Delete / Write-off */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Write-off or Delete Entry"
            onClick={() => {
              setSelectedAccount(a);
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
    { label: "All Accounts", value: "all", filterFn: () => true },
    { label: "Customer Receivables", value: "customer", filterFn: (a: CreditAccount) => a.entityType === "customer" },
    { label: "Supplier Payables", value: "supplier", filterFn: (a: CreditAccount) => a.entityType === "supplier" },
    { label: "Overdue Only", value: "overdue", filterFn: (a: CreditAccount) => a.status === "overdue" },
    { label: "Cleared / Settled", value: "cleared", filterFn: (a: CreditAccount) => a.status === "cleared" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Debt & Credit Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor receivables from customers, supplier debts, aging buckets, and installment payments.
          </p>
        </div>

        {/* Create Debt / Credit Button */}
        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Record Debt / Credit</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Customer Receivables (Owed to You)"
          value={formatKES(customerReceivables)}
          icon={<CreditCard className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Supplier Payables (You Owe)"
          value={formatKES(supplierPayables)}
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Critical Overdue Debt"
          value={formatKES(overdueAmount)}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBg="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Overdue Customer Credit Section */}
      {accounts.filter((a) => (a.status === "overdue" || a.status === "due_soon") && a.balanceDue > 0).length > 0 && (
        <Card className="border-red-200/80 bg-rose-50/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-rose-600" />
              <CardTitle className="text-sm font-bold text-slate-900">Overdue Customer Credit</CardTitle>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
              Requires Urgent Follow-up
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-rose-100 text-xs">
              {accounts
                .filter((a) => (a.status === "overdue" || a.status === "due_soon") && a.balanceDue > 0)
                .map((cred) => (
                  <div key={cred.id} className="flex items-center justify-between p-3.5">
                    <div>
                      <p className="font-semibold text-slate-900">{cred.entityName}</p>
                      <p className="text-[10px] text-slate-500">
                        Ref: {cred.referenceDocId} • Due: {formatDate(cred.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-rose-600 font-mono">{formatKES(cred.balanceDue)}</p>
                        <StatusBadge status={cred.status} />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(cred);
                          setIsPaymentOpen(true);
                        }}
                        className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                      >
                        Collect
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={accounts}
        searchKey="entityName"
        searchPlaceholder="Search customer, supplier, or invoice/sale reference..."
        filterTabs={filterTabs}
        isLoading={isLoading}
      />

      {/* Record Payment / Collection Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedAccount(null);
        }}
        recipientName={selectedAccount?.entityName || ""}
        totalBalance={selectedAccount?.balanceDue || 0}
        onRecord={handleRecordPayment}
      />

      {/* Create New Debt/Credit Modal (Create) */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && setIsCreateOpen(false)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Record New Debt or Credit</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, entityType: "customer" })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                    createFormData.entityType === "customer"
                      ? "bg-blue-50 border-blue-600 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Customer Receivable (Owed to You)
                </button>
                <button
                  type="button"
                  onClick={() => setCreateFormData({ ...createFormData, entityType: "supplier" })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                    createFormData.entityType === "supplier"
                      ? "bg-amber-50 border-amber-600 text-amber-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Supplier Payable (You Owe)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {createFormData.entityType === "customer" ? "Customer Name" : "Supplier / Creditor Name"}
              </label>
              <Input
                placeholder="e.g. David Kiprop or Kenya Garments Ltd"
                value={createFormData.entityName}
                onChange={(e) => setCreateFormData({ ...createFormData, entityName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Contact Phone</label>
                <Input
                  placeholder="+254 7..."
                  value={createFormData.entityPhone}
                  onChange={(e) => setCreateFormData({ ...createFormData, entityPhone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Reference Doc ID</label>
                <Input
                  placeholder="e.g. SALE-00122, PO-089"
                  value={createFormData.referenceDocId}
                  onChange={(e) => setCreateFormData({ ...createFormData, referenceDocId: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Total Amount Incurred (KES)</label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={createFormData.totalAmount}
                  onChange={(e) => setCreateFormData({ ...createFormData, totalAmount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Initial Paid Amount (KES)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={createFormData.paidAmount}
                  onChange={(e) => setCreateFormData({ ...createFormData, paidAmount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Settlement Due Date</label>
              <Input
                type="date"
                value={createFormData.dueDate}
                onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Notes / Agreement</label>
              <Input
                placeholder="e.g. Corporate 30-day invoice arrangement"
                value={createFormData.notes}
                onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                Record Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Debt/Credit Modal (Update) */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pencil className="h-4 w-4 text-blue-600" />
              <span>Edit Account: {selectedAccount?.entityName}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAccount} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Debtor / Creditor Name</label>
              <Input
                value={editFormData.entityName}
                onChange={(e) => setEditFormData({ ...editFormData, entityName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Contact Phone</label>
                <Input
                  value={editFormData.entityPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, entityPhone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Status</label>
                <select
                  className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                >
                  <option value="current">Current</option>
                  <option value="due_soon">Due Soon</option>
                  <option value="overdue">Overdue</option>
                  <option value="cleared">Cleared / Paid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Total Incurred (KES)</label>
                <Input
                  type="number"
                  value={editFormData.totalAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, totalAmount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Paid So Far (KES)</label>
                <Input
                  type="number"
                  value={editFormData.paidAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, paidAmount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Due Date</label>
              <Input
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                required
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

      {/* Delete / Write-off Confirmation Modal (Delete) */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedAccount(null);
        }}
        onConfirm={handleDeleteAccount}
        title={`Write-off / Delete ${selectedAccount?.entityName}?`}
        description={`Are you sure you want to remove or write off this ${selectedAccount?.entityType === "customer" ? "customer receivable" : "supplier payable"} of ${formatKES(selectedAccount?.balanceDue || 0)}? This will remove the balance from your outstanding ledger.`}
        confirmLabel="Write Off / Delete"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </div>
  );
}
