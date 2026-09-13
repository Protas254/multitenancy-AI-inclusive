/**
 * Unified API Client for Django REST Framework Backend Integration.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_API_URL) || "http://localhost:8000/api/v1";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  private getTenantId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("active_tenant_id");
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const tenantId = this.getTenantId();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { "X-Tenant-ID": tenantId } : {}),
      ...(options.headers as Record<string, string>),
    };

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    try {
      const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `Request failed with status ${res.status}`
        );
      }

      // Handle 204 No Content
      if (res.status === 204) return {} as T;

      return (await res.json()) as T;
    } catch (err: any) {
      console.warn(`[API Client] Network call to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  public get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  public post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Local storage fallback helpers
  public getStorage<T>(key: string, defaultVal: T): T {
    if (typeof window === "undefined") return defaultVal;
    try {
      const item = localStorage.getItem(`sme_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  public setStorage<T>(key: string, val: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`sme_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }

  // Purge any legacy mock storage items
  public clearMockStorage(): void {
    if (typeof window === "undefined") return;
    const mockKeys = [
      "sme_products", "sme_tenants", "sme_sales", "sme_customers",
      "sme_suppliers", "sme_expenses", "sme_staff", "sme_payroll_runs",
      "sme_targets", "sme_notifications", "sme_stock_movements",
      "sme_categories", "sme_credit_accounts", "sme_credit_payments",
      "sme_invoices", "sme_purchases", "sme_loyalty_rewards",
      "sme_loyalty_transactions", "sme_platform_tenants", "sme_store_user"
    ];
    mockKeys.forEach((k) => localStorage.removeItem(k));
  }
}

export const apiClient = new ApiClient();
if (typeof window !== "undefined") {
  apiClient.clearMockStorage();
}
