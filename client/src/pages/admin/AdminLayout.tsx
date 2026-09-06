import React from "react";
import { Outlet } from "react-router-dom";
import { Link } from "@/components/ui/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Superadmin Top Navigation */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight">SME OS SuperAdmin</h1>
            <p className="text-[10px] text-purple-400 font-semibold uppercase">Multi-Tenant Platform Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-200 border-slate-700 hover:bg-slate-800">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Store App</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {children || <Outlet />}
      </main>
    </div>
  );
}
