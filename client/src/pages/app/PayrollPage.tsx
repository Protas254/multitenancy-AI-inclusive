import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { payrollApi } from "@/lib/api/payroll";
import { PayrollRun, PayrollItem } from "@/lib/types";
import { formatKES, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/business/StatCard";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Banknote, CheckCircle2, Printer, DollarSign, Users, Award, ShieldCheck } from "lucide-react";

export default function PayrollPage() {
  const { currentTenant } = useTenant();
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayslipItem, setSelectedPayslipItem] = useState<PayrollItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await payrollApi.getCurrentRun(currentTenant.id);
      setPayrollRun(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleApprove = async () => {
    if (!payrollRun) return;
    const updated = await payrollApi.approvePayroll(payrollRun.id, "John Kamau");
    setPayrollRun(updated);
  };

  const handleMarkPaid = async () => {
    if (!payrollRun) return;
    const updated = await payrollApi.markPaid(payrollRun.id);
    setPayrollRun(updated);
  };

  if (isLoading || !payrollRun) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading payroll sheet...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Payroll: {payrollRun.periodMonth}
            </h1>
            <StatusBadge status={payrollRun.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated salary calculations with sales commission and statutory deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {payrollRun.status === "draft" && (
            <Button onClick={handleApprove} size="sm" className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve Payroll</span>
            </Button>
          )}
          {payrollRun.status === "approved" && (
            <Button onClick={handleMarkPaid} size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700">
              <Banknote className="h-4 w-4" />
              <span>Disburse / Mark Paid</span>
            </Button>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Wages"
          value={formatKES(payrollRun.totalGross)}
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Statutory Deductions"
          value={formatKES(payrollRun.totalDeductions)}
          icon={<ShieldCheck className="h-5 w-5" />}
          iconBg="bg-slate-100 text-slate-700"
        />
        <StatCard
          title="Net Take-Home Pay"
          value={formatKES(payrollRun.totalNet)}
          icon={<Banknote className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Employees on Payroll"
          value={`${payrollRun.totalEmployees} staff`}
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Employee Payroll Breakdown Table */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold">Staff Salary Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Staff & Role</th>
                <th className="p-3.5 text-right">Basic Pay</th>
                <th className="p-3.5 text-right">Commission</th>
                <th className="p-3.5 text-right">Allowances</th>
                <th className="p-3.5 text-right">Deductions</th>
                <th className="p-3.5 text-right">Net Payable</th>
                <th className="p-3.5 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payrollRun.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-3.5 font-semibold text-slate-900">
                    <p>{item.staffName}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{item.role}</p>
                  </td>
                  <td className="p-3.5 text-right font-mono">{formatKES(item.basicSalary)}</td>
                  <td className="p-3.5 text-right font-mono text-emerald-600 font-semibold">
                    {item.commission > 0 ? `+${formatKES(item.commission)}` : "—"}
                  </td>
                  <td className="p-3.5 text-right font-mono text-blue-600">
                    {item.allowances > 0 ? `+${formatKES(item.allowances)}` : "—"}
                  </td>
                  <td className="p-3.5 text-right font-mono text-rose-600">
                    -{formatKES(item.deductions)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                    {formatKES(item.netPay)}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPayslipItem(item)}
                      className="h-7 text-xs gap-1"
                    >
                      <Printer className="h-3 w-3" />
                      <span>Payslip</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Printable Payslip Modal */}
      <Dialog open={!!selectedPayslipItem} onOpenChange={(open) => !open && setSelectedPayslipItem(null)}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-slate-50">
          <DialogHeader className="p-4 bg-white border-b border-slate-100 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold">Employee Payslip</DialogTitle>
            <Button size="sm" variant="outline" onClick={() => window.print()} className="h-8 gap-1 text-xs">
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </Button>
          </DialogHeader>

          {selectedPayslipItem && (
            <div className="p-6 flex justify-center">
              <div
                id="printable-receipt"
                className="w-full max-w-[360px] bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-800 space-y-4"
              >
                {/* Header */}
                <div className="text-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-sm text-slate-950 uppercase">{currentTenant.name}</h3>
                  <p className="text-[11px] text-slate-500">PAYSLIP — {payrollRun.periodMonth}</p>
                </div>

                {/* Staff Meta */}
                <div className="space-y-1 text-xs border-b border-slate-100 pb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee:</span>
                    <span className="font-bold text-slate-900">{selectedPayslipItem.staffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Designation:</span>
                    <span>{selectedPayslipItem.role}</span>
                  </div>
                </div>

                {/* Earnings & Deductions */}
                <div className="space-y-2 text-xs">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Earnings</p>
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span className="font-mono">{formatKES(selectedPayslipItem.basicSalary)}</span>
                  </div>
                  {selectedPayslipItem.commission > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Sales Commission:</span>
                      <span className="font-mono">+{formatKES(selectedPayslipItem.commission)}</span>
                    </div>
                  )}
                  {selectedPayslipItem.allowances > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Allowances:</span>
                      <span className="font-mono">+{formatKES(selectedPayslipItem.allowances)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-100">
                    <span>Gross Pay:</span>
                    <span className="font-mono">{formatKES(selectedPayslipItem.grossPay)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t border-slate-100 pt-2">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Deductions</p>
                  <div className="flex justify-between text-rose-600">
                    <span>Statutory & PAYE:</span>
                    <span className="font-mono">-{formatKES(selectedPayslipItem.deductions)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-sm font-black text-slate-950">
                  <span>Net Take-Home Pay:</span>
                  <span className="text-blue-600 font-mono">{formatKES(selectedPayslipItem.netPay)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
