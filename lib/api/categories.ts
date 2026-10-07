import { api } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories", { auth: false }),

  getBySlug: (slug: string) =>
    api.get<Category>(`/categories/${slug}`, { auth: false }),

  getChildren: (slug: string) =>
    api.get<Category[]>(`/categories/${slug}/children`, { auth: false }),
};
