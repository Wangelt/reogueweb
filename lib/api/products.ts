import { api } from "@/lib/api/client";
import type { PaginatedResponse, Product, ProductFilters } from "@/lib/api/types";

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
      { auth: false, next: { revalidate: 60 } },
    );
  },

  getBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`, { auth: false }),
};
