import React, { useState, useEffect } from "react";
import { Link } from "@/components/ui/link";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import { staffApi } from "@/lib/api/staff";
import { Staff } from "@/lib/types";
import { formatKES } from "@/lib/utils";
import { DataTable, Column } from "@/components/business/DataTable";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Eye, UserCheck, Award, DollarSign, Calendar, TrendingUp, KeyRound, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { StaffPerformanceCard } from "@/components/business/StaffPerformanceCard";
import { SEO } from "@/components/common/SEO";

export default function StaffPage() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Staff Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "cashier",
    email: "",
    phone: "",
    basicSalary: 35000,
    commissionRate: 2,
    monthlyTarget: 300000,
    createLogin: true,
    password: "",
  });

  // Grant login modal for existing staff
  const [grantLoginStaff, setGrantLoginStaff] = useState<Staff | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", role: "cashier" });
  const [isGrantingLogin, setIsGrantingLogin] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await staffApi.getStaff(currentTenant.id);
      setStaff(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant.id]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;
    if (newStaff.createLogin && newStaff.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);

    try {
      const created = await staffApi.createStaff({
        tenantId: currentTenant.id,
        name: newStaff.name,
        role: newStaff.role as any,
        email: newStaff.email,
        phone: newStaff.phone || "+254 700 000 000",
        hireDate: new Date().toISOString().split("T")[0],
        basicSalary: Number(newStaff.basicSalary),
        monthlySalary: Number(newStaff.basicSalary),
        commissionRate: Number(newStaff.commissionRate),
        salesThisMonth: 0,
        monthlyTarget: Number(newStaff.monthlyTarget),
        status: "active",
      });

      // Also create login account if requested
      if (newStaff.createLogin && newStaff.password && created?.id) {
        await staffApi.createLoginAccount(created.id, {
          email: newStaff.email,
          password: newStaff.password,
          role: newStaff.role,
        });
      }

      setIsAddOpen(false);
      setNewStaff({ name: "", role: "cashier", email: "", phone: "", basicSalary: 35000, commissionRate: 2, monthlyTarget: 300000, createLogin: true, password: "" });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to add staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantLoginStaff) return;
    if (loginForm.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setIsGrantingLogin(true);
    try {
      const res = await staffApi.createLoginAccount(grantLoginStaff.id, {
        email: loginForm.email || grantLoginStaff.email,
        password: loginForm.password,
        role: loginForm.role,
      });
      setLoginSuccess(res?.detail || "Login account created successfully!");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create login account.");
    } finally {
      setIsGrantingLogin(false);
    }
  };

  const totalSalesMtd = staff.reduce((acc, s) => acc + (s.salesThisMonth || 0), 0);
  const totalSalaries = staff.reduce((acc, s) => acc + (s.basicSalary || 0), 0);

  const columns: Column<Staff>[] = [
    {
      header: "Staff Member",
      accessorKey: "name",
      cell: (member) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
            {member.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">{member.name}</span>
            <span className="text-xs text-slate-500 font-medium capitalize">
              {member.role || "Staff"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: (member) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-700 font-medium">{member.email}</div>
          <div className="text-slate-400">{member.phone}</div>
        </div>
      ),
    },
    {
      header: "Login Access",
      cell: (member) => {
        const hasLogin = Boolean((member as any).hasLoginAccount);
        return hasLogin ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <KeyRound className="h-3 w-3 text-emerald-600" />
            <span>Login Active</span>
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-[11px] font-semibold gap-1 text-blue-700 bg-blue-50/70 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
            onClick={() => {
              setGrantLoginStaff(member);
              setLoginForm({ email: member.email, password: "", role: member.role || "cashier" });
              setLoginSuccess(null);
            }}
          >
            <KeyRound className="h-3 w-3 text-blue-600" />
            <span>Set Password</span>
          </Button>
        );
      },
    },
    {
      header: "Basic Salary",
      accessorKey: "basicSalary",
      cell: (member) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {formatKES(member.basicSalary)}
        </span>
      ),
    },
    {
      header: "Sales MTD",
      accessorKey: "salesThisMonth",
      cell: (member) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900">
            {formatKES(member.salesThisMonth || 0)}
          </span>
          {member.commissionRate > 0 && (
            <span className="text-[10px] text-emerald-600 block">
              {member.commissionRate}% comm.
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (member) => <StatusBadge status={member.status} />,
    },
    {
      header: "Actions",
      cell: (member) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs gap-1 text-slate-700"
            title="Create or Reset Login Password"
            onClick={() => {
              setGrantLoginStaff(member);
              setLoginForm({ email: member.email, password: "", role: member.role || "cashier" });
              setLoginSuccess(null);
            }}
          >
            <KeyRound className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Credentials</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="View Details"
            onClick={() => navigate(`/staff/${member.id}`)}
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SEO
        title="Staff Management | StockGrid"
        description="Manage team members, roles, sales quotas, and payroll details"
        noindex={true}
        nofollow={true}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff and Team</h1>
          <p className="text-sm text-slate-500">
            Manage your store employees, permissions, monthly sales targets, and compensation.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Active Staff</div>
            <div className="text-xl font-bold text-slate-900">{staff.length} Members</div>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Staff Sales This Month</div>
            <div className="text-xl font-bold text-slate-900">{formatKES(totalSalesMtd)}</div>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Monthly Payroll Obligation</div>
            <div className="text-xl font-bold text-slate-900">{formatKES(totalSalaries)}</div>
          </div>
        </div>
      </div>

      {/* Staff Sales Leaderboard */}
      {staff.length > 0 && (
        <StaffPerformanceCard staff={staff} />
      )}

      {/* Staff Table */}
      <DataTable
        data={staff}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search staff by name..."
        isLoading={isLoading}
      />

      {/* Add Staff Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input
                required
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="e.g. Kelvin Mutua"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Role</label>
                <select
                  className="w-full h-10 px-3 border border-slate-200 rounded-md text-xs bg-white font-medium"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                >
                  <option value="cashier">Cashier (POS &amp; Sales)</option>
                  <option value="salesperson">Salesperson (Sales &amp; Targets)</option>
                  <option value="storekeeper">Storekeeper (Inventory &amp; Stock)</option>
                  <option value="manager">Store Manager (POS &amp; Approvals)</option>
                  <option value="owner">Co-Owner (Full Admin)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <Input
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+254 7..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email (Username for Login)</label>
              <Input
                type="email"
                required
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                placeholder="e.g. kelvin@store.co.ke"
              />
            </div>

            {/* Login Account Credentials Box */}
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">POS &amp; App Login Access</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-700">
                  <input
                    type="checkbox"
                    checked={newStaff.createLogin}
                    onChange={(e) => setNewStaff({ ...newStaff, createLogin: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Enable Login</span>
                </label>
              </div>

              {newStaff.createLogin && (
                <div className="space-y-1.5 pt-1 border-t border-blue-200/60">
                  <label className="text-[11px] font-semibold text-slate-700">Set Initial Password</label>
                  <Input
                    type="password"
                    eyeToggle={true}
                    required={newStaff.createLogin}
                    minLength={6}
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="Set password (min 6 chars, e.g. Staff1234)"
                    className="bg-white text-xs h-9"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Basic Salary (KES)</label>
                <Input
                  type="number"
                  value={newStaff.basicSalary}
                  onChange={(e) => setNewStaff({ ...newStaff, basicSalary: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Commission Rate (%)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={newStaff.commissionRate}
                  onChange={(e) => setNewStaff({ ...newStaff, commissionRate: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                {isSubmitting ? "Adding..." : "Add Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grant / Reset Login Credentials Modal for Existing Staff */}
      <Dialog open={!!grantLoginStaff} onOpenChange={(open) => !open && setGrantLoginStaff(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Login Credentials: {grantLoginStaff?.name}
                </DialogTitle>
                <p className="text-xs text-slate-500">
                  Set password and system role so this employee can log in to the POS terminal.
                </p>
              </div>
            </div>
          </DialogHeader>

          {loginSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-emerald-800">{loginSuccess}</p>
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setGrantLoginStaff(null)}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGrantLogin} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Login Email / Username</label>
                <Input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="staff@store.co.ke"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Assign System Role</label>
                <select
                  className="w-full h-10 px-3 border border-slate-200 rounded-md text-xs bg-white font-medium"
                  value={loginForm.role}
                  onChange={(e) => setLoginForm({ ...loginForm, role: e.target.value })}
                >
                  <option value="cashier">Cashier (Floor POS &amp; Sales)</option>
                  <option value="salesperson">Salesperson (Sales &amp; Targets)</option>
                  <option value="storekeeper">Storekeeper (Inventory &amp; Stock)</option>
                  <option value="manager">Store Manager (Discounts &amp; Till Closeout)</option>
                  <option value="owner">Co-Owner (Full Admin Access)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Set Login Password</label>
                <Input
                  type="password"
                  eyeToggle={true}
                  required
                  minLength={6}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setGrantLoginStaff(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isGrantingLogin} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {isGrantingLogin ? "Saving Credentials..." : "Save Login Credentials"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
