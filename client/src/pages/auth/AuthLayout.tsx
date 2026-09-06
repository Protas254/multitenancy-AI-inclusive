import React from "react";
import { Outlet } from "react-router-dom";
import { Link } from "@/components/ui/link";
import { Store, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Column: Interactive Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">
              SME OS
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto py-8">
          {children || <Outlet />}
        </div>

        <div className="text-xs text-slate-400 text-center sm:text-left">
          © 2026 SME Business Operating System. All rights reserved.
        </div>
      </div>

      {/* Right Column: SaaS Visual Showcase */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-blue-900/30 via-transparent to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Enterprise-Grade Multi-Tenancy</span>
        </div>

        <div className="space-y-6 max-w-lg z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Streamline your daily retail operations, sales, staff, and cashflow.
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Full POS terminal with instant M-Pesa verification</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Real-time stock valuation & automated low-stock reorder warnings</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Customer credit ledger, loyalty points & monthly payroll runs</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 z-10 flex items-center justify-between">
          <span>Active Businesses Managed</span>
          <span className="font-bold text-white font-mono">1,250+ Kenyan SMEs</span>
        </div>
      </div>
    </div>
  );
}
