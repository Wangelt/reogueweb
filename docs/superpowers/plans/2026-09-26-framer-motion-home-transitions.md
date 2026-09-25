# Framer Motion Home Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Editorial Drift Framer Motion animations to the Revogue home page — a 0.5s page fade-in on load, staggered hero entrance, and scroll-triggered product grid stagger.

**Architecture:** Convert `HomeHero`, `ProductEdit`, `ProductCard`, and `app/page.tsx` to client components. Use Framer Motion `variants` with parent→child propagation for the product grid stagger, individual `transition.delay` for the hero sequence, and `whileInView` for all scroll-triggered elements.

**Tech Stack:** Next.js 16 (App Router), React 19, Framer Motion, TypeScript, Tailwind CSS v4

---

## File Map

| File | Change |
|---|---|
| `package.json` | Add `framer-motion` dependency |
| `app/page.tsx` | Add `"use client"`, `motion.main` page fade, `motion.p` footer tagline |
| `components/home-hero.tsx` | Add `"use client"`, `motion.*` on image, label, heading with delays |
| `components/product-card.tsx` | Add `"use client"`, `motion.article` with `cardVariants` |
| `components/product-edit.tsx` | Add `"use client"`, `motion.div` grid with `staggerChildren` + `whileInView` |

---

### Task 1: Install framer-motion

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install framer-motion
```

Expected: `added X packages` with no errors.

- [ ] **Step 2: Verify install**

```bash
node -e "require('framer-motion'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install framer-motion"
```

---

### Task 2: Page wrapper and footer tagline (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
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
        Curated pre-loved clothing. Inspected, graded, and listed as one of one.
      </motion.p>
    </motion.main>
  );
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open http://localhost:3001. Reload — the entire page should fade in over 0.5s. No content should flash before the fade.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add page-level 0.5s fade-in transition"
```

---

### Task 3: Hero animations (`components/home-hero.tsx`)

**Files:**
- Modify: `components/home-hero.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
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
```

- [ ] **Step 2: Verify hero sequence in browser**

With dev server running at http://localhost:3001, reload and observe:
1. Image fades in over 1.2s
2. "New arrivals" label drifts up from 12px at ~0.6s
3. "One of one." heading drifts up from 20px at ~0.85s

All three should feel slow and deliberate — no snapping.

- [ ] **Step 3: Commit**

```bash
git add components/home-hero.tsx
git commit -m "feat: add staggered hero entrance animations"
```

---

### Task 4: Product card animation variants (`components/product-card.tsx`)

**Files:**
- Modify: `components/product-card.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatInr, type HomeProduct } from "@/lib/catalog/home-products";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
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
```

Note: `motion.article` has no `initial`/`animate` — it inherits the variant state from the parent grid container in `ProductEdit`. Framer Motion propagates `"hidden"`/`"visible"` down to any child with a matching `variants` definition.

- [ ] **Step 2: Commit**

```bash
git add components/product-card.tsx
git commit -m "feat: add product card motion variants"
```

---

### Task 5: Product grid stagger (`components/product-edit.tsx`)

**Files:**
- Modify: `components/product-edit.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
"use client";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";
import type { HomeProduct } from "@/lib/catalog/home-products";

const ease = [0.22, 1, 0.36, 1] as const;

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function ProductEdit({ products }: { products: HomeProduct[] }) {
  return (
    <section id="edit" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
      <motion.p
        className="mb-8 text-[11px] uppercase tracking-[0.28em] text-mute"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        The edit
      </motion.p>
      <motion.div
        className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6"
        variants={gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </section>
  );
}
```

How it works: the `motion.div` grid sets `initial="hidden"` and triggers `"visible"` when scrolled into view. Each `ProductCard`'s `motion.article` inherits these variant names and staggers in 0.08s apart using the `cardVariants` definition from Task 4.

- [ ] **Step 2: Verify scroll animation in browser**

Scroll down on http://localhost:3001. You should see:
1. "The edit" label fades and slides up
2. Product cards stagger in left-to-right (0.08s between each), each drifting up 16px
3. Animations play once — scrolling back up and down again does not re-trigger them

- [ ] **Step 3: Commit**

```bash
git add components/product-edit.tsx
git commit -m "feat: add scroll-triggered product grid stagger"
```

---

### Task 6: Final build check

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build completes with no TypeScript errors. Image optimization warnings are OK.

- [ ] **Step 2: Full page walkthrough**

Open http://localhost:3001 and verify the complete sequence:

| # | What to see |
|---|---|
| 1 | Page fades in over 0.5s — no flash of unstyled content |
| 2 | Hero image fades in over 1.2s |
| 3 | "New arrivals" label drifts up at ~0.6s |
| 4 | "One of one." heading drifts up at ~0.85s |
| 5 | Scroll down — "The edit" label fades in |
| 6 | Product cards cascade in left-to-right |
| 7 | Continue scrolling — footer tagline fades in |
| 8 | Reload — full sequence replays correctly |
