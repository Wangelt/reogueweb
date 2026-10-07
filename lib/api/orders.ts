import { api } from "@/lib/api/client";
import type { Order, PaginatedResponse, OrderStatus } from "@/lib/api/types";

export const ordersApi = {
  create: (data: { addressId: string; couponCode?: string }) =>
    api.post<Order>("/orders", data),

  list: (params: { page?: number; limit?: number; status?: OrderStatus } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<PaginatedResponse<Order>>(query ? `/orders?${query}` : "/orders");
  },

  getById: (orderId: string) => api.get<Order>(`/orders/${orderId}`),
};
