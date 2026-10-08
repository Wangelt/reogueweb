# ReVogue Homepage UI — Design Spec

**Date:** 2026-09-25  
**Status:** Draft — awaiting review  
**Project:** ReVogue web (`revogueweb`)  
**Scope:** Fully polished homepage only

---

## 1. Context

ReVogue is a curated pre-loved fashion store for India. Products are often one-of-one. This spec covers the first customer-facing surface: the homepage.

Later storefront work (shop, product, cart) was explored and **deferred**. Those decisions are recorded in section 8 so they are not rediscovered.

---

## 2. Goals

- Replace the current placeholder home with a quiet-luxury ReVogue landing page.
- Establish visual tokens and site chrome (header, footer) that later pages can reuse.
- Show a small, real-feeling product edit using mock data (API wiring is out of scope).
- Work on mobile and desktop.

**Success looks like:** a visitor understands this is a curated second-hand shop, can see four pieces with size, condition, and INR price, and the page feels finished — not a wireframe.

---

## 3. Non-goals

- Shop catalog, product detail, cart drawer, login, checkout, admin
- Live `api.get("/products")` (optional later; homepage ships with static mock items)
- Dark mode / `prefers-color-scheme` theming
- Search, filters, wishlist, account

Header **Shop** and **Bag** are visible for chrome completeness. Shop is an in-page link to `#edit`. Bag shows `0` and does not open a drawer.

---

## 4. Visual language

| Token | Value | Use |
|---|---|---|
| Canvas | `#F3F1EE` | Page background |
| Ink | `#111111` | Type, rules, primary buttons |
| Mute | `#6B6863` | Secondary type |
| Line | `#DDD9D2` | Hairline borders |
| Stone | `#CFCBC4` and neighboring greiges | Hero / image placeholders |
| Accent | None | No brand color, no gradients |

- Light theme only. Do not invert for system dark mode on this page.
- Typography: geometric sans for UI (nav, labels, price). Tight tracking, uppercase for nav and section labels. Product names in sentence case, regular weight. Avoid decorative serif (editorial look was rejected).
- Spacing: generous vertical rhythm; product grid is the densest region.
- Imagery: full-bleed hero photograph (or a solid stone field if no asset yet). Product cards use portrait photos; if assets are missing, use stone blocks — never broken-image icons.

---

## 5. Page architecture

Single route: `/` (`app/page.tsx`). Shared chrome lives in the root layout or a `SiteHeader` / `SiteFooter` used only by the home layout for now (prefer extracting so shop can reuse later).

### 5.1 Header

- Left: wordmark **ReVogue** (links to `/`)
- Center: **Shop** (uppercase, tracked), `href="#edit"`
- Right: **Bag 0** (not interactive)
- Hairline bottom border
- Sticky optional; default is static (simpler, fewer mobile issues). Do not add a mega-menu.

### 5.2 Hero

- Full viewport-width, large height (~60–70vh desktop, shorter on mobile)
- Overline: `New arrivals`
- Headline: `One of one.`
- No CTA button on the hero (quiet luxury; the grid is the next action)
- Photograph of clothing or interior; object-fit cover. Overlay type sits bottom-left on the image with enough contrast (dark type on light stone, or a thin scrim if a photo is dark)

### 5.3 The edit

- Section id: `edit`
- Label row: **The edit** only. Do not add a “Shop →” link (there is no shop route yet).
- Grid: **four** product cards
  - Desktop: 4 columns
  - Tablet: 2 columns
  - Mobile: 2 columns
- Card content, in order:
  1. Image (portrait, consistent aspect ~3:4)
  2. Name
  3. `{size} · {condition}` in mute
  4. Price as `₹` + Indian grouping (e.g. `₹2,490`)
- Cards are not required to link until product pages exist; `cursor: default` or wrap in a non-navigating article. Do not 404 to `/products/[slug]`.

### 5.4 Brand line

- One short paragraph, max ~12 words:  
  **Curated pre-loved clothing. Inspected, graded, and listed as one of one.**
- Hairline above. No extra headings.

### 5.5 Footer

- Hairline top
- Left: `India`
- Right: `Shipping from ₹99`
- Uppercase, tracked, mute. No social icons, no newsletter.

---

## 6. Components (boundaries)

| Unit | Does | Depends on |
|---|---|---|
| `SiteHeader` | Wordmark, Shop, Bag count | None |
| `SiteFooter` | India + shipping line | None |
| `HomeHero` | Overline + headline + media | Optional image src |
| `ProductCard` | Image, name, size, condition, price | `HomeProduct` type |
| `ProductEdit` | Section chrome + grid of cards | `ProductCard`, list of products |
| `HomePage` | Composes the above + brand line | Mock catalog |

`HomeProduct`: `{ id, name, size, condition, priceInr, imageSrc? }`.

Mock catalog: four hardcoded items (silk slip, linen shirt, wool coat, denim trouser) matching the approved mockup prices. Replace with API later without changing card UI.

---

## 7. States and errors

- **Images missing:** stone rectangle, no alt-text spam; if `imageSrc` exists, use meaningful alt (`{name}`).
- **Empty edit:** out of scope; always four mocks.
- **Motion:** none required. If added, CSS only, subtle, no hero video.
- **A11y:** one `h1` (headline or wordmark — pick **One of one.** as `h1`, wordmark as text link). Header nav as `<nav>`. Prices not images.

---

## 8. Deferred (already decided, not this spec)

Recorded so the next storefront spec does not reopen them:

| Surface | Decision |
|---|---|
| Overall look | Quiet luxury (not editorial archive, not warm atelier) |
| Shop | Filters + 3-column grid |
| Product | Gallery left, details right |
| Cart | Right slide-over drawer |
| Later pages | Login, checkout, admin still later |

---

## 9. Implementation notes

- Stack: Next.js App Router already in `revogueweb`, Tailwind v4, existing Geist fonts may stay for UI sans; restyle `globals.css` tokens to the table in section 4. Remove dark-mode media query for this brand.
- Do not implement shop/product/cart routes in this pass.
- Existing API client and `proxy.ts` stay as-is.

---

## 10. Testing

- Manual: desktop and a mobile viewport; header, hero type, four cards, footer.
- Confirm title remains **ReVogue**.
- Confirm Shop scrolls to The edit.
- No automated visual tests required for this pass.
