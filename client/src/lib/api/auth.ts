import { User, Membership, UserRole } from "../types";
import { apiClient } from "./client";

export const authApi = {
  async getCurrentUser(): Promise<User> {
    const user = await apiClient.get<User>("/auth/me/");
    if (typeof window !== "undefined") {
      localStorage.setItem("sme_user", JSON.stringify(user));
    }
    return user;
  },

  async getMemberships(): Promise<Membership[]> {
    const user = await this.getCurrentUser();
    return user.memberships || [];
  },

  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken?: string; memberships: Membership[]; activeTenantId?: string }> {
    const res = await apiClient.post<{ user: User; token: string; refreshToken?: string; memberships: Membership[]; activeTenantId?: string }>("/auth/login/", { email, password });
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", res.token);
      if (res.refreshToken) {
        localStorage.setItem("refresh_token", res.refreshToken);
      }
      localStorage.setItem("sme_user", JSON.stringify(res.user));
      if (res.activeTenantId) {
        localStorage.setItem("active_tenant_id", res.activeTenantId);
      }
    }
    return res;
  },

  async register(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    businessName?: string;
    businessCategory?: string;
    products?: any[];
    [key: string]: any;
  }): Promise<{ user?: User; token?: string; refreshToken?: string; memberships?: Membership[]; activeTenantId?: string; pendingActivation?: boolean; businessName?: string; email?: string; message?: string }> {
    const res = await apiClient.post<{ user?: User; token?: string; refreshToken?: string; memberships?: Membership[]; activeTenantId?: string; pendingActivation?: boolean; businessName?: string; email?: string; message?: string }>("/auth/register/", data);
    // Only store credentials if an actual token was returned (not pending)
    if (res.token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", res.token);
      if (res.refreshToken) {
        localStorage.setItem("refresh_token", res.refreshToken);
      }
      if (res.user) {
        localStorage.setItem("sme_user", JSON.stringify(res.user));
      }
      if (res.activeTenantId) {
        localStorage.setItem("active_tenant_id", res.activeTenantId);
      }
    }
    return res;
  },

  async switchRole(role: UserRole): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem("sme_simulated_role", role);
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("sme_user");
      localStorage.removeItem("active_tenant_id");
      localStorage.removeItem("sme_simulated_role");
    }
  },
};
