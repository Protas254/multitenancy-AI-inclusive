import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { invoicesApi } from "@/lib/api/invoices";
import { customersApi } from "@/lib/api/customers";
import { productsApi } from "@/lib/api/products";
import { Customer, Product, InvoiceItem } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, FileText, CheckCircle2 } from "lucide-react";

export default function NewInvoicePage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "Consulting and Executive Styling Package", quantity: 1, unitPrice: 15000, discount: 0, taxRate: 16, amount: 15000 },
  ]);
  const [notes, setNotes] = useState("Corporate hospitality styling package.");
  const [terms, setTerms] = useState("Strict 14-day settlement term via Standard Chartered Bank or M-Pesa Paybill.");

  useEffect(() => {
    async function load() {
      const [c, p] = await Promise.all([
        customersApi.getCustomers(currentTenant.id),
        productsApi.getProducts(currentTenant.id),
      ]);
      setCustomers(c);
      setProducts(p);
      if (c.length > 0) setSelectedCustomerId(c[0].id);
    }
    load();
  }, [currentTenant.id]);

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 16, amount: 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, fields: Partial<InvoiceItem>) => {
    setItems((prev) => {
      const list = [...prev];
      const updated = { ...list[index], ...fields };
      updated.amount = Math.max(0, updated.quantity * updated.unitPrice - updated.discount);
      list[index] = updated;
      return list;
    });
  };

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const taxAmount = Math.round(subtotal * 0.16);
  const discountAmount = items.reduce((sum, i) => sum + i.discount, 0);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || items.length === 0) return;
    setIsLoading(true);

    try {
      const customer = customers.find((c) => c.id === selectedCustomerId);

      const inv = await invoicesApi.createInvoice({
        tenantId: currentTenant.id,
        customerId: selectedCustomerId,
        customerName: customer?.name || "Client",
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        customerAddress: customer?.address,
        issueDate,
        dueDate,
        items,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        notes,
        terms,
      });

      router.push(`/invoices/${inv.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/invoices">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">New Commercial Invoice</h1>
          <p className="text-xs text-slate-500">Draft and issue an itemized tax invoice to a corporate client.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer and Date Details */}
        <Card className="p-6 space-y-4">
          <CardTitle className="text-sm font-bold">Client and Billing Terms</CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Issue Date</label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* Line Items Table */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">Itemized Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item</span>
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    placeholder="Item description or product name..."
                    value={item.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    className="flex-1 text-xs"
                    required
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Unit Price (KES)</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Discount (KES)</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.discount || ""}
                      onChange={(e) => updateItem(idx, { discount: Number(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Line Total</label>
                    <div className="h-8 flex items-center font-mono font-bold text-xs text-slate-900">
                      {formatKES(item.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Box */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatKES(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (16%):</span>
                <span className="font-mono">{formatKES(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-blue-600 font-mono">{formatKES(totalAmount)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes and Terms */}
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Internal Notes (Optional)</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Payment Terms</label>
              <Input value={terms} onChange={(e) => setTerms(e.target.value)} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/invoices">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" isLoading={isLoading} className="bg-blue-600 hover:bg-blue-700 font-bold px-8">
            Create and Issue Invoice ({formatKES(totalAmount)})
          </Button>
        </div>
      </form>
    </div>
  );
}
