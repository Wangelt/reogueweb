import { api } from "@/lib/api/client";
import type { Product, PaginatedResponse, Gender, ProductCondition } from "@/lib/api/types";

export const adminProductsApi = {
  create: (data: {
    name: string;
    description: string;
    brand: string;
    category: string;
    subcategory?: string;
    gender: Gender;
    size: string;
    color: string;
    material?: string;
    condition: ProductCondition;
    conditionDescription?: string;
    originalPrice: number;
    sellingPrice: number;
    sku: string;
    tags?: string[];
    featured?: boolean;
  }) => api.post<Product>("/products", data),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      brand?: string;
      category?: string;
      subcategory?: string;
      gender?: Gender;
      size?: string;
      color?: string;
      material?: string;
      condition?: ProductCondition;
      conditionDescription?: string;
      originalPrice?: number;
      sellingPrice?: number;
      sku?: string;
      tags?: string[];
      featured?: boolean;
    },
  ) => api.patch<Product>(`/products/${id}`, data),

  publish: (id: string) => api.patch<Product>(`/products/${id}/publish`),

  archive: (id: string) => api.patch<Product>(`/products/${id}/archive`),

  delete: (id: string) => api.delete<void>(`/products/${id}`),

  list: (filters: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return api.get<PaginatedResponse<Product>>(qs ? `/products?${qs}` : "/products");
  },
};
