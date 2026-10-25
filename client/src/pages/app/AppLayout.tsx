import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { Loader2, Clock, Sparkles, AlertTriangle } from "lucide-react";
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

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      <SEO noindex={true} nofollow={true} />
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        {/* 14-Day Free Trial Notice Banner */}
        {isTrial && !isExpired && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <Clock className="h-3.5 w-3.5 text-blue-200" />
              <span>
                <strong>14-Day Free Trial:</strong> {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining. You have <strong>Full Enterprise Access</strong> to all features.
              </span>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs"
            >
              <Sparkles className="h-3 w-3" />
              <span>Upgrade to Growth or Enterprise</span>
            </Link>
          </div>
        )}

        {/* Expired Trial Warning Banner */}
        {isExpired && (
          <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs z-10 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-200" />
              <span>
                <strong>Free Trial Ended:</strong> Your 14-day trial has concluded. Activate a plan to maintain operations.
              </span>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs"
            >
              <span>Activate Plan</span>
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* One-Time Web Push Notification Permission Prompt */}
      <PushNotificationPrompt />
    </div>
  );
}
