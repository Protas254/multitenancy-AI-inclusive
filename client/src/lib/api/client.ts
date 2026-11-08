/**
 * Unified API Client for Django REST Framework Backend Integration.
 */

function resolveApiBaseUrl(): string {
  // If running in browser, ensure production domains never attempt to call localhost
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "storegrid.co.ke" || host.endsWith(".storegrid.co.ke")) {
      return "https://api.storegrid.co.ke/api/v1";
    }
  }

  const envUrl =
    (import.meta as any).env?.VITE_API_URL ||
    (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_API_URL);

  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!isLocalhost && envUrl && envUrl.includes("localhost")) {
      return "https://api.storegrid.co.ke/api/v1";
    }
  }

  return envUrl || "http://localhost:8000/api/v1";
}

const API_BASE_URL = resolveApiBaseUrl();

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
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
        let errMsg = errorData.detail || errorData.message;
        if (!errMsg && typeof errorData === "object" && errorData !== null) {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const val = errorData[firstKey];
            errMsg = Array.isArray(val) ? `${firstKey}: ${val.join(", ")}` : `${firstKey}: ${val}`;
          }
        }
        throw new Error(
          errMsg || `Request failed with status ${res.status}`
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

  public async getBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
    const token = this.getAuthToken();
    const tenantId = this.getTenantId();

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { "X-Tenant-ID": tenantId } : {}),
      ...(options.headers as Record<string, string>),
    };

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to download: status ${res.status}`);
    }

    return await res.blob();
  }

  public postFormData<T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  }

  public get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
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
