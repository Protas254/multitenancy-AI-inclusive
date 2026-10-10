import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Shield, Check, Store, Settings, UserCheck } from "lucide-react";
import { UserRole } from "@/lib/types";
import Link from "@/components/ui/link";

export const UserMenu: React.FC = () => {
  const { user, currentRole, switchSimulatedRole, logout } = useAuth();

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: "owner", label: "Owner (All Modules)", desc: "Full administrative and financial control" },
    { role: "manager", label: "Store Manager", desc: "Sales, products, stock, CRM, reports" },
    { role: "cashier", label: "Cashier", desc: "POS checkout, sales, customers" },
    { role: "salesperson", label: "Salesperson", desc: "POS, products, sales targets" },
    { role: "storekeeper", label: "Storekeeper", desc: "Inventory, stock adjustments, purchases" },
    { role: "accountant", label: "Accountant", desc: "Expenses, invoices, payroll, debt, P&L" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 transition-colors text-left">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            {user?.name ? user.name.charAt(0) : "U"}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name || "User"}</p>
            <p className="text-[10px] text-blue-600 font-semibold capitalize tracking-tight">
              Role: {currentRole}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 bg-white border-slate-200 p-1.5 shadow-xl" align="end">
        <DropdownMenuLabel className="px-2 py-1.5">
          <p className="text-xs font-bold text-slate-900">{user?.name}</p>
          <p className="text-[11px] text-slate-500 font-normal">{user?.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-100" />

        {/* Quick Role Simulation Switcher */}
        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-blue-600" />
          <span>Simulate Staff Role (RBAC)</span>
        </DropdownMenuLabel>

        <div className="py-0.5 space-y-0.5">
          {roles.map((r) => (
            <DropdownMenuItem
              key={r.role}
              onClick={() => switchSimulatedRole(r.role)}
              className={`px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-between text-xs ${
                currentRole === r.role
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>
                <p className="font-medium">{r.label}</p>
                <p className="text-[9px] text-slate-400 font-normal">{r.desc}</p>
              </div>
              {currentRole === r.role && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 ml-2" />}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-slate-100" />

        <DropdownMenuItem asChild className="p-2 rounded-lg cursor-pointer text-xs">
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-slate-500" />
            <span>Business Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={logout}
          className="p-2 rounded-lg cursor-pointer text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
