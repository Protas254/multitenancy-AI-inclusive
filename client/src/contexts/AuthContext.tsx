import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Membership, UserRole, PermissionModule, PermissionAction } from "../lib/types";
import { authApi } from "../lib/api/auth";

interface AuthContextType {
  user: User | null;
  memberships: Membership[];
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string; businessName?: string; businessCategory?: string; [key: string]: any }) => Promise<void>;
  logout: () => Promise<void>;
  switchSimulatedRole: (role: UserRole) => void;
  hasPermission: (module: PermissionModule, action?: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define default permission matrix by role
const ROLE_PERMISSIONS: Record<UserRole, Partial<Record<PermissionModule, PermissionAction[]>>> = {
  owner: {
    dashboard: ["view", "export"],
    sales: ["view", "create", "edit", "delete", "export"],
    pos: ["view", "create"],
    products: ["view", "create", "edit", "delete", "export"],
    inventory: ["view", "create", "edit", "delete", "export"],
    purchases: ["view", "create", "edit", "delete", "export"],
    expenses: ["view", "create", "edit", "delete", "export"],
    customers: ["view", "create", "edit", "delete", "export"],
    suppliers: ["view", "create", "edit", "delete", "export"],
    staff: ["view", "create", "edit", "delete", "export"],
    payroll: ["view", "create", "edit", "delete", "export"],
    targets: ["view", "create", "edit", "delete", "export"],
    credit: ["view", "create", "edit", "delete", "export"],
    loyalty: ["view", "create", "edit", "delete", "export"],
    invoices: ["view", "create", "edit", "delete", "export"],
    reports: ["view", "export"],
    notifications: ["view", "edit"],
    settings: ["view", "edit"],
    subscription: ["view", "edit"],
  },
  manager: {
    dashboard: ["view", "export"],
    sales: ["view", "create", "edit", "export"],
    pos: ["view", "create"],
    products: ["view", "create", "edit", "export"],
    inventory: ["view", "create", "edit", "export"],
    purchases: ["view", "create", "export"],
    expenses: ["view", "create", "export"],
    customers: ["view", "create", "edit", "export"],
    suppliers: ["view", "create", "edit", "export"],
    staff: ["view"],
    payroll: ["view"],
    targets: ["view", "create"],
    credit: ["view", "create", "edit"],
    loyalty: ["view", "create"],
    invoices: ["view", "create", "edit", "export"],
    reports: ["view", "export"],
    notifications: ["view", "edit"],
    settings: ["view"],
    subscription: ["view"],
  },
  cashier: {
    dashboard: ["view"],
    pos: ["view", "create"],
    sales: ["view", "create"],
    customers: ["view", "create"],
    credit: ["view", "create"],
    notifications: ["view"],
  },
  salesperson: {
    dashboard: ["view"],
    pos: ["view", "create"],
    sales: ["view", "create"],
    customers: ["view", "create"],
    products: ["view"],
    targets: ["view"],
    notifications: ["view"],
  },
  storekeeper: {
    dashboard: ["view"],
    products: ["view", "create", "edit", "export"],
    inventory: ["view", "create", "edit", "export"],
    purchases: ["view", "create", "edit", "export"],
    suppliers: ["view", "create"],
    notifications: ["view"],
  },
  accountant: {
    dashboard: ["view", "export"],
    sales: ["view", "export"],
    expenses: ["view", "create", "edit", "export"],
    purchases: ["view", "export"],
    invoices: ["view", "create", "edit", "export"],
    credit: ["view", "create", "edit", "export"],
    payroll: ["view", "create", "edit", "export"],
    reports: ["view", "export"],
    notifications: ["view"],
  },
  admin: {
    dashboard: ["view", "export"],
    sales: ["view", "create", "edit", "delete", "export"],
    pos: ["view", "create"],
    products: ["view", "create", "edit", "delete", "export"],
    inventory: ["view", "create", "edit", "delete", "export"],
    purchases: ["view", "create", "edit", "delete", "export"],
    expenses: ["view", "create", "edit", "delete", "export"],
    customers: ["view", "create", "edit", "delete", "export"],
    suppliers: ["view", "create", "edit", "delete", "export"],
    staff: ["view", "create", "edit", "delete", "export"],
    payroll: ["view", "create", "edit", "delete", "export"],
    targets: ["view", "create", "edit", "delete", "export"],
    credit: ["view", "create", "edit", "delete", "export"],
    loyalty: ["view", "create", "edit", "delete", "export"],
    invoices: ["view", "create", "edit", "delete", "export"],
    reports: ["view", "export"],
    notifications: ["view", "edit"],
    settings: ["view", "edit"],
    subscription: ["view", "edit"],
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>("owner");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) {
        setUser(null);
        setMemberships([]);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        const userMemberships = currentUser.memberships || [];
        setMemberships(userMemberships);
        if (userMemberships.length > 0) {
          const savedRole = localStorage.getItem("sme_simulated_role") as UserRole;
          setCurrentRole(savedRole || userMemberships[0].role);
        }
      } catch (err) {
        console.warn("Session expired or invalid token:", err);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("sme_user");
        }
        setUser(null);
        setMemberships([]);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      const userMemberships = res.memberships || [];
      setMemberships(userMemberships);
      if (userMemberships.length > 0) {
        setCurrentRole(userMemberships[0].role);
      }
      if (res.activeTenantId && typeof window !== "undefined") {
        localStorage.setItem("active_tenant_id", res.activeTenantId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string; businessName?: string; businessCategory?: string; [key: string]: any }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      const userMemberships = res.memberships || [];
      if (userMemberships.length > 0) {
        setMemberships(userMemberships);
        setCurrentRole(userMemberships[0].role);
      }
      if (typeof window !== "undefined" && res.activeTenantId) {
        localStorage.setItem("active_tenant_id", res.activeTenantId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setMemberships([]);
  };

  const switchSimulatedRole = (role: UserRole) => {
    setCurrentRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("sme_simulated_role", role);
    }
  };

  const hasPermission = (module: PermissionModule, action: PermissionAction = "view"): boolean => {
    const permissionsForRole = ROLE_PERMISSIONS[currentRole] || {};
    const moduleActions = permissionsForRole[module];
    if (!moduleActions) return false;
    return moduleActions.includes(action);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        currentRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchSimulatedRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
