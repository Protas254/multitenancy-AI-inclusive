import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { PermissionModule, PermissionAction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Lock, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import Link from "@/components/ui/link";
import { ManagerPasscodeModal } from "@/components/business/ManagerPasscodeModal";

interface ProtectedModuleRouteProps {
  module: PermissionModule;
  action?: PermissionAction;
  children: React.ReactNode;
  minPlan?: "starter" | "growth" | "enterprise";
  title?: string;
  description?: string;
}

export const ProtectedModuleRoute: React.FC<ProtectedModuleRouteProps> = ({
  module,
  action = "view",
  children,
  minPlan,
  title,
  description,
}) => {
  const { hasPermission, currentRole, switchSimulatedRole } = useAuth();
  const { currentTenant } = useTenant();
  const [isUnlockedByPin, setIsUnlockedByPin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Check role permission
  const allowedByRole = hasPermission(module, action) || isUnlockedByPin;

  // Check plan tier eligibility if defined
  const planWeights: Record<string, number> = {
    starter: 1,
    growth: 2,
    professional: 2, // alias
    enterprise: 3,
  };

  const currentPlanSlug = (currentTenant.plan || "professional").toLowerCase();
  const currentWeight = planWeights[currentPlanSlug] || 2;
  const requiredWeight = minPlan ? planWeights[minPlan] || 1 : 1;
  const allowedByPlan = currentWeight >= requiredWeight;

  // Friendly module names
  const moduleNames: Record<PermissionModule, string> = {
    dashboard: "Executive Financial Dashboard",
    pos: "POS Terminal",
    sales: "Sales History",
    products: "Products & Pricing Catalog",
    inventory: "Stock Management",
    purchases: "Wholesale Purchases",
    expenses: "Business Expenses & Cash Outflows",
    customers: "Customer CRM",
    suppliers: "Supplier Terms & Ledgers",
    staff: "Staff Management & Roles",
    payroll: "Employee Payroll & Compensation",
    targets: "Revenue Targets",
    credit: "Customer Debt & Credit Accounts",
    loyalty: "Customer Loyalty Program",
    invoices: "B2B Invoices",
    reports: "Financial & Profit Reports",
    notifications: "System Notifications",
    settings: "Store Configuration & Tax Settings",
    subscription: "Subscription & Billing",
  };

  const displayTitle = title || `${moduleNames[module] || module} (Protected Area)`;
  const defaultDesc =
    description ||
    "This section contains sensitive business data (such as company net profits, staff payroll, wholesale supplier pricing, or business settings) that is protected from general employee access.";

  // If user lacks role permission and hasn't unlocked with PIN
  if (!allowedByRole) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
              <span>Employee Access Restricted</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{displayTitle}</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{defaultDesc}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-400">Current Active Role:</span>
            <span className="font-bold capitalize text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {currentRole}
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              onClick={() => setIsPinModalOpen(true)}
              className="w-full gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md h-10"
            >
              <KeyRound className="h-4 w-4" />
              <span>Authorize with Manager PIN</span>
            </Button>

            <Link href="/pos" className="block w-full">
              <Button variant="outline" className="w-full gap-2 text-xs font-semibold h-10">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to POS Terminal</span>
              </Button>
            </Link>
          </div>

        </div>

        {/* Manager PIN Modal */}
        <ManagerPasscodeModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => setIsUnlockedByPin(true)}
          title={`Unlock ${moduleNames[module] || "Area"}`}
          description="Enter the store manager or owner 4-digit PIN to temporarily view this protected screen."
          actionName="Unlock View"
        />
      </div>
    );
  }

  // If user has role permission but the current subscription tier lacks this feature
  if (!allowedByPlan && minPlan) {
    const requiredPlanName =
      minPlan === "enterprise"
        ? "Enterprise Chain"
        : minPlan === "growth"
        ? "Growth Pro"
        : "Starter Retail";

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-blue-200 p-8 shadow-xl space-y-6">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
              <span>{requiredPlanName} Feature</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{displayTitle}</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              This module requires the <strong>{requiredPlanName}</strong> package. You are currently on{" "}
              <strong className="capitalize text-slate-800">{currentTenant.plan}</strong>.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link href="/settings" className="block w-full">
              <Button className="w-full gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md h-10">
                <Sparkles className="h-4 w-4" />
                <span>Upgrade to {requiredPlanName}</span>
              </Button>
            </Link>

            <Link href="/dashboard" className="block w-full">
              <Button variant="outline" className="w-full text-xs font-semibold h-10">
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
