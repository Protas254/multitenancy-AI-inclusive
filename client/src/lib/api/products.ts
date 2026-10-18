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
};
