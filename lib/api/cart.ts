import { api } from "@/lib/api/client";
import type { Cart } from "@/lib/api/types";

export const cartApi = {
  get: () => api.get<Cart>("/cart"),

  addItem: (productId: string, quantity: number) =>
    api.post<Cart>("/cart/items", { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    api.put<Cart>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}`),

  clear: () => api.delete<void>("/cart"),
};
