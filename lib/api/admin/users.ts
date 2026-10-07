import { api } from "@/lib/api/client";
import type { User, UserRole, PaginatedResponse } from "@/lib/api/types";

export const adminUsersApi = {
  list: (params: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
    isActive?: boolean;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.role) qs.set("role", params.role);
    if (params.search) qs.set("search", params.search);
    if (params.isActive !== undefined) qs.set("isActive", String(params.isActive));
    const query = qs.toString();
    return api.get<PaginatedResponse<User>>(
      query ? `/admin/users?${query}` : "/admin/users",
    );
  },

  updateRole: (userId: string, role: UserRole) =>
    api.patch<User>(`/admin/users/${userId}/role`, { role }),

  updateStatus: (userId: string, isActive: boolean) =>
    api.patch<User>(`/admin/users/${userId}/status`, { isActive }),
};
