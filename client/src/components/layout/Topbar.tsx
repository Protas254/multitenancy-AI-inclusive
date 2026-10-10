import React, { useState } from "react";
import { Search, MapPin, Menu } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { GlobalSearch } from "./GlobalSearch";
import { MobileNav } from "./MobileNav";

export const Topbar: React.FC = () => {
  const { currentTenant, currentBranch, allBranches, switchBranch } = useTenant();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
        {/* Left Side: Mobile Toggle and Branch Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Branch Selector Dropdown if multiple branches exist */}
          {allBranches.length > 1 ? (
            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
              <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <select
                value={currentBranch.id}
                onChange={(e) => switchBranch(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                {allBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.location})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentTenant.location}</span>
            </div>
          )}
        </div>

        {/* Center: Global Search Trigger Button */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between h-9 px-3 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">Search products, customers, sales...</span>
            </div>
            <kbd className="hidden sm:inline-flex text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side: Notifications and User Profile */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <UserMenu />
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
};
