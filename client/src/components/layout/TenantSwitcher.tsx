import React, { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Building2, Check, ChevronsUpDown, Plus, Store } from "lucide-react";

export const TenantSwitcher: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const { tenants, currentTenant, switchTenant, createTenant } = useTenant();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizType, setNewBizType] = useState("Retail and Supermarket");
  const [newBizLocation, setNewBizLocation] = useState("Nairobi, Kenya");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    setIsCreating(true);
    try {
      await createTenant({
        name: newBizName,
        businessType: newBizType,
        location: newBizLocation,
        address: `${newBizLocation}`,
        phone: "+254 700 000 000",
        email: `contact@${newBizName.toLowerCase().replace(/[^a-z0-9]/g, "")}.co.ke`,
      });
      setIsAddModalOpen(false);
      setNewBizName("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`w-full flex items-center justify-between rounded-xl p-2 transition-all hover:bg-slate-800/80 text-left ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
                <Store className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white tracking-tight leading-tight">
                    {currentTenant.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {currentTenant.businessType}
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64 bg-slate-900 text-slate-100 border-slate-800 p-1.5 shadow-2xl" align="start">
          <DropdownMenuLabel className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            Your Businesses
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />

          {tenants.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => switchTenant(t.id)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                t.id === currentTenant.id
                  ? "bg-blue-600/20 text-blue-400 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="h-7 w-7 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                  {t.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium leading-none">{t.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.location}</p>
                </div>
              </div>
              {t.id === currentTenant.id && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-blue-400 hover:bg-slate-800 hover:text-blue-300 cursor-pointer rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Business</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Business Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Register New Business</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNew} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Business Name</label>
              <Input
                placeholder="e.g. Protas Hardware and Electronics"
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Business Category</label>
              <select
                value={newBizType}
                onChange={(e) => setNewBizType(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <option value="Retail and Supermarket">Retail and Supermarket</option>
                <option value="Fashion and Apparel">Fashion and Apparel</option>
                <option value="Beauty and Cosmetics">Beauty and Cosmetics</option>
                <option value="Hardware and Construction">Hardware and Construction</option>
                <option value="Pharmacy and Healthcare">Pharmacy and Healthcare</option>
                <option value="Restaurant and Cafe">Restaurant and Cafe</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Location / City</label>
              <Input
                placeholder="e.g. Mombasa Road, Nairobi"
                value={newBizLocation}
                onChange={(e) => setNewBizLocation(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Create Business
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
