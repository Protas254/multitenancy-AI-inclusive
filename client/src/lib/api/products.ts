import { Product, Category } from "../types";
import { apiClient } from "./client";

export const productsApi = {
  async getProducts(tenantId?: string): Promise<Product[]> {
    try {
      const options = tenantId ? { headers: { "X-Tenant-ID": tenantId } } : {};
      const data = await apiClient.get<Product[]>("/products/", options);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching products:", err);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await apiClient.get<Product>(`/products/${id}/`);
    } catch {
      return null;
    }
  },

  async getCategories(tenantId?: string): Promise<Category[]> {
    try {
      const options = tenantId ? { headers: { "X-Tenant-ID": tenantId } } : {};
      const data = await apiClient.get<Category[]>("/categories/", options);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Error fetching categories:", err);
      return [];
    }
  },

  async createCategory(tenantId: string, name: string, description?: string): Promise<Category> {
    return await apiClient.post<Category>("/categories/", {
      name: name.trim(),
      description: description || "",
    });
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    return await apiClient.patch<Category>(`/categories/${id}/`, {
      name: name.trim(),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}/`);
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    return await apiClient.post<Product>("/products/", productData);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return await apiClient.patch<Product>(`/products/${id}/`, updates);
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/products/${id}/`);
      return true;
    } catch {
      return false;
    }
  },

  async bulkUpload(
    file: File,
    options: {
      updateExisting?: boolean;
      createCategories?: boolean;
      createSuppliers?: boolean;
      tenantId?: string;
    } = {}
  ): Promise<BulkUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("update_existing", String(options.updateExisting ?? true));
    formData.append("create_categories", String(options.createCategories ?? true));
    formData.append("create_suppliers", String(options.createSuppliers ?? true));

    const reqHeaders = options.tenantId ? { "X-Tenant-ID": options.tenantId } : undefined;
    return await apiClient.postFormData<BulkUploadResult>("/products/bulk-upload/", formData, {
      headers: reqHeaders,
    });
  },

  async bulkUploadJson(
    products: any[],
    options: {
      updateExisting?: boolean;
      createCategories?: boolean;
      createSuppliers?: boolean;
      tenantId?: string;
    } = {}
  ): Promise<BulkUploadResult> {
    const payload = {
      products,
      update_existing: options.updateExisting ?? true,
      create_categories: options.createCategories ?? true,
      create_suppliers: options.createSuppliers ?? true,
    };
    const reqHeaders = options.tenantId ? { headers: { "X-Tenant-ID": options.tenantId } } : undefined;
    return await apiClient.post<BulkUploadResult>("/products/bulk-upload/", payload);
  },

  async downloadTemplate(tenantId?: string): Promise<Blob> {
    const reqHeaders = tenantId ? { headers: { "X-Tenant-ID": tenantId } } : undefined;
    return await apiClient.getBlob("/products/template/", reqHeaders);
  },
};

export interface BulkUploadError {
  row: number;
  name?: string;
  error: string;
}

export interface BulkUploadResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: BulkUploadError[];
  products?: Product[];
}
