# Revogue Web App — Full API Integration Design

**Date:** 2026-10-07  
**Approach:** Hybrid (Option C) — RSC for reads, Client Context for shared mutable state  
**Scope:** All 48 backend endpoints across 11 modules

---

## 0. Implementation Note

`AGENTS.md` flags that this Next.js version (16.3.6) has breaking API and convention changes from earlier versions. Before writing any page or component, the implementer **must** read `node_modules/next/dist/docs/` (resolved from `revogueweb/`) for the relevant guide. Do not assume Next.js 13/14/15 conventions apply.

---

## 1. Architecture Overview

Next.js 16 App Router. Product listings and admin data tables are React Server Components (RSC) — fast, SEO-friendly, no client JS for reads. Auth state, cart, and wishlist are client-side React Contexts so header badges and toggle states update instantly across the layout.

The existing `lib/api/client.ts` fetch wrapper is the single HTTP transport layer. All new API calls go through it. No third-party state management library is added.

---

## 2. API Service Layer

One typed service file per backend module, all in `lib/api/`. Each file exports plain async functions called by hooks and server components alike.

```
lib/api/
├── client.ts          (existing — no changes)
├── types.ts           (existing — extend with all domain types)
├── errors.ts          (existing)
├── tokens.ts          (existing)
├── auth.ts            login, register, logout, refresh, forgotPassword, resetPassword, verifyEmail, changePassword
├── users.ts           getMe, updateMe, listAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress
├── categories.ts      list, getBySlug, getChildren
├── products.ts        list (filters + pagination), getBySlug
├── cart.ts            get, addItem, updateItem, removeItem, clear
├── wishlist.ts        get, addItem, removeItem
├── orders.ts          create, list, getById
├── payments.ts        verify
├── coupons.ts         validate
├── admin/
│   ├── dashboard.ts   getStats
│   ├── products.ts    create, update, publish, archive, delete
│   ├── categories.ts  create, update, delete
│   ├── orders.ts      updateStatus
│   ├── inventory.ts   get, listMovements, init, adjust
│   ├── coupons.ts     create, list, getById, update, deactivate
│   └── users.ts       list, updateRole, updateStatus
└── index.ts           barrel export
```

**Type definitions** added to `lib/api/types.ts`:  
`User`, `Address`, `Category`, `Product`, `CartItem`, `Cart`, `WishlistItem`, `Order`, `OrderItem`, `Payment`, `Coupon`, `InventoryMovement`, `DashboardStats`, `PaginatedResponse<T>`, `ApiResponse<T>`

---

## 3. State Management

Three `"use client"` context providers, all composed in `components/providers.tsx` and mounted once in `app/layout.tsx`.

### AuthContext
- State: `user: User | null`, `loading: boolean`
- Initial value: server reads `rv_access` cookie in the root layout and passes the decoded user as a prop to `<Providers initialUser={user}>` — no hydration flash
- Actions: `login(email, password)`, `register(...)`, `logout()`, `refreshUser()`
- On `logout()`: calls `POST /auth/logout`, clears cookies, resets state, redirects to `/`

### CartContext
- State: `cart: Cart | null`, `loading: boolean`
- Loads on mount via `cartApi.get()`
- Actions: `addItem(productId, qty)`, `updateItem(itemId, qty)`, `removeItem(itemId)`, `clearCart()`
- `count` derived value: sum of all item quantities — read by `SiteHeader` for badge

### WishlistContext
- State: `itemIds: Set<string>`, `loading: boolean`
- Loads on mount, stores only IDs for O(1) `isWishlisted(productId)` check
- Actions: `addItem(productId)`, `removeItem(itemId)`
- `ProductCard` reads `isWishlisted` to render filled/outline heart with no round trip

---

## 4. Pages & Routes

### Auth (public)
| Route | Description |
|---|---|
| `/login` | Email + password form. On success sets cookies, updates AuthContext, redirects to `?next=` or `/account` |
| `/register` | Registration form. On success calls `POST /auth/login` with same credentials to obtain tokens, then redirects to `/account` |
| `/forgot-password` | Email input. Shows success banner (no redirect) |
| `/reset-password` | Reads `?token=` from URL. New password form |
| `/verify-email` | Reads `?token=` from URL. Auto-submits on mount, shows result |

### Catalog (public, RSC)
| Route | Description |
|---|---|
| `/products` | RSC. Reads URL search params (`category`, `gender`, `size`, `condition`, `minPrice`, `maxPrice`, `sort`, `page`). Renders `<ProductFilters>` (client) + `<ProductGrid>`. Filters update URL params → triggers RSC re-fetch |
| `/products/[slug]` | RSC. Fetches product by slug. Client component for Add to Cart + Wishlist toggle |

### Account (protected)
| Route | Description |
|---|---|
| `/account` | Profile form (name, phone) + change password section |
| `/account/addresses` | Address list + inline add/edit/delete/set-default |
| `/account/orders` | Paginated order list with status badges |
| `/account/orders/[id]` | Order detail: items, status timeline, totals |

### Cart & Checkout (protected)
| Route | Description |
|---|---|
| `/cart` | Cart items with quantity steppers, subtotal. "Proceed to Checkout" CTA |
| `/checkout` | Address selector, coupon input (validates live), order summary. "Pay Now" flow: (1) `POST /orders` → backend creates Razorpay order, returns `{ orderId, razorpayOrderId, amount }`; (2) open Razorpay modal with those values; (3) on modal success `POST /payments/verify` with the three Razorpay tokens; (4) redirect to `/account/orders/[id]` |

### Wishlist (protected)
| Route | Description |
|---|---|
| `/wishlist` | Wishlist grid. Remove item + "Add to Cart" per item |

### Admin (protected, ADMIN/STAFF only — role enforced in `app/admin/layout.tsx` server component: calls `getMe()`, redirects to `/` if role is not ADMIN or STAFF)
| Route | Description |
|---|---|
| `/admin` | Stats cards: revenue, orders, users, products |
| `/admin/products` | Table: all products. Actions: publish, archive, delete. "+ New Product" slide-over form |
| `/admin/categories` | Nested list. Create/edit/delete. Parent selector on create |
| `/admin/orders` | Table with status filter. Inline status update dropdown |
| `/admin/users` | Table with role/status filters. Update role + activate/deactivate |
| `/admin/inventory/[productId]` | Stock level, movement log (paginated), adjust form |
| `/admin/coupons` | Table. Create/edit/deactivate |

---

## 5. New Components

### UI Primitives (`components/ui/`)
- `button.tsx` — variants: primary, secondary, ghost, destructive; loading state (spinner + disabled)
- `input.tsx` — label + error message built in
- `badge.tsx` — status colors (order status, product condition, user role)
- `spinner.tsx` — inline loading indicator
- `data-table.tsx` — sortable columns, pagination controls, empty state; used by all admin tables

### Feature Components
```
components/
├── forms/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── AddressForm.tsx
│   └── CheckoutForm.tsx
├── product/
│   ├── ProductGrid.tsx       (server component wrapper)
│   ├── ProductFilters.tsx    (client — updates URL params)
│   └── ProductDetail.tsx     (client — cart/wishlist actions)
├── cart/
│   ├── CartItem.tsx
│   └── CartSummary.tsx
├── admin/
│   └── StatsCard.tsx
└── providers.tsx             (AuthContext + CartContext + WishlistContext)
```

---

## 6. Loading & Error Handling

- Every RSC route gets a co-located `loading.tsx` (skeleton UI) and `error.tsx` (error boundary with retry)
- Client mutations: button shows inline spinner, is disabled during the request
- API errors surface as an inline banner above the triggering form (`useState` — no external toast library)
- 401 from the API client → existing middleware redirects to `/login?next=[pathname]` — no extra handling needed
- Razorpay: load SDK via Next.js `<Script strategy="lazyOnload">` in the checkout page. On success callback call `POST /payments/verify`. On failure show inline error.

---

## 7. File Creation Summary

**New files count:** ~65  
- 13 API service files  
- 3 context providers + `providers.tsx`  
- 21 page files (`page.tsx` + `loading.tsx` + `error.tsx` per route group)  
- ~15 component files  
- Extended `lib/api/types.ts`

**Existing files modified:**
- `app/layout.tsx` — add `<Providers>` wrapper, pass initial user from server
- `lib/proxy/routes.ts` — add `/admin` to protected prefixes  
- `components/site-header.tsx` — wire cart count badge from CartContext, add auth-aware nav links
- `components/product-card.tsx` — wire wishlist toggle from WishlistContext
