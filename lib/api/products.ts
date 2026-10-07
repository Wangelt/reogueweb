import { api } from "@/lib/api/client";
import type { Product, PaginatedResponse, ProductFilters } from "@/lib/api/types";

export const productsApi = {
  list: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return api.get<PaginatedResponse<Product>>(
      qs ? `/products?${qs}` : "/products",
      { auth: false },
    );
  },

  getBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`, { auth: false }),
};
