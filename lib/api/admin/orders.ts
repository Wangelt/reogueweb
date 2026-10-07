import { api } from "@/lib/api/client";
import type { Order, OrderStatus, PaginatedResponse } from "@/lib/api/types";

export const adminOrdersApi = {
  list: (params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<PaginatedResponse<Order>>(query ? `/orders?${query}` : "/orders");
  },

  updateStatus: (
    orderId: string,
    data: { status: OrderStatus; note?: string },
  ) => api.patch<Order>(`/orders/${orderId}/status`, data),
};
