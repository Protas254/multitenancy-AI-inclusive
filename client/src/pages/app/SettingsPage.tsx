import React, { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api/admin";
import { SaaSPlan } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

export default function SettingsPage() {
  const { currentTenant, updateSettings, allBranches } = useTenant();
  const { currentRole } = useAuth();

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

  const [isSaved, setIsSaved] = useState(false);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);

  useEffect(() => {
    adminApi.getPlans().then((data) => {
      if (Array.isArray(data)) {
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
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
    { module: "Dashboard and Insights", owner: true, manager: true, cashier: true, storekeeper: true, accountant: true },
    { module: "POS Checkout", owner: true, manager: true, cashier: true, storekeeper: false, accountant: false },
    { module: "Sales and Receipts", owner: true, manager: true, cashier: true, storekeeper: false, accountant: true },
    { module: "Product Catalog", owner: true, manager: true, cashier: false, storekeeper: true, accountant: false },
    { module: "Inventory and Stock Adjustments", owner: true, manager: true, cashier: false, storekeeper: true, accountant: false },
    { module: "Purchases and Supplier POs", owner: true, manager: true, cashier: false, storekeeper: true, accountant: true },
    { module: "Expenses Tracking", owner: true, manager: true, cashier: false, storekeeper: false, accountant: true },
    { module: "Customers and CRM", owner: true, manager: true, cashier: true, storekeeper: false, accountant: false },
    { module: "Debt and Credit Aging", owner: true, manager: true, cashier: true, storekeeper: false, accountant: true },
    { module: "Invoicing", owner: true, manager: true, cashier: false, storekeeper: false, accountant: true },
    { module: "Payroll and Commissions", owner: true, manager: false, cashier: false, storekeeper: false, accountant: true },
    { module: "Sales Targets", owner: true, manager: true, cashier: false, storekeeper: false, accountant: false },
    { module: "Business Intelligence Reports", owner: true, manager: true, cashier: false, storekeeper: false, accountant: true },
    { module: "Store Settings and Subscription", owner: true, manager: false, cashier: false, storekeeper: false, accountant: false },
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
          <span>Settings saved successfully!</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
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

        {/* TAB 2: Branches */}
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
              <CardTitle className="text-sm font-bold">Role-Based Access Control (RBAC) Matrix</CardTitle>
              <p className="text-xs text-slate-500">
                Granular operational permissions enforced across all business modules.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Module Feature</th>
                    <th className="p-3.5 text-center">Owner</th>
                    <th className="p-3.5 text-center">Manager</th>
                    <th className="p-3.5 text-center">Cashier</th>
                    <th className="p-3.5 text-center">Storekeeper</th>
                    <th className="p-3.5 text-center">Accountant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {permissionMatrix.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3.5 font-medium text-slate-900">{row.module}</td>
                      <td className="p-3.5 text-center">{row.owner ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : "—"}</td>
                      <td className="p-3.5 text-center">{row.manager ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : "—"}</td>
                      <td className="p-3.5 text-center">{row.cashier ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : "—"}</td>
                      <td className="p-3.5 text-center">{row.storekeeper ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : "—"}</td>
                      <td className="p-3.5 text-center">{row.accountant ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : "—"}</td>
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
                    variant={plan.id === currentTenant.plan ? "secondary" : "default"}
                    disabled={plan.id === currentTenant.plan}
                    className="w-full text-xs font-bold"
                  >
                    {plan.id === currentTenant.plan ? "Current Plan" : "Switch to " + plan.name}
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
