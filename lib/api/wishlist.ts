import { api } from "@/lib/api/client";
import type { WishlistItem } from "@/lib/api/types";

export const wishlistApi = {
  get: () => api.get<WishlistItem[]>("/wishlist"),

  addItem: (productId: string) =>
    api.post<WishlistItem>("/wishlist/items", { productId }),

  removeItem: (itemId: string) => api.delete<void>(`/wishlist/items/${itemId}`),
};
