import React, { useState } from "react";
import Link from "@/components/ui/link";
import { usePathname } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { TenantSwitcher } from "./TenantSwitcher";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  Truck,
  TrendingDown,
  Users,
  Building,
  UserCheck,
  Banknote,
  Target,
  CreditCard,
  Award,
  FileText,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { PermissionModule } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  module: PermissionModule;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { hasPermission, currentRole } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections: NavSection[] = [
    {
      title: "OPERATIONS",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, module: "dashboard" },
        { label: "POS Terminal", href: "/pos", icon: <Receipt className="h-4 w-4" />, module: "pos" },
        { label: "Sales", href: "/sales", icon: <ShoppingCart className="h-4 w-4" />, module: "sales" },
        { label: "Products", href: "/products", icon: <Package className="h-4 w-4" />, module: "products" },
        { label: "Inventory", href: "/inventory", icon: <Boxes className="h-4 w-4" />, module: "inventory" },
      ],
    },
    {
      title: "FINANCE and PURCHASES",
      items: [
        { label: "Purchases", href: "/purchases", icon: <Truck className="h-4 w-4" />, module: "purchases" },
        { label: "Expenses", href: "/expenses", icon: <TrendingDown className="h-4 w-4" />, module: "expenses" },
        { label: "Invoices", href: "/invoices", icon: <FileText className="h-4 w-4" />, module: "invoices" },
        { label: "Debt and Credit", href: "/credit", icon: <CreditCard className="h-4 w-4" />, module: "credit" },
      ],
    },
    {
      title: "CRM and TEAM",
      items: [
        { label: "Customers", href: "/customers", icon: <Users className="h-4 w-4" />, module: "customers" },
        { label: "Suppliers", href: "/suppliers", icon: <Building className="h-4 w-4" />, module: "suppliers" },
        { label: "Loyalty", href: "/loyalty", icon: <Award className="h-4 w-4" />, module: "loyalty" },
        { label: "Staff", href: "/staff", icon: <UserCheck className="h-4 w-4" />, module: "staff" },
        { label: "Payroll", href: "/payroll", icon: <Banknote className="h-4 w-4" />, module: "payroll" },
        { label: "Targets", href: "/targets", icon: <Target className="h-4 w-4" />, module: "targets" },
      ],
    },
    {
      title: "SYSTEM and INSIGHTS",
      items: [
        { label: "Reports", href: "/reports", icon: <BarChart3 className="h-4 w-4" />, module: "reports" },
        { label: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" />, module: "notifications" },
        { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" />, module: "settings" },
      ],
    },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#0f172a] text-slate-300 border-r border-slate-800 transition-all duration-300 select-none z-30 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Tenant Header */}
      <div className="p-3 border-b border-slate-800/80">
        <TenantSwitcher isCollapsed={isCollapsed} />
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section, sIdx) => {
          // Filter items based on current role permissions
          const visibleItems = section.items.filter((item) => hasPermission(item.module, "view"));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && section.title && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/30"
                          : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <div className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                        {item.icon}
                      </div>

                      {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 uppercase tracking-tight">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Collapse Toggle */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <div className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /><span>Collapse Menu</span></div>}
        </button>
      </div>
    </aside>
  );
};
