"use client";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";
import type { HomeProduct } from "@/lib/catalog/home-products";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export function ProductEdit({ products }: { products: HomeProduct[] }) {
  return (
    <section id="edit" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
      <motion.p
        className="mb-8 text-[11px] uppercase tracking-[0.28em] text-mute"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        The edit
      </motion.p>
      <motion.div
        className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </section>
  );
}
