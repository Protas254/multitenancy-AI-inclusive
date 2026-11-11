import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { Loader2, Clock, Sparkles, AlertTriangle, BellRing } from "lucide-react";
import Link from "@/components/ui/link";
import { SEO } from "@/components/common/SEO";
import { PushNotificationPrompt } from "@/components/common/PushNotificationPrompt";

export default function AppLayout({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentTenant } = useTenant();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Loading Business Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isTrial = currentTenant.plan === "trial" || currentTenant.planStatus === "trial";
  const isExpired = currentTenant.planStatus === "expired" || Boolean(currentTenant.isTrialExpired);
  const daysLeft = currentTenant.daysRemainingInTrial ?? 14;
  // User requested: "make this apprear when 2 days are remaining and animate it well as an alarm"
  const showTrialAlarm = isTrial && !isExpired && daysLeft <= 2;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      <SEO noindex={true} nofollow={true} />
      {/* Persistent Left Sidebar — flush, no margin */}
      <Sidebar />

      {/* Main Content Area — takes all remaining width */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />

        {/* 14-Day Free Trial Alarm Banner - Only appears when 2 days or fewer are remaining */}
        {showTrialAlarm && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2.5 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-md z-20 shrink-0 border-b border-rose-400/40 animate-alarm-beacon">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-red-950/40 border border-amber-300/40 shrink-0">
                <BellRing className="h-4 w-4 text-amber-300 animate-alarm-ring" />
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white/20 uppercase tracking-widest text-[10px] font-black px-2 py-0.5 rounded-full">
                    Trial Expiring Alarm
                  </span>
                  <span className="font-bold text-white">
                    {daysLeft <= 0 ? "Last Day Today!" : `Only ${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining!`}
                  </span>
                </div>
                <p className="text-[11px] text-rose-100">
                  Upgrade your plan now to prevent interruption to your POS, Inventory, and multi-branch features.
                </p>
              </div>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-1.5 bg-white text-red-700 hover:bg-amber-50 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all shadow-md hover:shadow-lg shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Upgrade to Growth or Enterprise</span>
            </Link>
          </div>
        )}

        {/* Expired Trial Warning Banner */}
        {isExpired && (
          <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white px-4 py-2.5 text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs z-10 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-200 shrink-0" />
              <span>
                <strong>Free Trial Ended:</strong> Your 14-day trial has concluded. Activate a plan to maintain operations.
              </span>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0"
            >
              <span>Activate Plan</span>
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* One-Time Web Push Notification Permission Prompt */}
      <PushNotificationPrompt />
    </div>
  );
}
