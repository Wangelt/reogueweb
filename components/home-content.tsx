"use client";
import { motion } from "framer-motion";
import { HomeHero } from "@/components/home-hero";
import { ProductEdit } from "@/components/product-edit";
import type { HomeProduct } from "@/lib/catalog/home-products";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

export function HomeContent({
  products,
  productsRateLimited = false,
}: {
  products: HomeProduct[];
  productsRateLimited?: boolean;
}) {
  return (
    <motion.main
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease }}
    >
      <HomeHero />
      {productsRateLimited && (
        <p role="alert" className="px-5 text-center text-sm text-mute sm:px-8">
          The shop is receiving too many requests right now. Please wait a
          moment and refresh the page.
        </p>
      )}
      <ProductEdit products={products} />
      <motion.p
        className="mx-auto max-w-md border-t border-line px-5 py-14 text-center text-[15px] leading-relaxed tracking-wide text-mute sm:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        Curated pre-loved clothing. Inspected, graded, and listed as one of one.
      </motion.p>
    </motion.main>
  );
}
