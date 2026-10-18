import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSecurity } from "@/contexts/SecurityContext";
import { adminApi } from "@/lib/api/admin";
import { SaaSPlan } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api/client";
import { ManagerPasscodeModal } from "@/components/business/ManagerPasscodeModal";
import {
  Building2,
  MapPin,
  Percent,
  Shield,
  CreditCard,
  CheckCircle2,
  Plus,
  Receipt,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

const DEFAULT_PLANS: SaaSPlan[] = [
  {
    id: "starter",
    slug: "starter",
    name: "Starter Retail",
    price: 1000,
    billingPeriod: "monthly",
    description: "Perfect for single-shop retailers and sole proprietors starting out.",
    features: [
      "1 Branch Location",
      "Up to 2 Staff Accounts (Owner + Cashier)",
      "Core POS & Barcode Scanner",
      "Up to 500 Inventory SKUs",
      "Daily Sales Receipts",
      "Standard Email Support",
    ],
    maxStaff: 2,
    maxProducts: 500,
    maxInvoicesPerMonth: 50,
    isPopular: false,
    isActive: true,
  },
  {
    id: "professional",
    slug: "professional",
    name: "Growth Pro",
    price: 2000,
    billingPeriod: "monthly",
    description: "Ideal for growing retail stores, supermarkets, and boutiques requiring staff control.",
    features: [
      "Up to 3 Branch Locations",
      "Up to 10 Staff Roles (Manager PIN Protection)",
      "Protected Financials (Hidden P&L, Wholesale & Payroll)",
      "Customer CRM & Loyalty Program",
      "Expense Tracking & Profit/Loss Analytics",
      "B2B Invoicing & Customer Credit Accounts",
      "Supplier Purchase Orders & Restocking",
      "Priority WhatsApp Support",
    ],
    maxStaff: 10,
    maxProducts: 10000,
    maxInvoicesPerMonth: 500,
    isPopular: true,
    isActive: true,
  },
  {
    id: "enterprise",
    slug: "enterprise",
    name: "Enterprise Chain",
    price: 3000,
    billingPeriod: "monthly",
    description: "For retail chains, supermarkets, franchises, and central warehouse operations.",
    features: [
      "Unlimited Branch Locations & Central Warehouses",
      "Unlimited Staff Accounts & Custom Role Builder",
      "Inter-Branch Stock Transfers & Transit Tracking",
      "Consolidated Head-Office Financial Reports",
      "Multi-Branch Tax & Automated Reconciliations",
      "AI Predictive Restocking & Demand Forecasting",
      "Dedicated Account Manager & 24/7 SLA",
    ],
    maxStaff: 999,
    maxProducts: 99999,
    maxInvoicesPerMonth: 99999,
    isPopular: false,
    isActive: true,
  },
];

export default function SettingsPage() {
  const { currentTenant, updateSettings, allBranches } = useTenant();
  const { currentRole } = useAuth();
  const { isProtectionEnabled, enableProtection, disableProtection, changePin } = useSecurity();

  // Profile Form
  const [profile, setProfile] = useState({
    name: currentTenant.name,
    phone: currentTenant.phone,
    email: currentTenant.email,
    address: currentTenant.address,
    location: currentTenant.location,
    receiptHeader: currentTenant.settings.receiptHeader || "",
    receiptFooter: currentTenant.settings.receiptFooter || "",
  });

  // Tax Form
  const [tax, setTax] = useState({
    taxRate: currentTenant.settings.taxRate,
    taxNumber: currentTenant.settings.taxNumber || "",
    currency: currentTenant.settings.currency,
  });

  // Security UI state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showChangePinForm, setShowChangePinForm] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [changePinError, setChangePinError] = useState("");
  const [changePinSuccess, setChangePinSuccess] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Settings saved successfully!");
  const [plans, setPlans] = useState<SaaSPlan[]>(DEFAULT_PLANS);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

  useEffect(() => {
    adminApi.getPlans().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
      }
    }).catch(console.error);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      receiptHeader: profile.receiptHeader,
      receiptFooter: profile.receiptFooter,
    });
    setSaveMessage("Business profile updated successfully!");
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleChangePin = () => {
    setChangePinError("");
    setChangePinSuccess(false);
    if (newPinInput !== confirmPinInput) {
      setChangePinError("New PIN and confirm PIN do not match.");
      return;
    }
    const result = changePin(currentPinInput, newPinInput);
    if (result.success) {
      setChangePinSuccess(true);
      setCurrentPinInput("");
      setNewPinInput("");
      setConfirmPinInput("");
      setSaveMessage("Security PIN updated successfully!");
      setIsSaved(true);
      setTimeout(() => { setIsSaved(false); setShowChangePinForm(false); setChangePinSuccess(false); }, 2500);
    } else {
      setChangePinError(result.error || "Failed to update PIN.");
    }
  };

  const handleSwitchPlan = async (targetPlan: SaaSPlan) => {
    if (!window.confirm(`Switch subscription to ${targetPlan.name} at ${formatKES(targetPlan.price)}/month?`)) {
      return;
    }
    setIsSwitchingPlan(true);
    try {
      await apiClient.patch(`/tenants/${currentTenant.id}/`, {
        plan: targetPlan.id,
      });
      currentTenant.plan = targetPlan.id;
      setSaveMessage(`Successfully activated ${targetPlan.name} package!`);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to switch plan.");
    } finally {
      setIsSwitchingPlan(false);
    }
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      taxRate: Number(tax.taxRate),
      taxNumber: tax.taxNumber,
      currency: tax.currency,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const permissionMatrix = [
    { module: "Dashboard and Store Insights", owner: true, staff: true, note: "Staff view has Profit & Expenses masked" },
    { module: "POS Checkout & Register", owner: true, staff: true, note: "Staff can process cash, M-Pesa & cards" },
    { module: "Sales & Receipts History", owner: true, staff: true, note: "Staff can view & reprint receipts" },
    { module: "Product Catalog (Viewing & Selling)", owner: true, staff: true, note: "Wholesale buying price is hidden" },
    { module: "Wholesale Cost Prices (COGS)", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Inventory Adjustments & Stock Take", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Purchases and Supplier POs", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Operating Expenses Tracking", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Customers CRM & Directory", owner: true, staff: true, note: "Staff can search & add customers" },
    { module: "Customer Debt & Credit Sales", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Invoicing & Quotations", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Payroll, Salaries & Commissions", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Sales Targets & Quotas", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Business Intelligence & Profit Reports", owner: true, staff: false, note: "Protected with Owner PIN" },
    { module: "Store Settings & Subscription Billing", owner: true, staff: false, note: "Protected with Owner PIN" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Business and System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business details, thermal receipt branding, multi-branch network, and staff role permissions.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="security">Security &amp; PIN</TabsTrigger>
          <TabsTrigger value="branches">Store Branches ({allBranches.length})</TabsTrigger>
          <TabsTrigger value="tax">Tax and Currency</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions Matrix</TabsTrigger>
          <TabsTrigger value="subscription">Subscription and Limits</TabsTrigger>
        </TabsList>

        {/* TAB 1: Business Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6">
            <CardTitle className="text-sm font-bold mb-4">Business Information</CardTitle>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Business Legal Name</label>
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Business Phone</label>
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Official Email</label>
                  <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Location / City</label>
                  <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Physical Store Address</label>
                <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Thermal Receipt Header Note</label>
                  <textarea
                    value={profile.receiptHeader}
                    onChange={(e) => setProfile({ ...profile, receiptHeader: e.target.value })}
                    rows={2}
                    className="flex w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Receipt Footer Disclaimer</label>
                  <textarea
                    value={profile.receiptFooter}
                    onChange={(e) => setProfile({ ...profile, receiptFooter: e.target.value })}
                    rows={2}
                    className="flex w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="font-bold text-xs">Save Profile Changes</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: Owner Security & PIN */}
        <TabsContent value="security" className="space-y-4">

          {/* ── Security & Privacy Card (Disable Protection / Change PIN) ── */}
          <Card className="p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold">Security &amp; Privacy</CardTitle>
                <p className="text-xs text-slate-500">Secure your sensitive business data</p>
              </div>
              {isProtectionEnabled ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> Protection Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                  <ShieldOff className="h-3 w-3" /> Protection Disabled
                </span>
              )}
            </div>

            {/* Security PIN row */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-800">Security PIN</p>
                <p className="text-[11px] text-slate-400">Update or disable your 4-digit security PIN used to unlock metrics.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {isProtectionEnabled ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowDisableModal(true)}
                  >
                    <ShieldOff className="h-3.5 w-3.5 mr-1" />
                    Disable Protection
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => { enableProtection(); setSaveMessage("PIN protection enabled."); setIsSaved(true); setTimeout(() => setIsSaved(false), 2500); }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Enable Protection
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold"
                  onClick={() => setShowChangePinForm((v) => !v)}
                >
                  <KeyRound className="h-3.5 w-3.5 mr-1" />
                  Change PIN
                </Button>
              </div>
            </div>

            {/* Change PIN inline form */}
            {showChangePinForm && (
              <div className="pt-4 pb-2 space-y-3 max-w-sm">
                <p className="text-xs font-bold text-slate-700">Change Security PIN</p>
                {changePinError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{changePinError}</p>
                )}
                {changePinSuccess && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">PIN updated successfully!</p>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Current PIN</label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="Current 4-digit PIN"
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ""))}
                    className="font-mono tracking-widest h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">New PIN</label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="New 4-digit PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                    className="font-mono tracking-widest h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Confirm New PIN</label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="Confirm new PIN"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ""))}
                    className="font-mono tracking-widest h-10 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="text-xs font-bold"
                    onClick={handleChangePin}
                  >
                    Update PIN
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => { setShowChangePinForm(false); setChangePinError(""); setChangePinSuccess(false); setCurrentPinInput(""); setNewPinInput(""); setConfirmPinInput(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* ── Protected Areas Reference Card ── */}
          <Card className="p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <Lock className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold">Owner Security &amp; Master PIN Protection</CardTitle>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  StockGrid enforces a clean two-tier security model (Owner vs Staff). Configure the 4-digit master PIN required on the sales floor to authorize restricted staff actions and reveal protected financial records.
                </p>
              </div>
            </div>

            {/* List of Protected Areas */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
                  <span>8 Store Areas &amp; Operations Protected from Staff (Owner PIN Required)</span>
                </h4>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Two-Tier Enforcement: Owner &bull; Staff
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">1. Business Net Profit &amp; P&amp;L</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Net profit figures, margins, and bank reconciliation balances are masked on staff dashboard shifts.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">2. Wholesale Cost Prices (COGS)</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Product supplier cost/buying prices are hidden in catalog lists to safeguard business profit margins.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">3. Employee Payroll &amp; Salaries</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Staff salaries, monthly sales quotas, and compensation records are strictly confidential to the Owner.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">4. POS Post-Sale Voids &amp; Cart Clearing</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Canceling or voiding scanned customer items during checkout requires prompt Owner PIN approval.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">5. POS Manual Discounts</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Staff cannot deduct sale totals arbitrarily without Owner PIN authorization to prevent cash leakage.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">6. Customer Credit &amp; Debt Sales</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Releasing store inventory on &quot;Pay Later&quot; requires Owner PIN sign-off to prevent bad debt risks.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">7. Operating Expenses &amp; Cash Outflows</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Rent payments, store bills, petty cash disbursements, and supplier payments are locked to the Owner.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block">8. Blind Cash Drawer Closeout</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Owner PIN</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Staff enter physical drawer totals blind without seeing expected figures to eliminate end-of-shift theft.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* ── Disable Protection confirmation modal ── */}
          {showDisableModal && (
            <ManagerPasscodeModal
              isOpen={showDisableModal}
              onClose={() => setShowDisableModal(false)}
              onSuccess={() => {
                disableProtection();
                setShowDisableModal(false);
                setSaveMessage("PIN protection has been disabled.");
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2500);
              }}
              title="Confirm Disable Protection"
              description="Enter your current 4-digit PIN to disable financial protection across all staff views."
            />
          )}
        </TabsContent>

        {/* TAB 3: Branches */}
        <TabsContent value="branches" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Store Branches</CardTitle>
                <p className="text-xs text-slate-500">Manage multiple store locations and point-of-sale registers.</p>
              </div>
              <Button size="sm" className="gap-1 text-xs font-bold">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Branch</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBranches.map((branch) => (
                <div key={branch.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{branch.name}</span>
                    {branch.isMain && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                        Main Flagship
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{branch.address} ({branch.location})</p>
                  <p className="text-xs text-slate-400">Tel: {branch.phone}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: Tax and Currency */}
        <TabsContent value="tax" className="space-y-4">
          <Card className="p-6">
            <CardTitle className="text-sm font-bold mb-4">Tax Configuration and Currency</CardTitle>
            <form onSubmit={handleSaveTax} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Default Currency</label>
                  <Input value={tax.currency} onChange={(e) => setTax({ ...tax, currency: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Standard VAT Rate (%)</label>
                  <Input
                    type="number"
                    value={tax.taxRate}
                    onChange={(e) => setTax({ ...tax, taxRate: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">KRA Tax PIN / Number</label>
                  <Input
                    placeholder="e.g. P051239847Z"
                    value={tax.taxNumber}
                    onChange={(e) => setTax({ ...tax, taxNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="font-bold text-xs">Update Tax Settings</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 4: RBAC Role Permission Matrix */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold">Two-Tier Access Control (Owner &amp; Staff)</CardTitle>
                  <p className="text-xs text-slate-500">
                    Operational permissions and security restrictions enforced across all StockGrid business modules.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full w-fit">
                  Owner vs Staff Matrix
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Module Feature</th>
                    <th className="p-3.5 text-center">Owner (Full Admin)</th>
                    <th className="p-3.5 text-center">Staff (POS &amp; Floor)</th>
                    <th className="p-3.5">Access Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {permissionMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-medium text-slate-900">{row.module}</td>
                      <td className="p-3.5 text-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                      </td>
                      <td className="p-3.5 text-center">
                        {row.staff ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Allowed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Lock className="h-3 w-3 text-amber-600" />
                            <span>Owner PIN</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-slate-500">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Subscription and Plan Limits */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Active Subscription Status Banner */}
          <Card className="p-6 bg-slate-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Current Subscription</span>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full capitalize">
                    {currentTenant.planStatus}
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{currentTenant.plan} Plan</h3>
                <p className="text-xs text-slate-400">Next renewal billing date: {currentTenant.nextBillingDate}</p>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 font-bold text-xs">
                Manage Plan / Upgrade
              </Button>
            </div>

            {/* Usage Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Staff Seats</span>
                  <span className="text-white font-bold">5 / 15</span>
                </div>
                <Progress value={33} max={100} indicatorClassName="bg-blue-500" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Products Catalog</span>
                  <span className="text-white font-bold">145 / Unlimited</span>
                </div>
                <Progress value={15} max={100} indicatorClassName="bg-emerald-500" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Invoices this Month</span>
                  <span className="text-white font-bold">45 / 1,000</span>
                </div>
                <Progress value={5} max={100} indicatorClassName="bg-purple-500" />
              </div>
            </div>
          </Card>

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 flex flex-col justify-between ${
                  plan.id === currentTenant.plan ? "ring-2 ring-blue-600 bg-blue-50/20" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                    {plan.id === currentTenant.plan && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black font-mono text-slate-950">{formatKES(plan.price)}/mo</p>
                  <p className="text-xs text-slate-500">{plan.description}</p>
                  <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => handleSwitchPlan(plan)}
                    variant={plan.id === currentTenant.plan ? "secondary" : "default"}
                    disabled={plan.id === currentTenant.plan || isSwitchingPlan}
                    className="w-full text-xs font-bold"
                  >
                    {plan.id === currentTenant.plan ? "Current Active Plan" : "Switch to " + plan.name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
