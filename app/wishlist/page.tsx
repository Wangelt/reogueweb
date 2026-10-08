"use client";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/components/providers";
import { useCart } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function WishlistPage() {
  const { items, loading, removeByProductId } = useWishlist();
  const { addItem: addToCart } = useCart();

  if (loading && items.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5">
        <p className="text-sm text-mute">Your wishlist is empty.</p>
        <Link href="/products">
          <Button variant="secondary">Browse Products</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="mb-10 text-[11px] font-medium uppercase tracking-[0.28em]">Wishlist</h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <Link href={`/products/${item.product.slug}`}>
              <div className="relative aspect-[3/4] overflow-hidden bg-stone">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].altText ?? item.product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <h3 className="mt-3 text-sm font-normal tracking-tight">{item.product.name}</h3>
              <p className="mt-0.5 text-[12px] text-mute">
                {item.product.size} · {item.product.condition.replace(/_/g, " ")}
              </p>
              <p className="mt-1 text-sm tabular-nums">{formatInr(item.product.sellingPrice)}</p>
            </Link>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full text-[12px]"
                onClick={() => addToCart(item.product.id, 1)}
              >
                Add to Bag
              </Button>
              <button
                onClick={() => removeByProductId(item.product.id)}
                className="text-center text-[12px] text-mute underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
