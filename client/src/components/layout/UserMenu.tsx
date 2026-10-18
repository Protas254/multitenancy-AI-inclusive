import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Settings } from "lucide-react";
import Link from "@/components/ui/link";

export const UserMenu: React.FC = () => {
  const { user, currentRole, logout } = useAuth();

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
              {currentRole === "owner" ? "Owner" : "Staff"}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-white border-slate-200 p-1.5 shadow-xl" align="end">
        <DropdownMenuLabel className="px-2 py-1.5">
          <p className="text-xs font-bold text-slate-900">{user?.name}</p>
          <p className="text-[11px] text-slate-500 font-normal">{user?.email}</p>
        </DropdownMenuLabel>

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
