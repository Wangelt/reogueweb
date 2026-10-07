import { api } from "@/lib/api/client";
import type { Inventory, InventoryMovement, PaginatedResponse } from "@/lib/api/types";

export const adminInventoryApi = {
  get: (productId: string) =>
    api.get<Inventory>(`/inventory/${productId}`),

  listMovements: (
    productId: string,
    params: { page?: number; limit?: number } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return api.get<PaginatedResponse<InventoryMovement>>(
      query
        ? `/inventory/${productId}/movements?${query}`
        : `/inventory/${productId}/movements`,
    );
  },

  init: (productId: string, data: { quantity?: number; reason?: string }) =>
    api.post<Inventory>(`/inventory/${productId}`, data),

  adjust: (productId: string, data: { delta: number; reason?: string }) =>
    api.patch<Inventory>(`/inventory/${productId}`, data),
};
