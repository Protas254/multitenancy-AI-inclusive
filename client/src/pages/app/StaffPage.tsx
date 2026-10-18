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
import { Plus, Eye, UserCheck, Award, DollarSign, Calendar, TrendingUp } from "lucide-react";
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
  });

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
    setIsSubmitting(true);

    try {
      await staffApi.createStaff({
        tenantId: currentTenant.id,
        name: newStaff.name,
        role: newStaff.role as any,
        email: newStaff.email,
        phone: newStaff.phone || "+254 700 000 000",
        hireDate: new Date().toISOString().split("T")[0],
        basicSalary: Number(newStaff.basicSalary),
        commissionRate: Number(newStaff.commissionRate),
        salesThisMonth: 0,
        monthlyTarget: Number(newStaff.monthlyTarget),
        status: "active",
      });
      setIsAddOpen(false);
      setNewStaff({
        name: "",
        role: "staff",
        email: "",
        phone: "",
        basicSalary: 35000,
        commissionRate: 2,
        monthlyTarget: 300000,
      });
      loadData();
    } finally {
      setIsSubmitting(false);
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
              {member.role === "owner" ? "Owner" : "Staff"}
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
          <div className="text-slate-700">{member.email}</div>
          <div className="text-slate-400">{member.phone}</div>
        </div>
      ),
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => navigate(`/staff/${member.id}`)}
        >
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SEO title="Staff Management | StockGrid" description="Manage team members, roles, sales quotas, and payroll details" />

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
                  className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                >
                  <option value="staff">Staff (Floor &amp; POS)</option>
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
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <Input
                type="email"
                required
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                placeholder="staff@store.co.ke"
              />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
