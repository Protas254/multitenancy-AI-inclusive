import React, { createContext, useContext, useState, useEffect } from "react";
import { Tenant, Branch, TenantSettings } from "../lib/types";
import { INITIAL_TENANTS } from "../lib/mock/initialData";
import { tenantsApi } from "../lib/api/tenants";

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant;
  currentBranch: Branch;
  allBranches: Branch[];
  switchTenant: (tenantId: string) => void;
  switchBranch: (branchId: string) => void;
  updateSettings: (settings: Partial<TenantSettings>) => Promise<void>;
  createTenant: (data: any) => Promise<Tenant>;
  formatCurrency: (amount: number | null | undefined) => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenantId, setCurrentTenantId] = useState<string>("tenant-fashion");
  const [currentBranchId, setCurrentBranchId] = useState<string>("br-cbd");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTenantId = localStorage.getItem("active_tenant_id");
      if (savedTenantId) setCurrentTenantId(savedTenantId);
      const savedBranchId = localStorage.getItem("active_branch_id");
      if (savedBranchId) setCurrentBranchId(savedBranchId);

      tenantsApi.getTenants().then((t) => {
        if (t && t.length > 0) setTenants(t);
      });
    }
  }, []);

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0] || INITIAL_TENANTS[0];
  const allBranches = currentTenant.branches || [];
  const currentBranch = allBranches.find((b) => b.id === currentBranchId) || allBranches[0] || {
    id: "br-main",
    tenantId: currentTenant.id,
    name: "Main Branch",
    location: currentTenant.location,
    address: currentTenant.address,
    phone: currentTenant.phone,
    isMain: true,
  };

  const switchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_tenant_id", tenantId);
    }
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant && tenant.branches.length > 0) {
      switchBranch(tenant.branches[0].id);
    }
  };

  const switchBranch = (branchId: string) => {
    setCurrentBranchId(branchId);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_branch_id", branchId);
    }
  };

  const updateSettings = async (settings: Partial<TenantSettings>) => {
    const updated = await tenantsApi.updateTenantSettings(currentTenant.id, settings);
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const createTenant = async (data: any) => {
    const newT = await tenantsApi.createTenant(data);
    setTenants((prev) => [newT, ...prev]);
    switchTenant(newT.id);
    return newT;
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${currentTenant.settings.currency || "KES"} 0`;
    }
    const symbol = currentTenant.settings.currency || "KES";
    return `${symbol} ${Math.round(amount).toLocaleString("en-KE")}`;
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        currentTenant,
        currentBranch,
        allBranches,
        switchTenant,
        switchBranch,
        updateSettings,
        createTenant,
        formatCurrency,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error("useTenant must be used within a TenantProvider");
  return context;
};
