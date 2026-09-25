"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const HERO_SRC =
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeHero() {
  return (
    <section className="relative isolate h-[62vh] min-h-[22rem] overflow-hidden sm:h-[70vh]">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease }}
      >
        <Image
          src={HERO_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-background/25" aria-hidden />
      <div
        className="hero-grain pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 sm:pb-12">
        <motion.p
          className="mb-2 text-[11px] uppercase tracking-[0.28em] text-foreground/80"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease }}
        >
          New arrivals
        </motion.p>
        <motion.h1
          className="max-w-xl text-[2.35rem] font-medium leading-[0.95] tracking-[-0.03em] sm:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease }}
        >
          One of one.
        </motion.h1>
      </div>
    </section>
  );
}
