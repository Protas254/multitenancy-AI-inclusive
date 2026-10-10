import React from "react";
import { Invoice, Tenant } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { Printer, Download, Mail, Building2, Phone, MapPin, Calendar, Clock } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface InvoicePreviewProps {
  invoice: Invoice;
  tenant: Tenant;
  onRecordPayment?: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  tenant,
  onRecordPayment,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Status:</span>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex items-center gap-2">
          {invoice.balanceDue > 0 && onRecordPayment && (
            <Button size="sm" onClick={onRecordPayment} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              Record Payment
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-slate-800"
      >
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                {tenant.name.charAt(0)}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{tenant.name}</h1>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">{tenant.address}</p>
            <p className="text-xs text-slate-500">Tel: {tenant.phone} | Email: {tenant.email}</p>
            {tenant.settings.taxNumber && (
              <p className="text-xs font-mono text-slate-500">KRA PIN: {tenant.settings.taxNumber}</p>
            )}
          </div>

          <div className="text-left md:text-right">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">INVOICE</h2>
            <p className="text-sm font-mono font-bold text-blue-600 mt-1">{invoice.invoiceNumber}</p>
            <div className="mt-2 text-xs space-y-0.5 text-slate-500">
              <p>Issue Date: <span className="font-semibold text-slate-800">{formatDate(invoice.issueDate)}</span></p>
              <p>Due Date: <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate)}</span></p>
            </div>
          </div>
        </div>

        {/* Bill To and Ship To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">BILLED TO</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">{invoice.customerName}</h3>
            {invoice.customerAddress && <p className="text-xs text-slate-600 mt-0.5">{invoice.customerAddress}</p>}
            {invoice.customerPhone && <p className="text-xs text-slate-600">Phone: {invoice.customerPhone}</p>}
            {invoice.customerEmail && <p className="text-xs text-slate-600">Email: {invoice.customerEmail}</p>}
          </div>

          <div className="md:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PAYMENT SUMMARY</span>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between md:justify-end gap-6 text-xs">
                <span className="text-slate-500">Total Invoiced:</span>
                <span className="font-bold text-slate-900">{formatKES(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-6 text-xs">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-semibold text-emerald-600">{formatKES(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-6 text-sm font-bold pt-1 border-t border-slate-100">
                <span className="text-slate-900">Balance Due:</span>
                <span className="text-blue-600 font-mono">{formatKES(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Tax (16%)</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 pr-4 font-medium text-slate-900">{item.description}</td>
                  <td className="py-3.5 px-2 text-center">{item.quantity}</td>
                  <td className="py-3.5 px-2 text-right">{formatKES(item.unitPrice)}</td>
                  <td className="py-3.5 px-2 text-right text-slate-500">
                    {formatKES((item.amount * 16) / 116)}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-semibold text-slate-900">
                    {formatKES(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <div className="w-full max-w-xs space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatKES(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatKES(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>VAT (16%)</span>
              <span>{formatKES(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Due</span>
              <span className="text-blue-600">{formatKES(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="mt-12 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500">
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Payment Instructions</h4>
            <p>Bank: Standard Chartered Bank Kenya</p>
            <p>Account Name: {tenant.name}</p>
            <p>Account Number: 0102049928100</p>
            <p>M-Pesa Paybill: 522522 | Account: {invoice.invoiceNumber}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">Terms and Conditions</h4>
            <p className="whitespace-pre-line">{invoice.terms || "Goods delivered in good order. Payment due strictly on agreed terms."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
