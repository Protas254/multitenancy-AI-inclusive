import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Search, Package, Users, ShoppingCart, FileText, Building, ArrowRight, UserCheck } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_SALES, INITIAL_INVOICES, INITIAL_STAFF } from "@/lib/mock/initialData";
import { formatKES } from "@/lib/utils";

interface SearchResult {
  category: "Products" | "Customers" | "Sales" | "Invoices" | "Staff";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

export const GlobalSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Listen for Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(); // toggle or trigger
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const results: SearchResult[] = [];

  if (query.trim().length > 0) {
    const q = query.toLowerCase();

    // Search products
    INITIAL_PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    ).slice(0, 3).forEach((p) => {
      results.push({
        category: "Products",
        id: p.id,
        title: p.name,
        subtitle: `${p.sku} • ${formatKES(p.sellingPrice)} • ${p.currentStock} in stock`,
        href: `/products/${p.id}`,
        icon: <Package className="h-4 w-4 text-blue-600" />,
      });
    });

    // Search customers
    INITIAL_CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    ).slice(0, 3).forEach((c) => {
      results.push({
        category: "Customers",
        id: c.id,
        title: c.name,
        subtitle: `${c.phone} • ${c.loyaltyTier} tier • ${formatKES(c.totalPurchases)} spent`,
        href: `/customers/${c.id}`,
        icon: <Users className="h-4 w-4 text-emerald-600" />,
      });
    });

    // Search sales
    INITIAL_SALES.filter(
      (s) => s.saleNumber.toLowerCase().includes(q) || (s.customerName || "").toLowerCase().includes(q)
    ).slice(0, 2).forEach((s) => {
      results.push({
        category: "Sales",
        id: s.id,
        title: `${s.saleNumber} (${s.customerName || "Walk-in"})`,
        subtitle: `${formatKES(s.totalAmount)} • ${s.paymentMethod.toUpperCase()}`,
        href: `/sales/${s.id}`,
        icon: <ShoppingCart className="h-4 w-4 text-amber-600" />,
      });
    });

    // Search invoices
    INITIAL_INVOICES.filter(
      (i) => i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)
    ).slice(0, 2).forEach((i) => {
      results.push({
        category: "Invoices",
        id: i.id,
        title: `${i.invoiceNumber} - ${i.customerName}`,
        subtitle: `${formatKES(i.totalAmount)} • ${i.status.toUpperCase()}`,
        href: `/invoices/${i.id}`,
        icon: <FileText className="h-4 w-4 text-purple-600" />,
      });
    });

    // Search staff
    INITIAL_STAFF.filter(
      (st) => st.name.toLowerCase().includes(q) || st.role.toLowerCase().includes(q)
    ).slice(0, 2).forEach((st) => {
      results.push({
        category: "Staff",
        id: st.id,
        title: st.name,
        subtitle: `${st.role.toUpperCase()} • ${st.phone}`,
        href: `/staff/${st.id}`,
        icon: <UserCheck className="h-4 w-4 text-indigo-600" />,
      });
    });
  }

  const handleSelect = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            className="flex h-12 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
            placeholder="Search products, customers, sales, invoices, staff..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>Type anything to instantly search across the entire business OS</p>
              <div className="flex justify-center gap-2 mt-3">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Suits</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Peter Mwangi</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">SALE-00124</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">INV-2026</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching business records found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
