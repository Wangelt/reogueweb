"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatInr, type HomeProduct } from "@/lib/catalog/home-products";
import { useAuth } from "@/components/providers";
import { useWishlist } from "@/components/providers";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ProductCard({ product }: { product: HomeProduct }) {
  const { user } = useAuth();
  const { isWishlisted, addItem, removeByProductId, loading } = useWishlist();

  const productId = product.id;
  const wishlisted = productId ? isWishlisted(productId) : false;

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user || !productId) return;
    if (wishlisted) {
      await removeByProductId(productId);
    } else {
      await addItem(productId);
    }
  }

  return (
    <motion.article variants={cardVariants} className="relative">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-stone">
          {product.imageSrc ? (
            <Image
              src={product.imageSrc}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
          ) : null}
          {user && productId && (
            <button
              onClick={toggleWishlist}
              disabled={loading}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background"
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 ${wishlisted ? "fill-foreground" : "fill-none"} stroke-foreground`}
                strokeWidth={1.5}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>
        <h3 className="mt-3 text-sm font-normal tracking-tight">{product.name}</h3>
        <p className="mt-0.5 text-[12px] text-mute">
          {product.size} · {product.condition}
        </p>
        <p className="mt-1 text-sm tabular-nums">{formatInr(product.priceInr)}</p>
      </Link>
    </motion.article>
  );
}
