import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { expensesApi } from "@/lib/api/expenses";
import { Expense, ExpenseCategory, PaymentMethod } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/business/StatCard";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, TrendingDown, DollarSign, Calendar, Tag, Trash2 } from "lucide-react";

export default function ExpensesPage() {
  const { currentTenant } = useTenant();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    category: "Rent and Utilities" as ExpenseCategory,
    amount: 0,
    paymentMethod: "mpesa" as PaymentMethod,
    description: "",
    isRecurring: false,
    recurringFrequency: "monthly" as "monthly" | "weekly" | "annually",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await expensesApi.getExpenses(currentTenant.id);
      setExpenses(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || newExpense.amount <= 0) return;
    setIsSubmitting(true);

    try {
      await expensesApi.createExpense({
        tenantId: currentTenant.id,
        title: newExpense.title,
        category: newExpense.category,
        amount: Number(newExpense.amount),
        paymentMethod: newExpense.paymentMethod,
        date: new Date().toISOString().split("T")[0],
        recordedBy: "John Kamau",
        description: newExpense.description,
        isRecurring: newExpense.isRecurring,
        recurringFrequency: newExpense.isRecurring ? newExpense.recurringFrequency : undefined,
        status: "approved",
      });

      setIsAddOpen(false);
      setNewExpense({
        title: "",
        category: "Rent and Utilities",
        amount: 0,
        paymentMethod: "mpesa",
        description: "",
        isRecurring: false,
        recurringFrequency: "monthly",
      });
      loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await expensesApi.deleteExpense(id);
    loadData();
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const recurringAmount = expenses.filter((e) => e.isRecurring).reduce((sum, e) => sum + e.amount, 0);
  const rentTotal = expenses.filter((e) => e.category === "Rent and Utilities").reduce((sum, e) => sum + e.amount, 0);

  const columns: Column<Expense>[] = [
    {
      header: "Expense Title",
      accessorKey: "title",
      sortable: true,
      cell: (e) => (
        <div>
          <p className="font-semibold text-slate-900 leading-tight">{e.title}</p>
          {e.description && <p className="text-[11px] text-slate-400">{e.description}</p>}
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (e) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {e.category}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      sortable: true,
      cell: (e) => <span className="font-mono text-xs font-bold text-rose-600">-{formatKES(e.amount)}</span>,
    },
    {
      header: "Payment Method",
      accessorKey: "paymentMethod",
      sortable: true,
      cell: (e) => <span className="uppercase text-xs font-semibold text-slate-700">{e.paymentMethod}</span>,
    },
    {
      header: "Recurring",
      accessorKey: "isRecurring",
      cell: (e) => (
        <span className={`text-[11px] font-medium ${e.isRecurring ? "text-blue-600 font-bold" : "text-slate-400"}`}>
          {e.isRecurring ? `Yes (${e.recurringFrequency})` : "One-off"}
        </span>
      ),
    },
    {
      header: "Recorded By",
      accessorKey: "recordedBy",
    },
    {
      header: "Date",
      accessorKey: "date",
      sortable: true,
      cell: (e) => <span className="text-xs text-slate-500">{formatDate(e.date)}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (e) => (
        <button
          onClick={() => handleDeleteExpense(e.id)}
          className="text-slate-400 hover:text-red-600 p-1"
          title="Delete record"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Expenses and Outflows</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log operational overhead, lease rents, utility bills, and inventory transport costs.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expense</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total Operating Expenses"
          value={formatKES(totalAmount)}
          icon={<TrendingDown className="h-5 w-5" />}
          iconBg="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Recurring Overhead"
          value={formatKES(recurringAmount)}
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Rent and Utilities"
          value={formatKES(rentTotal)}
          icon={<Tag className="h-5 w-5" />}
          iconBg="bg-amber-50 text-amber-600"
        />
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        searchKey="title"
        searchPlaceholder="Search expenses by title or category..."
        isLoading={isLoading}
        emptyTitle="No expenses recorded"
        emptyDescription="Keep track of store operational costs."
        emptyActionLabel="Record Expense"
        onEmptyAction={() => setIsAddOpen(true)}
      />

      {/* Record Expense Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Record Business Expense</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateExpense} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Expense Title</label>
              <Input
                placeholder="e.g. September Fiber Internet Bill"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="Rent and Utilities">Rent and Utilities</option>
                  <option value="Salaries and Wages">Salaries and Wages</option>
                  <option value="Inventory and Logistics">Inventory and Logistics</option>
                  <option value="Marketing and Ads">Marketing and Ads</option>
                  <option value="Maintenance and Repairs">Maintenance and Repairs</option>
                  <option value="Licenses and Taxes">Licenses and Taxes</option>
                  <option value="Office and Admin">Office and Admin</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Amount (KES)</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={newExpense.amount || ""}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(["mpesa", "cash", "bank_transfer"] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setNewExpense({ ...newExpense, paymentMethod: m })}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize ${
                      newExpense.paymentMethod === m
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                        : "border-slate-200"
                    }`}
                  >
                    {m === "mpesa" ? "M-Pesa" : m === "cash" ? "Cash" : "Bank"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
              <Input
                placeholder="Details or receipt note..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={newExpense.isRecurring}
                onChange={(e) => setNewExpense({ ...newExpense, isRecurring: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="font-semibold">This is a regular monthly recurring expense</span>
            </label>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
