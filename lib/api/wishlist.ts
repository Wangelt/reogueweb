import { api } from "@/lib/api/client";
import type { Product, WishlistItem } from "@/lib/api/types";

interface WishlistResponse {
  items: {
    _id: string;
    product: Product;
    addedAt: string;
  }[];
}

function toWishlistItems(response: WishlistResponse): WishlistItem[] {
  return response.items.map(({ _id, product, addedAt }) => ({
    id: _id,
    productId: product.id,
    product,
    addedAt,
  }));
}

export const wishlistApi = {
  get: async () => toWishlistItems(await api.get<WishlistResponse>("/wishlist")),

  addItem: async (productId: string) =>
    toWishlistItems(
      await api.post<WishlistResponse>("/wishlist/items", { productId }),
    ),

  removeItem: (itemId: string) => api.delete<void>(`/wishlist/items/${itemId}`),
};
