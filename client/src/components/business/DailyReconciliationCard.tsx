import React, { useState, useEffect } from "react";
import Link from "@/components/ui/link";
import { useRouter } from "@/lib/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { DailyReconciliation } from "@/lib/types";
import { reconciliationsApi } from "@/lib/api/reconciliations";
import { formatKES } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Smartphone,
  Layers,
  Save,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const DailyReconciliationCard: React.FC = () => {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const [allReconciliations, setAllReconciliations] = useState<DailyReconciliation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Direct Interactive Inputs matching the user's screenshot
  const [physicalCash, setPhysicalCash] = useState<string>("20000.00");
  const [mpesaStatement, setMpesaStatement] = useState<string>("6000.00");

  // System Recorded Values from POS
  const [systemCash, setSystemCash] = useState<number>(0);
  const [systemMpesa, setSystemMpesa] = useState<number>(0);
  const [hasSavedToday, setHasSavedToday] = useState(false);

  const loadData = async () => {
    const data = await reconciliationsApi.getAllReconciliations();
    setAllReconciliations(data);

    const todayStr = new Date().toISOString().split("T")[0];
    const match = data.find((r) => r.tenantId === currentTenant.id && r.date === todayStr);
    if (match) {
      setPhysicalCash(String(match.actualCash.toFixed(2)));
      setMpesaStatement(String(match.mpesaActual.toFixed(2)));
      setSystemCash(match.cashSales - match.cashExpenses);
      setSystemMpesa(match.mpesaExpected);
      setHasSavedToday(true);
    } else {
      // Default to today's tenant values
      const current = data.find((r) => r.tenantId === currentTenant.id) || data[0];
      if (current) {
        setSystemCash(Math.max(0, current.cashSales - current.cashExpenses));
        setSystemMpesa(current.mpesaExpected);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const currentRec = allReconciliations.find((r) => r.tenantId === currentTenant.id) || allReconciliations[0];

  // Live Auto-Calculations matching screenshot 3
  const numPhysicalCash = parseFloat(physicalCash) || 0;
  const numMpesaStatement = parseFloat(mpesaStatement) || 0;

  // 1. Total Physical Collection = Physical Cash Count + M-Pesa Statement Total
  const totalPhysicalCollection = numPhysicalCash + numMpesaStatement;

  // 2. Total System Records = System Cash + System M-Pesa
  const totalSystemRecords = systemCash + systemMpesa;

  // 3. Differences
  const cashDiff = numPhysicalCash - systemCash;
  const mpesaDiff = numMpesaStatement - systemMpesa;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await reconciliationsApi.saveReconciliation({
        tenantId: currentTenant.id,
        tenantName: currentTenant.name,
        branchId: currentRec?.branchId || "br-main",
        branchName: currentRec?.branchName || "Main Branch",
        cashSales: systemCash,
        cashExpenses: 0,
        actualCash: numPhysicalCash,
        mpesaExpected: systemMpesa,
        mpesaActual: numMpesaStatement,
        reconciledBy: "John Kamau",
        notes: "Daily close verified and synced with system records.",
      });
      setHasSavedToday(true);
      setSaveSuccess(true);
      await loadData();
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200/90 shadow-sm rounded-2xl overflow-hidden bg-white">
      {/* Top Header matching Screenshots 1 & 2 */}
      <CardHeader className="bg-white border-b border-slate-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Daily Verification & Cash Drawer Reconciliation
              </CardTitle>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Saved to Reports</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Input today's counted cash and M-Pesa statement &mdash; the system calculates the totals and differences automatically.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Confirm & Close Day / Update Record */}
            <Button
              size="default"
              onClick={handleSave}
              isLoading={isSubmitting}
              className="gap-2 text-xs font-semibold bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-sm rounded-xl px-5 h-10 transition-colors"
            >
              <span>{hasSavedToday ? "Update Record" : "Confirm & Close Day"}</span>
              <Save className="h-4 w-4" />
            </Button>

            {/* Reports → */}
            <Link href="/reports/closing">
              <Button
                variant="outline"
                size="default"
                className="gap-2 text-xs font-semibold bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs rounded-xl px-5 h-10 transition-colors"
              >
                <span>Reports</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          {/* ROW 1: Two Large Input Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Physical Cash Count */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Wallet className="h-4 w-4 text-emerald-600" />
                <span>Physical Cash Count</span>
              </div>

              <div className="flex items-center h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3.5">
                <span className="text-xs font-bold text-slate-400 font-mono select-none mr-2">
                  KES
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={physicalCash}
                  onChange={(e) => setPhysicalCash(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-sm font-bold text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 px-1">
                <span className="text-slate-400 font-medium">
                  System Recorded:{" "}
                  <strong className="text-slate-600 font-mono">{formatKES(systemCash)}</strong>
                </span>
                <span
                  className={`font-mono font-bold ${
                    cashDiff === 0
                      ? "text-slate-500"
                      : cashDiff > 0
                      ? "text-blue-600"
                      : "text-rose-600"
                  }`}
                >
                  Diff: {cashDiff >= 0 ? `+${cashDiff.toLocaleString("en-KE", { minimumFractionDigits: 2 })}` : cashDiff.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Box 2: M-Pesa Statement Total */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span>M-Pesa Statement Total</span>
              </div>

              <div className="flex items-center h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3.5">
                <span className="text-xs font-bold text-slate-400 font-mono select-none mr-2">
                  KES
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={mpesaStatement}
                  onChange={(e) => setMpesaStatement(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-sm font-bold text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 px-1">
                <span className="text-slate-400 font-medium">
                  System Recorded:{" "}
                  <strong className="text-slate-600 font-mono">{formatKES(systemMpesa)}</strong>
                </span>
                <span
                  className={`font-mono font-bold ${
                    mpesaDiff === 0
                      ? "text-slate-500"
                      : mpesaDiff > 0
                      ? "text-blue-600"
                      : "text-rose-600"
                  }`}
                >
                  Diff: {mpesaDiff >= 0 ? `+${mpesaDiff.toLocaleString("en-KE", { minimumFractionDigits: 2 })}` : mpesaDiff.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* ROW 2: Auto-Calculated Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Card 1: TOTAL PHYSICAL COLLECTION */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-4 shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  TOTAL PHYSICAL COLLECTION
                </span>
                <span className="text-lg font-black font-mono text-slate-900 block mt-0.5">
                  KES {totalPhysicalCollection.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Card 2: TOTAL SYSTEM RECORDS */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-4 shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  TOTAL SYSTEM RECORDS
                </span>
                <span className="text-lg font-black font-mono text-slate-900 block mt-0.5">
                  KES {totalSystemRecords.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

