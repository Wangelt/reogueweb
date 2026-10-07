import { api } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";

export const adminCategoriesApi = {
  create: (data: {
    name: string;
    description?: string;
    parent?: string;
    sortOrder?: number;
    image?: string;
  }) => api.post<Category>("/categories", data),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      parent?: string;
      isActive?: boolean;
      sortOrder?: number;
      image?: string;
    },
  ) => api.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) => api.delete<void>(`/categories/${id}`),
};
