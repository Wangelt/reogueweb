"use client";
import { motion } from "framer-motion";
import { ProductEdit } from "@/components/product-edit";
import { HomeHero } from "@/components/home-hero";
import { homeProducts } from "@/lib/catalog/home-products";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  return (
    <motion.main
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease }}
    >
      <HomeHero />
      <ProductEdit products={homeProducts} />
      <motion.p
        className="mx-auto max-w-md border-t border-line px-5 py-14 text-center text-[15px] leading-relaxed tracking-wide text-mute sm:px-8"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        Curated pre-lived clothing. Inspected, graded, and listed as one of one.
      </motion.p>
    </motion.main>
  );
}
