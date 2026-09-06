import { Product, Category } from "../types";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "../mock/initialData";
import { apiClient } from "./client";

export const productsApi = {
  async getProducts(tenantId: string = "tenant-fashion"): Promise<Product[]> {
    try {
      const data = await apiClient.get<Product[]>("/products/");
      return data;
    } catch {
      const stored = apiClient.getStorage<Product[]>("products", INITIAL_PRODUCTS);
      return stored.filter((p) => p.tenantId === tenantId);
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await apiClient.get<Product>(`/products/${id}/`);
    } catch {
      const products = await this.getProducts();
      return products.find((p) => p.id === id) || null;
    }
  },

  async getCategories(tenantId: string = "tenant-fashion"): Promise<Category[]> {
    try {
      return await apiClient.get<Category[]>("/categories/");
    } catch {
      const stored = apiClient.getStorage<Category[]>("categories", INITIAL_CATEGORIES);
      return stored.filter((c) => c.tenantId === tenantId);
    }
  },

  async createCategory(tenantId: string, name: string, description?: string): Promise<Category> {
    const all = apiClient.getStorage<Category[]>("categories", INITIAL_CATEGORIES);
    const newCat: Category = {
      id: "cat-" + Date.now(),
      tenantId,
      name: name.trim(),
      description,
      productCount: 0,
    };
    apiClient.setStorage("categories", [...all, newCat]);
    return newCat;
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    const all = apiClient.getStorage<Category[]>("categories", INITIAL_CATEGORIES);
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Category not found");
    all[idx] = { ...all[idx], name: name.trim() };
    apiClient.setStorage("categories", all);
    return all[idx];
  },

  async deleteCategory(id: string): Promise<void> {
    const all = apiClient.getStorage<Category[]>("categories", INITIAL_CATEGORIES);
    apiClient.setStorage("categories", all.filter((c) => c.id !== id));
  },

  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    try {
      return await apiClient.post<Product>("/products/", productData);
    } catch {
      const current = apiClient.getStorage<Product[]>("products", INITIAL_PRODUCTS);
      const newProduct: Product = {
        ...productData,
        id: "prod-" + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newProduct, ...current];
      apiClient.setStorage("products", updated);
      return newProduct;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      return await apiClient.patch<Product>(`/products/${id}/`, updates);
    } catch {
      const current = apiClient.getStorage<Product[]>("products", INITIAL_PRODUCTS);
      const index = current.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Product not found");
      const updatedProduct = {
        ...current[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      current[index] = updatedProduct;
      apiClient.setStorage("products", current);
      return updatedProduct;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/products/${id}/`);
      return true;
    } catch {
      const current = apiClient.getStorage<Product[]>("products", INITIAL_PRODUCTS);
      const filtered = current.filter((p) => p.id !== id);
      apiClient.setStorage("products", filtered);
      return true;
    }
  },
};
