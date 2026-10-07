import { api } from "@/lib/api/client";
import type { DashboardStats } from "@/lib/api/types";

export const adminDashboardApi = {
  getStats: () => api.get<DashboardStats>("/admin/dashboard"),
};
