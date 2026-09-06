import { User, Membership, UserRole } from "../types";
import { INITIAL_USER, INITIAL_MEMBERSHIPS } from "../mock/initialData";
import { apiClient } from "./client";

export const authApi = {
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get<User>("/auth/me/");
    } catch {
      return apiClient.getStorage<User>("user", INITIAL_USER);
    }
  },

  async getMemberships(): Promise<Membership[]> {
    try {
      const user = await this.getCurrentUser();
      return user.memberships || INITIAL_MEMBERSHIPS;
    } catch {
      return apiClient.getStorage<Membership[]>("memberships", INITIAL_MEMBERSHIPS);
    }
  },

  async login(email: string, password: string): Promise<{ user: User; token: string; memberships: Membership[] }> {
    try {
      const res = await apiClient.post<{ user: User; token: string; memberships: Membership[] }>("/auth/login/", { email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("sme_user", JSON.stringify(res.user));
      }
      return res;
    } catch {
      if (email === "invalid@demo.com") {
        throw new Error("Invalid email or password. Please try again.");
      }
      const user = apiClient.getStorage<User>("user", INITIAL_USER);
      const memberships = apiClient.getStorage<Membership[]>("memberships", INITIAL_MEMBERSHIPS);
      const token = "mock_jwt_token_" + Date.now();
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("sme_user", JSON.stringify(user));
      }
      return { user, token, memberships };
    }
  },

  async register(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    businessName?: string;
    businessCategory?: string;
  }): Promise<{ user: User; token: string; memberships?: Membership[]; activeTenantId?: string }> {
    try {
      const res = await apiClient.post<{ user: User; token: string; memberships?: Membership[]; activeTenantId?: string }>("/auth/register/", data);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", res.token);
      }
      return res;
    } catch (err: any) {
      throw err;
    }
  },

  async switchRole(role: UserRole): Promise<void> {
    const memberships = apiClient.getStorage<Membership[]>("memberships", INITIAL_MEMBERSHIPS);
    if (memberships.length > 0) {
      memberships[0].role = role;
      apiClient.setStorage("memberships", memberships);
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },
};
