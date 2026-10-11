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
  X,
  ChevronDown,
} from "lucide-react";
import { PermissionModule } from "@/lib/types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  module: PermissionModule;
}

interface NavSection {
  title: string;
  collapsible: boolean;
  items: NavItem[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const sections: NavSection[] = [
    {
      title: "OPERATIONS",
      collapsible: false,
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
      collapsible: true,
      items: [
        { label: "Purchases", href: "/purchases", icon: <Truck className="h-4 w-4" />, module: "purchases" },
        { label: "Expenses", href: "/expenses", icon: <TrendingDown className="h-4 w-4" />, module: "expenses" },
        { label: "Invoices", href: "/invoices", icon: <FileText className="h-4 w-4" />, module: "invoices" },
        { label: "Debt and Credit", href: "/credit", icon: <CreditCard className="h-4 w-4" />, module: "credit" },
      ],
    },
    {
      title: "CRM and TEAM",
      collapsible: true,
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
      collapsible: true,
      items: [
        { label: "Reports", href: "/reports", icon: <BarChart3 className="h-4 w-4" />, module: "reports" },
        { label: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" />, module: "notifications" },
        { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" />, module: "settings" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex flex-col w-72 max-w-full bg-[#0f172a] text-slate-200 shadow-2xl z-10">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <TenantSwitcher isCollapsed={false} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {sections.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) =>
              hasPermission(item.module as any, "view")
            );
            if (visibleItems.length === 0) return null;

            const isSectionCollapsed = section.collapsible
              ? collapsedSections.has(section.title)
              : false;

            return (
              <div key={sIdx} className="space-y-1">
                {section.collapsible ? (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all mb-1"
                  >
                    <span>{section.title}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        isSectionCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>
                ) : (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    {section.title}
                  </p>
                )}

                {!isSectionCollapsed && (
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-blue-600 text-white font-semibold shadow-xs"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <div className={isActive ? "text-white" : "text-slate-400"}>
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
