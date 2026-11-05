import React from "react";
import Link from "@/components/ui/link";
import storegridLogo from "@/assets/storegrid-logo.png";
import { Button } from "@/components/ui/button";

interface MarketingNavProps {
  activePath?: string;
}

export const MarketingHeader: React.FC<MarketingNavProps> = ({ activePath }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src={storegridLogo} alt="StoreGrid Logo" className="h-9 w-9 object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900 leading-none">
              StoreGrid
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              Business Cloud
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <Link
            href="/"
            className={`hover:text-blue-600 transition-colors ${activePath === "/" ? "text-blue-600 font-bold" : ""}`}
          >
            Home
          </Link>
          <Link
            href="/features"
            className={`hover:text-blue-600 transition-colors ${activePath === "/features" ? "text-blue-600 font-bold" : ""}`}
          >
            Features
          </Link>
          <Link
            href="/industries"
            className={`hover:text-blue-600 transition-colors ${activePath === "/industries" ? "text-blue-600 font-bold" : ""}`}
          >
            Industries
          </Link>
          <Link
            href="/pricing"
            className={`hover:text-blue-600 transition-colors ${activePath === "/pricing" ? "text-blue-600 font-bold" : ""}`}
          >
            Pricing
          </Link>
          <Link
            href="/how-it-works"
            className={`hover:text-blue-600 transition-colors ${activePath === "/how-it-works" ? "text-blue-600 font-bold" : ""}`}
          >
            How It Works
          </Link>
          <Link
            href="/resources"
            className={`hover:text-blue-600 transition-colors ${activePath === "/resources" ? "text-blue-600 font-bold" : ""}`}
          >
            Resources
          </Link>
          <Link
            href="/about"
            className={`hover:text-blue-600 transition-colors ${activePath === "/about" ? "text-blue-600 font-bold" : ""}`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`hover:text-blue-600 transition-colors ${activePath === "/contact" ? "text-blue-600 font-bold" : ""}`}
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-700">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-xs font-bold px-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export const MarketingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src={storegridLogo} alt="StoreGrid Logo" className="h-8 w-8 object-contain" />
              <span className="text-base font-bold text-white tracking-tight">StoreGrid</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Complete business management platform & cloud POS for small and growing businesses in Kenya. Streamline sales, live inventory, customer credit, M-PESA reconciliations, and staff payroll.
            </p>
            <div className="text-[11px] text-slate-500">
              Support: <span className="text-slate-300">+254 743 849 304</span> |{" "}
              <span className="text-slate-300">stockgridke@gmail.com</span>
            </div>
          </div>

          {/* Core Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">All Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/integrations" className="hover:text-white transition-colors">M-PESA Integration</Link></li>
              <li><Link href="/book-demo" className="hover:text-white transition-colors">Book a Demo</Link></li>
            </ul>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Top Features</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/features/pos-system" className="hover:text-white transition-colors">POS Software</Link></li>
              <li><Link href="/features/inventory-management" className="hover:text-white transition-colors">Inventory Management</Link></li>
              <li><Link href="/features/sales-management" className="hover:text-white transition-colors">Sales Tracking</Link></li>
              <li><Link href="/features/credit-management" className="hover:text-white transition-colors">Customer Debt Ledger</Link></li>
              <li><Link href="/features/invoicing" className="hover:text-white transition-colors">B2B Invoicing</Link></li>
              <li><Link href="/features/payroll" className="hover:text-white transition-colors">Staff Payroll</Link></li>
            </ul>
          </div>

          {/* Industries & Resources */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Industries & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/industries/retail-shops" className="hover:text-white transition-colors">Retail Shops</Link></li>
              <li><Link href="/industries/supermarkets" className="hover:text-white transition-colors">Supermarkets</Link></li>
              <li><Link href="/industries/wholesalers" className="hover:text-white transition-colors">Wholesalers</Link></li>
              <li><Link href="/industries/hardware-stores" className="hover:text-white transition-colors">Hardware Stores</Link></li>
              <li><Link href="/industries/barbershops" className="hover:text-white transition-colors">Barbershops & Kinyozi</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">Business Guides</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security & Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 StoreGrid Technologies Ltd. Built for African Small & Growing Businesses.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-300">About</Link>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
            <Link href="/security" className="hover:text-slate-300">Security</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-slate-300">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
