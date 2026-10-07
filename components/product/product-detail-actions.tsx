"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useCart } from "@/components/providers";
import { useWishlist } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import type { Product } from "@/lib/api/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem: addToCart, loading: cartLoading } = useCart();
  const { isWishlisted, addItem: addToWishlist, removeByProductId } = useWishlist();

  const [cartError, setCartError] = useState("");
  const wishlisted = isWishlisted(product.id);

  async function handleAddToCart() {
    if (!user) { router.push(`/login?next=/products/${product.slug}`); return; }
    setCartError("");
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      setCartError(err instanceof ApiError ? err.message : "Could not add to bag.");
    }
  }

  async function handleToggleWishlist() {
    if (!user) { router.push(`/login?next=/products/${product.slug}`); return; }
    if (wishlisted) {
      await removeByProductId(product.id);
    } else {
      await addToWishlist(product.id);
    }
  }

  if (!product.inStock || product.status !== "PUBLISHED") {
    return <p className="text-sm text-mute">This item is no longer available.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {cartError && (
        <p className="text-sm text-red-600">{cartError}</p>
      )}
      <Button onClick={handleAddToCart} loading={cartLoading} className="w-full">
        Add to Bag
      </Button>
      <Button variant="secondary" onClick={handleToggleWishlist} className="w-full">
        {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
    </div>
  );
}
