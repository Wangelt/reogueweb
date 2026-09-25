"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatInr, type HomeProduct } from "@/lib/catalog/home-products";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ProductCard({ product }: { product: HomeProduct }) {
  return (
    <motion.article variants={cardVariants}>
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
      </div>
      <h3 className="mt-3 text-sm font-normal tracking-tight">{product.name}</h3>
      <p className="mt-0.5 text-[12px] text-mute">
        {product.size} · {product.condition}
      </p>
      <p className="mt-1 text-sm tabular-nums">{formatInr(product.priceInr)}</p>
    </motion.article>
  );
}
