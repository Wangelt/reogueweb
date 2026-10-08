import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/types";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function ProductGrid({ products = [] }: { products?: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-mute text-sm">
        No products found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.slug}`} className="group">
          <div className="relative aspect-[3/4] overflow-hidden bg-stone">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-mute">
                No image
              </div>
            )}
          </div>
          <h3 className="mt-3 text-sm font-normal tracking-tight">{product.name}</h3>
          <p className="mt-0.5 text-[12px] text-mute">
            {product.size} · {product.condition.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-sm tabular-nums">{formatInr(product.sellingPrice)}</p>
        </Link>
      ))}
    </div>
  );
}
