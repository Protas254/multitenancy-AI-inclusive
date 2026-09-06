import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useTenant } from "@/contexts/TenantContext";
import { DailyReconciliation } from "@/lib/types";
import { reconciliationsApi } from "@/lib/api/reconciliations";
import { formatKES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Smartphone,
  Banknote,
  Calendar,
} from "lucide-react";

export default function ReconciliationReportsPage() {
  const { currentTenant, switchTenant } = useTenant();
  const [logs, setLogs] = useState<DailyReconciliation[]>([]);
  const [allLogs, setAllLogs] = useState<DailyReconciliation[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "all">("current");
  const [selectedMonth, setSelectedMonth] = useState("September");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedLog, setSelectedLog] = useState<DailyReconciliation | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = ["2024", "2025", "2026", "2027"];

  const loadLogs = async () => {
    const data = await reconciliationsApi.getDailyReconciliations(currentTenant.id);
    setLogs(data);
    const all = await reconciliationsApi.getAllReconciliations();
    setAllLogs(all);
  };

  useEffect(() => {
    loadLogs();
  }, [currentTenant.id]);

  const openBreakdown = (log: DailyReconciliation) => {
    setSelectedLog(log);
    setIsBreakdownOpen(true);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
          Closing Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of daily cash and M-Pesa verifications
        </p>
      </div>

      {/* Filters Row: Switcher + Month & Year */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Active / All Business Pill Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === "current"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active Business
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Businesses ({allLogs.length})
          </button>
        </div>

        {/* Month / Year filters — only relevant for current-business view */}
        {activeTab === "current" && (
          <>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Main Verification Logs Card */}
      <Card className="rounded-2xl border border-slate-200 shadow-xs overflow-hidden bg-white">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              {activeTab === "current"
                ? `Daily Verification Logs for ${selectedMonth} ${selectedYear}`
                : "All Businesses — Latest Reconciliation Overview"}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === "current"
              ? "Compare your manual counts against system records over time"
              : "Cross-business snapshot of the most recent closing records"}
          </p>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
          {activeTab === "current" ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Reported</th>
                  <th className="py-3 px-4">System Total</th>
                  <th className="py-3 px-4">Difference</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                      No daily closing reports recorded for this period yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isReconciled = log.status === "reconciled";
                    const totalReported = (log.actualCash || 0) + (log.mpesaActual || 0);
                    const systemTotal = (log.cashSales || 0) + (log.mpesaExpected || 0);
                    const totalDiff = totalReported - systemTotal;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-5 font-semibold text-slate-900">
                          {formatDateDisplay(log.date)}
                        </td>
                        <td className="py-4 px-4">
                          {isReconciled ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>RECONCILED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>DISCREPANCY</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900 font-mono">{formatKES(totalReported)}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Banknote className="h-3 w-3" />
                              {formatKES(log.actualCash).replace("KES ", "")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              {formatKES(log.mpesaActual).replace("KES ", "")}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-medium text-slate-700">
                          {formatKES(systemTotal)}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold">
                          {totalDiff === 0 ? (
                            <span className="text-emerald-600">KES 0.00</span>
                          ) : totalDiff > 0 ? (
                            <span className="inline-flex items-center gap-1 text-blue-600">
                              <TrendingUp className="h-3.5 w-3.5" />
                              <span>+{formatKES(totalDiff).replace("KES ", "")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600">
                              <TrendingDown className="h-3.5 w-3.5" />
                              <span>{formatKES(totalDiff).replace("KES ", "")}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 max-w-[200px] truncate text-[11px]">
                          {log.notes || "—"}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openBreakdown(log)}
                            className="h-7 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1.5"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Breakdown</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* All Businesses Overview Table */
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Business</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Counted Cash</th>
                  <th className="py-3 px-4 text-right">M-Pesa</th>
                  <th className="py-3 px-4 text-right font-bold">Total Collection</th>
                  <th className="py-3 px-4 text-right">System Total</th>
                  <th className="py-3 px-4 text-right">Difference</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {allLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                      No reconciliation records found.
                    </td>
                  </tr>
                ) : (
                  allLogs.map((rec) => {
                    const isActive = rec.tenantId === currentTenant.id;
                    const totalCollection = (rec.actualCash || 0) + (rec.mpesaActual || 0);
                    const systemTotal = (rec.cashSales - rec.cashExpenses) + (rec.mpesaExpected || 0);
                    const diff = totalCollection - systemTotal;

                    return (
                      <tr key={rec.id} className={`hover:bg-slate-50/70 transition-colors ${isActive ? "bg-blue-50/30" : ""}`}>
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-900">{rec.tenantName}</p>
                          <p className="text-[10px] text-slate-500">{rec.branchName} · {rec.reconciledBy}</p>
                        </td>
                        <td className="py-4 px-4">
                          {rec.status === "reconciled" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase">
                              <CheckCircle2 className="h-3.5 w-3.5" /><span>OK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 uppercase">
                              <AlertCircle className="h-3.5 w-3.5" /><span>Diff</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-slate-700">{formatKES(rec.actualCash)}</td>
                        <td className="py-4 px-4 text-right font-mono text-slate-700">{formatKES(rec.mpesaActual)}</td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">{formatKES(totalCollection)}</td>
                        <td className="py-4 px-4 text-right font-mono text-slate-600">{formatKES(systemTotal)}</td>
                        <td className="py-4 px-4 text-right font-mono font-bold">
                          <span className={diff === 0 ? "text-emerald-600" : diff > 0 ? "text-blue-600" : "text-rose-600"}>
                            {diff === 0 ? "KES 0.00" : `${diff > 0 ? "+" : ""}${diff.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => switchTenant(rec.tenantId)}
                            className="h-7 px-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {isActive ? "Active" : "Switch To"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        </CardContent>
      </Card>

      {/* Itemized Breakdown Modal */}
      <Dialog open={isBreakdownOpen} onOpenChange={(open) => !open && setIsBreakdownOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Closing Report: {selectedLog ? formatDateDisplay(selectedLog.date) : ""}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Business Branch:</span>
                  <span className="font-bold text-slate-900">{selectedLog.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Audited By:</span>
                  <span className="font-semibold text-slate-800">{selectedLog.reconciledBy}</span>
                </div>
                {selectedLog.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Close Time:</span>
                    <span className="font-mono text-slate-700">{selectedLog.verifiedAt}</span>
                  </div>
                )}
              </div>

              {/* Cash Counts */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  <span>Physical Cash Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400">Cash Sales:</span>
                    <p className="font-mono font-semibold text-slate-800">{formatKES(selectedLog.cashSales)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Cash Expenses:</span>
                    <p className="font-mono font-semibold text-rose-600">-{formatKES(selectedLog.cashExpenses)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Expected in Till:</span>
                    <p className="font-mono font-bold text-blue-700">{formatKES(selectedLog.expectedCash)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Actual Cash Counted:</span>
                    <p className="font-mono font-bold text-slate-900">{formatKES(selectedLog.actualCash)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                  <span>Cash Difference:</span>
                  <span
                    className={
                      selectedLog.cashDiscrepancy === 0
                        ? "text-emerald-600"
                        : selectedLog.cashDiscrepancy < 0
                        ? "text-rose-600"
                        : "text-amber-600"
                    }
                  >
                    {selectedLog.cashDiscrepancy === 0
                      ? "KES 0.00 (Balanced)"
                      : formatKES(selectedLog.cashDiscrepancy)}
                  </span>
                </div>
              </div>

              {/* M-PESA Counts */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span>M-PESA (Till / Paybill) Details</span>
                </h4>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-500">M-PESA Statement:</span>
                  <span className="font-mono font-bold text-slate-900">{formatKES(selectedLog.mpesaActual)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">System Recorded:</span>
                  <span className="font-mono text-slate-700">{formatKES(selectedLog.mpesaExpected)}</span>
                </div>
              </div>

              {selectedLog.notes && (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-xs">
                  <strong className="text-slate-800">Note: </strong>
                  {selectedLog.notes}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBreakdownOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
