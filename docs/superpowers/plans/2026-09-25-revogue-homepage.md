# ReVogue Homepage — Implementation Plan

**Date:** 2026-09-25  
**Spec:** `docs/superpowers/specs/2026-09-25-revogue-homepage-ui-design.md`

## Files

| File | Role |
|---|---|
| `app/globals.css` | Canvas/ink/mute/line tokens, no dark mode |
| `app/layout.tsx` | Fonts, header, footer |
| `app/page.tsx` | Hero + edit + brand line |
| `lib/catalog/home-products.ts` | Four mock products |
| `components/site-header.tsx` | Wordmark, Shop `#edit`, Bag 0 |
| `components/site-footer.tsx` | India · shipping |
| `components/home-hero.tsx` | Photo + overline + h1 |
| `components/product-card.tsx` | 3:4 image, meta, INR |
| `components/product-edit.tsx` | `#edit` grid |
| `next.config.ts` | Unsplash `remotePatterns` |
