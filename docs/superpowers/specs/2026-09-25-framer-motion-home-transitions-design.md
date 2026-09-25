# Framer Motion Home Page Transitions

**Date:** 2026-09-25  
**Project:** Revogue — revogueweb

---

## Overview

Add Framer Motion animations to the home page to give it a beautiful, editorial feel. The style is **Editorial Drift** — slow staggered fade-ups with expo ease-out, unhurried and luxurious.

---

## Animation Style

- **Style:** Editorial Drift
- **Easing:** `[0.22, 1, 0.36, 1]` (expo ease-out) throughout
- **Philosophy:** Slow, deliberate, staggered. Nothing snaps. Everything drifts in.

---

## Page Load Transition

The entire `<main>` element fades in over **0.5s** on initial load, acting as a soft curtain lift before individual elements begin their sequences.

| Property | Value |
|---|---|
| Element | `<main>` in `app/page.tsx` |
| Component | `motion.main` |
| `initial` | `{ opacity: 0 }` |
| `animate` | `{ opacity: 1 }` |
| Duration | `0.5s` |

---

## Hero Section (`HomeHero`)

Triggered on page load. Elements animate in sequence via `variants` + `staggerChildren`.

| Element | Animation | Delay |
|---|---|---|
| Hero image (`<Image>`) | Fade in (opacity 0 → 1) | 0s |
| "New arrivals" label | Slide up 12px + fade in | 0.6s |
| "One of one." heading | Slide up 20px + fade in | 0.85s |

- Duration per element: ~0.9–1.2s
- Easing: `[0.22, 1, 0.36, 1]`

---

## Product Grid (`ProductEdit` + `ProductCard`)

Scroll-triggered. Activates when the section enters the viewport. Animates once (`viewport={{ once: true }}`).

| Element | Animation | Notes |
|---|---|---|
| "The edit" label | Slide up 10px + fade in | No stagger |
| Product cards | Slide up 16px + fade in | Stagger: 0.08s between each card |

- Duration per card: ~0.6s
- Easing: `[0.22, 1, 0.36, 1]`
- Stagger creates a left-to-right cascade across the grid

---

## Footer Tagline (`app/page.tsx`)

The "Curated pre-loved clothing..." paragraph animates in on scroll.

| Property | Value |
|---|---|
| Animation | Slide up 10px + fade in |
| Trigger | `whileInView`, `viewport={{ once: true }}` |
| Duration | `0.6s` |

---

## Full Timing Sequence

| Time | Event |
|---|---|
| 0s | Page `<main>` begins fading in |
| 0–0.5s | Page reaches full opacity |
| 0.5s | Hero image fully visible |
| 0.6s | "New arrivals" label drifts up |
| 0.85s | "One of one." heading drifts up |
| on scroll | Product grid label + cards stagger in |
| on scroll | Footer tagline fades in |

---

## Architecture

**Approach:** Convert components directly to client components (Option 1).  
These components have no server-only logic (no data fetching, no DB calls), so adding `"use client"` has no downside.

### Files changed

| File | Change |
|---|---|
| `package.json` | Add `framer-motion` dependency |
| `components/home-hero.tsx` | Add `"use client"`, wrap elements in `motion.*` with variants |
| `components/product-edit.tsx` | Add `"use client"`, add `motion.div` grid container with `staggerChildren` |
| `components/product-card.tsx` | Add `"use client"`, wrap `<article>` in `motion.article` with variants |
| `app/page.tsx` | Wrap `<main>` in `motion.main`, wrap tagline `<p>` in `motion.p` |

No new files required.

---

## Dependencies

- `framer-motion` — install via `npm install framer-motion`
