# Revogue Web App — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire all 13 API service modules, 3 React Contexts (Auth/Cart/Wishlist), 5 shared UI components, and update the root layout + header so every subsequent plan can import and use them immediately.

**Architecture:** Hybrid RSC + Client Context. API services are plain async functions wrapping the existing `api` client in `lib/api/client.ts`. Three `"use client"` context providers are composed in `components/providers.tsx` and mounted in the root layout, receiving `initialUser` from a server-side `/users/me` call to avoid hydration flash.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, React 19 Context API. No new npm packages needed.

**Run all TypeScript checks with:** `cd revogueweb && npx tsc --noEmit`

**IMPORTANT — Next.js 16 conventions:**
- `params` and `searchParams` are `Promise<{...}>` — always `await` them
- `cookies()` from `next/headers` is async — always `await cookies()`
- Context providers must be `"use client"` components

---

### Task 1: Extend domain types

**Files:**
- Modify: `lib/api/types.ts`

- [ ] **Step 1: Replace entire contents of `lib/api/types.ts`**

```typescript
// Existing transport types — unchanged
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiErrorBody;

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  token?: string;
};

// ─── Domain types ────────────────────────────────────────────────

export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | Category;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export type Gender = "WOMEN" | "MEN" | "UNISEX" | "KIDS";
export type ProductCondition = "NEW_WITH_TAGS" | "EXCELLENT" | "GOOD" | "FAIR";
export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SOLD";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string | Category;
  subcategory?: string | Category;
  gender: Gender;
  size: string;
  color: string;
  material?: string;
  condition: ProductCondition;
  conditionDescription?: string;
  originalPrice: number;
  sellingPrice: number;
  sku: string;
  tags?: string[];
  featured: boolean;
  status: ProductStatus;
  images: string[];
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  gender?: string;
  brand?: string;
  size?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sort?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderStatusEntry {
  status: OrderStatus;
  note?: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  statusHistory: OrderStatusEntry[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  valid: boolean;
  discount: number;
  coupon?: Coupon;
}

export interface Inventory {
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  delta: number;
  reason?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/types.ts
git commit -m "feat: add domain types to lib/api/types.ts"
```

---

### Task 2: Create auth API service

**Files:**
- Create: `lib/api/auth.ts`

- [ ] **Step 1: Create `lib/api/auth.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { AuthTokens, User } from "@/lib/api/types";

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post<AuthTokens>("/auth/register", data, { auth: false }),

  login: (email: string, password: string) =>
    api.post<AuthTokens>("/auth/login", { email, password }, { auth: false }),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>("/auth/refresh", { refreshToken }, { auth: false }),

  logout: (refreshToken: string) =>
    api.post<void>("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<void>("/auth/forgot-password", { email }, { auth: false }),

  resetPassword: (token: string, password: string) =>
    api.post<void>("/auth/reset-password", { token, password }, { auth: false }),

  verifyEmail: (token: string) =>
    api.post<void>("/auth/verify-email", { token }, { auth: false }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<void>("/auth/change-password", { currentPassword, newPassword }),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/auth.ts
git commit -m "feat: add auth API service"
```

---

### Task 3: Create users API service

**Files:**
- Create: `lib/api/users.ts`

- [ ] **Step 1: Create `lib/api/users.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { User, Address } from "@/lib/api/types";

export const usersApi = {
  getMe: () => api.get<User>("/users/me"),

  updateMe: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch<User>("/users/me", data),

  listAddresses: () => api.get<Address[]>("/users/me/addresses"),

  addAddress: (data: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    isDefault?: boolean;
  }) => api.post<Address>("/users/me/addresses", data),

  updateAddress: (
    addressId: string,
    data: {
      fullName?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    },
  ) => api.patch<Address>(`/users/me/addresses/${addressId}`, data),

  deleteAddress: (addressId: string) =>
    api.delete<void>(`/users/me/addresses/${addressId}`),

  setDefaultAddress: (addressId: string) =>
    api.patch<Address>(`/users/me/addresses/${addressId}/default`),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/users.ts
git commit -m "feat: add users API service"
```

---

### Task 4: Create categories API service

**Files:**
- Create: `lib/api/categories.ts`

- [ ] **Step 1: Create `lib/api/categories.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories", { auth: false }),

  getBySlug: (slug: string) =>
    api.get<Category>(`/categories/${slug}`, { auth: false }),

  getChildren: (slug: string) =>
    api.get<Category[]>(`/categories/${slug}/children`, { auth: false }),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/categories.ts
git commit -m "feat: add categories API service"
```

---

### Task 5: Create products API service

**Files:**
- Create: `lib/api/products.ts`

- [ ] **Step 1: Create `lib/api/products.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Product, PaginatedResponse, ProductFilters } from "@/lib/api/types";

export const productsApi = {
  list: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return api.get<PaginatedResponse<Product>>(
      qs ? `/products?${qs}` : "/products",
      { auth: false },
    );
  },

  getBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`, { auth: false }),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/products.ts
git commit -m "feat: add products API service"
```

---

### Task 6: Create cart API service

**Files:**
- Create: `lib/api/cart.ts`

- [ ] **Step 1: Create `lib/api/cart.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Cart } from "@/lib/api/types";

export const cartApi = {
  get: () => api.get<Cart>("/cart"),

  addItem: (productId: string, quantity: number) =>
    api.post<Cart>("/cart/items", { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    api.put<Cart>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}`),

  clear: () => api.delete<void>("/cart"),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/cart.ts
git commit -m "feat: add cart API service"
```

---

### Task 7: Create wishlist API service

**Files:**
- Create: `lib/api/wishlist.ts`

- [ ] **Step 1: Create `lib/api/wishlist.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { WishlistItem } from "@/lib/api/types";

export const wishlistApi = {
  get: () => api.get<WishlistItem[]>("/wishlist"),

  addItem: (productId: string) =>
    api.post<WishlistItem>("/wishlist/items", { productId }),

  removeItem: (itemId: string) => api.delete<void>(`/wishlist/items/${itemId}`),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/wishlist.ts
git commit -m "feat: add wishlist API service"
```

---

### Task 8: Create orders API service

**Files:**
- Create: `lib/api/orders.ts`

- [ ] **Step 1: Create `lib/api/orders.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Order, PaginatedResponse, OrderStatus } from "@/lib/api/types";

export const ordersApi = {
  create: (data: { addressId: string; couponCode?: string }) =>
    api.post<Order>("/orders", data),

  list: (params: { page?: number; limit?: number; status?: OrderStatus } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<PaginatedResponse<Order>>(query ? `/orders?${query}` : "/orders");
  },

  getById: (orderId: string) => api.get<Order>(`/orders/${orderId}`),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/orders.ts
git commit -m "feat: add orders API service"
```

---

### Task 9: Create payments API service

**Files:**
- Create: `lib/api/payments.ts`

- [ ] **Step 1: Create `lib/api/payments.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Order } from "@/lib/api/types";

export const paymentsApi = {
  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post<Order>("/payments/verify", data),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/payments.ts
git commit -m "feat: add payments API service"
```

---

### Task 10: Create coupons API service

**Files:**
- Create: `lib/api/coupons.ts`

- [ ] **Step 1: Create `lib/api/coupons.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { CouponValidation } from "@/lib/api/types";

export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    api.get<CouponValidation>(`/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/coupons.ts
git commit -m "feat: add coupons API service"
```

---

### Task 11: Create admin API services

**Files:**
- Create: `lib/api/admin/dashboard.ts`
- Create: `lib/api/admin/products.ts`
- Create: `lib/api/admin/categories.ts`
- Create: `lib/api/admin/orders.ts`
- Create: `lib/api/admin/users.ts`
- Create: `lib/api/admin/inventory.ts`
- Create: `lib/api/admin/coupons.ts`

- [ ] **Step 1: Create `lib/api/admin/dashboard.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { DashboardStats } from "@/lib/api/types";

export const adminDashboardApi = {
  getStats: () => api.get<DashboardStats>("/admin/dashboard"),
};
```

- [ ] **Step 2: Create `lib/api/admin/products.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Product, PaginatedResponse, Gender, ProductCondition } from "@/lib/api/types";

export const adminProductsApi = {
  create: (data: {
    name: string;
    description: string;
    brand: string;
    category: string;
    subcategory?: string;
    gender: Gender;
    size: string;
    color: string;
    material?: string;
    condition: ProductCondition;
    conditionDescription?: string;
    originalPrice: number;
    sellingPrice: number;
    sku: string;
    tags?: string[];
    featured?: boolean;
  }) => api.post<Product>("/products", data),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      brand?: string;
      category?: string;
      subcategory?: string;
      gender?: Gender;
      size?: string;
      color?: string;
      material?: string;
      condition?: ProductCondition;
      conditionDescription?: string;
      originalPrice?: number;
      sellingPrice?: number;
      sku?: string;
      tags?: string[];
      featured?: boolean;
    },
  ) => api.patch<Product>(`/products/${id}`, data),

  publish: (id: string) => api.patch<Product>(`/products/${id}/publish`),

  archive: (id: string) => api.patch<Product>(`/products/${id}/archive`),

  delete: (id: string) => api.delete<void>(`/products/${id}`),

  list: (filters: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return api.get<PaginatedResponse<Product>>(qs ? `/products?${qs}` : "/products");
  },
};
```

- [ ] **Step 3: Create `lib/api/admin/categories.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";

export const adminCategoriesApi = {
  create: (data: {
    name: string;
    description?: string;
    parent?: string;
    sortOrder?: number;
    image?: string;
  }) => api.post<Category>("/categories", data),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      parent?: string;
      isActive?: boolean;
      sortOrder?: number;
      image?: string;
    },
  ) => api.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) => api.delete<void>(`/categories/${id}`),
};
```

- [ ] **Step 4: Create `lib/api/admin/orders.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Order, OrderStatus, PaginatedResponse } from "@/lib/api/types";

export const adminOrdersApi = {
  list: (params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status) qs.set("status", params.status);
    const query = qs.toString();
    return api.get<PaginatedResponse<Order>>(query ? `/orders?${query}` : "/orders");
  },

  updateStatus: (
    orderId: string,
    data: { status: OrderStatus; note?: string },
  ) => api.patch<Order>(`/orders/${orderId}/status`, data),
};
```

- [ ] **Step 5: Create `lib/api/admin/users.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { User, UserRole, PaginatedResponse } from "@/lib/api/types";

export const adminUsersApi = {
  list: (params: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
    isActive?: boolean;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.role) qs.set("role", params.role);
    if (params.search) qs.set("search", params.search);
    if (params.isActive !== undefined) qs.set("isActive", String(params.isActive));
    const query = qs.toString();
    return api.get<PaginatedResponse<User>>(
      query ? `/admin/users?${query}` : "/admin/users",
    );
  },

  updateRole: (userId: string, role: UserRole) =>
    api.patch<User>(`/admin/users/${userId}/role`, { role }),

  updateStatus: (userId: string, isActive: boolean) =>
    api.patch<User>(`/admin/users/${userId}/status`, { isActive }),
};
```

- [ ] **Step 6: Create `lib/api/admin/inventory.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Inventory, InventoryMovement, PaginatedResponse } from "@/lib/api/types";

export const adminInventoryApi = {
  get: (productId: string) =>
    api.get<Inventory>(`/inventory/${productId}`),

  listMovements: (
    productId: string,
    params: { page?: number; limit?: number } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return api.get<PaginatedResponse<InventoryMovement>>(
      query
        ? `/inventory/${productId}/movements?${query}`
        : `/inventory/${productId}/movements`,
    );
  },

  init: (productId: string, data: { quantity?: number; reason?: string }) =>
    api.post<Inventory>(`/inventory/${productId}`, data),

  adjust: (productId: string, data: { delta: number; reason?: string }) =>
    api.patch<Inventory>(`/inventory/${productId}`, data),
};
```

- [ ] **Step 7: Create `lib/api/admin/coupons.ts`**

```typescript
import { api } from "@/lib/api/client";
import type { Coupon, CouponType } from "@/lib/api/types";

export const adminCouponsApi = {
  create: (data: {
    code: string;
    description?: string;
    type: CouponType;
    value: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    startDate: string;
    expiryDate: string;
    usageLimit?: number;
    perUserLimit?: number;
    isActive?: boolean;
  }) => api.post<Coupon>("/coupons", data),

  list: () => api.get<Coupon[]>("/coupons"),

  getById: (couponId: string) => api.get<Coupon>(`/coupons/${couponId}`),

  update: (
    couponId: string,
    data: {
      description?: string;
      value?: number;
      minimumOrderAmount?: number;
      maximumDiscountAmount?: number;
      startDate?: string;
      expiryDate?: string;
      usageLimit?: number;
      perUserLimit?: number;
      isActive?: boolean;
    },
  ) => api.patch<Coupon>(`/coupons/${couponId}`, data),

  deactivate: (couponId: string) =>
    api.patch<Coupon>(`/coupons/${couponId}/deactivate`),
};
```

- [ ] **Step 8: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 9: Commit**

```bash
git add lib/api/admin/
git commit -m "feat: add admin API services (dashboard, products, categories, orders, users, inventory, coupons)"
```

---

### Task 12: Update lib/api/index.ts barrel

**Files:**
- Modify: `lib/api/index.ts`

- [ ] **Step 1: Replace `lib/api/index.ts`**

```typescript
export { api, apiClient } from "@/lib/api/client";
export { ApiError } from "@/lib/api/errors";
export { getAccessToken } from "@/lib/api/tokens";
export type {
  ApiErrorBody,
  ApiResult,
  ApiSuccess,
  RequestOptions,
  User,
  UserRole,
  AuthTokens,
  Address,
  Category,
  Product,
  ProductFilters,
  Gender,
  ProductCondition,
  ProductStatus,
  CartItem,
  Cart,
  WishlistItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEntry,
  Coupon,
  CouponType,
  CouponValidation,
  Inventory,
  InventoryMovement,
  DashboardStats,
  PaginatedResponse,
} from "@/lib/api/types";

export { authApi } from "@/lib/api/auth";
export { usersApi } from "@/lib/api/users";
export { categoriesApi } from "@/lib/api/categories";
export { productsApi } from "@/lib/api/products";
export { cartApi } from "@/lib/api/cart";
export { wishlistApi } from "@/lib/api/wishlist";
export { ordersApi } from "@/lib/api/orders";
export { paymentsApi } from "@/lib/api/payments";
export { couponsApi } from "@/lib/api/coupons";
export { adminDashboardApi } from "@/lib/api/admin/dashboard";
export { adminProductsApi } from "@/lib/api/admin/products";
export { adminCategoriesApi } from "@/lib/api/admin/categories";
export { adminOrdersApi } from "@/lib/api/admin/orders";
export { adminUsersApi } from "@/lib/api/admin/users";
export { adminInventoryApi } from "@/lib/api/admin/inventory";
export { adminCouponsApi } from "@/lib/api/admin/coupons";
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/index.ts
git commit -m "feat: update api barrel to export all services and types"
```

---

### Task 13: Create UI primitives

**Files:**
- Create: `components/ui/spinner.tsx`
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`

- [ ] **Step 1: Create `components/ui/spinner.tsx`**

```tsx
export function Spinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-8 w-8" };
  return (
    <svg
      className={`${sizes[size]} animate-spin`}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Create `components/ui/button.tsx`**

```tsx
"use client";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/85 active:bg-foreground/70",
  secondary:
    "border border-line bg-background hover:bg-stone/30 active:bg-stone/50",
  ghost: "hover:bg-stone/30 active:bg-stone/50",
  destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

export function Button({
  variant = "primary",
  loading,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Create `components/ui/input.tsx`**

```tsx
"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-mute"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full border bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-stone-deep focus:border-foreground ${
          error ? "border-red-500" : "border-line"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Create `components/ui/badge.tsx`**

```tsx
type Variant = "default" | "success" | "warning" | "error" | "info";

const variantClass: Record<Variant, string> = {
  default: "bg-stone text-foreground",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({
  variant = "default",
  children,
}: {
  variant?: Variant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${variantClass[variant]}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add components/ui/
git commit -m "feat: add UI primitives (Spinner, Button, Input, Badge)"
```

---

### Task 14: Create DataTable component

**Files:**
- Create: `components/ui/data-table.tsx`

- [ ] **Step 1: Create `components/ui/data-table.tsx`**

```tsx
"use client";
import { Spinner } from "@/components/ui/spinner";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "No data found.",
  page = 1,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="pb-3 pr-6 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-mute"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-mute"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-line/40">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 pr-6">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages && totalPages > 1 && onPageChange && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="border border-line px-4 py-2 text-[13px] transition-colors hover:bg-stone/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[13px] text-mute">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="border border-line px-4 py-2 text-[13px] transition-colors hover:bg-stone/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/ui/data-table.tsx
git commit -m "feat: add DataTable component"
```

---

### Task 15: Create context providers

**Files:**
- Create: `components/providers.tsx`

- [ ] **Step 1: Create `components/providers.tsx`**

This file contains all three contexts (Auth, Cart, Wishlist) and the top-level `Providers` wrapper.

```tsx
"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";
import { cartApi } from "@/lib/api/cart";
import { wishlistApi } from "@/lib/api/wishlist";
import type { Cart, User, WishlistItem } from "@/lib/api/types";

// ─── Auth Context ──────────────────────────────────────────────

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: u } = await authApi.login(email, password);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      setLoading(true);
      try {
        await authApi.register(data);
        const { user: u } = await authApi.login(data.email, data.password);
        setUser(u);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const match = document.cookie.match(/rv_refresh=([^;]+)/);
    if (match?.[1]) {
      await authApi.logout(decodeURIComponent(match[1])).catch(() => {});
    }
    setUser(null);
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await usersApi.getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within Providers");
  return ctx;
}

// ─── Cart Context ──────────────────────────────────────────────

interface CartCtx {
  cart: Cart | null;
  loading: boolean;
  count: number;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reload: () => Promise<void>;
}

const CartContext = createContext<CartCtx | null>(null);

function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try { setCart(await cartApi.get()); } catch { setCart(null); }
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  const count = useMemo(
    () => cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0,
    [cart],
  );

  const addItem = useCallback(async (productId: string, quantity: number) => {
    setLoading(true);
    try { setCart(await cartApi.addItem(productId, quantity)); }
    finally { setLoading(false); }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    try { setCart(await cartApi.updateItem(itemId, quantity)); }
    finally { setLoading(false); }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setLoading(true);
    try { setCart(await cartApi.removeItem(itemId)); }
    finally { setLoading(false); }
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try { await cartApi.clear(); setCart(null); }
    finally { setLoading(false); }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, count, addItem, updateItem, removeItem, clearCart, reload }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

// ─── Wishlist Context ──────────────────────────────────────────

interface WishlistCtx {
  items: WishlistItem[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  addItem: (productId: string) => Promise<void>;
  removeByProductId: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistCtx | null>(null);

function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    wishlistApi.get().then(setItems).catch(() => setItems([]));
  }, [user]);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items],
  );

  const addItem = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const item = await wishlistApi.addItem(productId);
      setItems((prev) => [...prev, item]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeByProductId = useCallback(async (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    setLoading(true);
    try {
      await wishlistApi.removeItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } finally {
      setLoading(false);
    }
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, loading, isWishlisted, addItem, removeByProductId }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within Providers");
  return ctx;
}

// ─── Combined Providers ────────────────────────────────────────

export function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/providers.tsx
git commit -m "feat: add AuthContext, CartContext, WishlistContext in providers.tsx"
```

---

### Task 16: Update root layout to mount Providers

**Files:**
- Modify: `app/layout.tsx`

Current file uses `LayoutProps<"/">` which is a Next.js 16 global type. Params are Promises. Cookies are async.

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Familjen_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import { usersApi } from "@/lib/api/users";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import type { User } from "@/lib/api/types";
import "./globals.css";

const sans = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ReVogue", template: "%s · ReVogue" },
  description: "Curated pre-loved fashion. Shop one-of-a-kind thrift finds across India.",
  applicationName: "ReVogue",
  keywords: ["ReVogue", "thrift", "pre-loved fashion", "second-hand clothing", "India"],
  authors: [{ name: "ReVogue" }],
  creator: "ReVogue",
  publisher: "ReVogue",
  openGraph: {
    title: "ReVogue",
    description: "Curated pre-loved fashion. Shop one-of-a-kind thrift finds across India.",
    siteName: "ReVogue",
    type: "website",
    locale: "en_IN",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ReVogue",
    description: "Curated pre-loved fashion. Shop one-of-a-kind thrift finds across India.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const hasToken = Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);

  let initialUser: User | null = null;
  if (hasToken) {
    try {
      initialUser = await usersApi.getMe();
    } catch {
      // token invalid or expired — user will be redirected by middleware
    }
  }

  return (
    <html lang="en-IN" className={`${sans.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers initialUser={initialUser}>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: mount Providers in root layout with server-fetched initialUser"
```

---

### Task 17: Update SiteHeader with cart badge and auth-aware nav

**Files:**
- Modify: `components/site-header.tsx`

- [ ] **Step 1: Replace `components/site-header.tsx`**

```tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { useCart } from "@/components/providers";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-background/90 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <nav
        className="grid grid-cols-3 items-center px-5 py-4 sm:px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="justify-self-start text-[11px] font-medium uppercase tracking-[0.28em]"
        >
          ReVogue
        </Link>

        <Link
          href="/products"
          className="justify-self-center text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
        >
          Shop
        </Link>

        <div className="justify-self-end flex items-center gap-5">
          {user ? (
            <Link
              href="/account"
              className="text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
            >
              Login
            </Link>
          )}
          <Link
            href="/cart"
            className="text-[11px] uppercase tracking-[0.28em] text-mute transition-colors hover:text-foreground"
            aria-label={`Bag, ${count} items`}
          >
            Bag {count > 0 ? count : ""}
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Start dev server and visually verify header shows Login + Bag links**

Run: `cd revogueweb && npm run dev`
Open: `http://localhost:3001`
Expected: header shows "Shop", "Login", "Bag" links. When logged in: shows "Account" instead of "Login". Cart count updates after adding items.

- [ ] **Step 4: Commit**

```bash
git add components/site-header.tsx
git commit -m "feat: wire cart count and auth-aware nav in SiteHeader"
```

---

### Task 18: Update ProductCard with wishlist toggle

**Files:**
- Modify: `components/product-card.tsx`

- [ ] **Step 1: Replace `components/product-card.tsx`**

```tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatInr, type HomeProduct } from "@/lib/catalog/home-products";
import { useAuth } from "@/components/providers";
import { useWishlist } from "@/components/providers";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ProductCard({ product }: { product: HomeProduct }) {
  const { user } = useAuth();
  const { isWishlisted, addItem, removeByProductId, loading } = useWishlist();

  const productId = (product as HomeProduct & { id?: string }).id;
  const wishlisted = productId ? isWishlisted(productId) : false;

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user || !productId) return;
    if (wishlisted) {
      await removeByProductId(productId);
    } else {
      await addItem(productId);
    }
  }

  return (
    <motion.article variants={cardVariants} className="relative">
      <Link href={`/products/${(product as HomeProduct & { slug?: string }).slug ?? ""}`}>
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
          {user && productId && (
            <button
              onClick={toggleWishlist}
              disabled={loading}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background"
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 ${wishlisted ? "fill-foreground" : "fill-none"} stroke-foreground`}
                strokeWidth={1.5}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>
        <h3 className="mt-3 text-sm font-normal tracking-tight">{product.name}</h3>
        <p className="mt-0.5 text-[12px] text-mute">
          {product.size} · {product.condition}
        </p>
        <p className="mt-1 text-sm tabular-nums">{formatInr(product.priceInr)}</p>
      </Link>
    </motion.article>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/product-card.tsx
git commit -m "feat: add wishlist toggle to ProductCard"
```

---

### Task 19: Final verification

- [ ] **Step 1: Full TypeScript check**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 2: Dev server smoke test**

Run: `cd revogueweb && npm run dev`
Open: `http://localhost:3001`
Expected:
- Home page loads without error
- Header shows "Shop", "Login", "Bag" when logged out
- No console errors about missing context providers

- [ ] **Step 3: Verify api barrel exports**

In any component, importing from `@/lib/api` should provide all services and types without TypeScript errors.

---

**Plan 1 complete.** Proceed to Plan 2 (`2026-10-07-plan2-customer-pages.md`) for auth, catalog, account, cart, wishlist, and checkout pages.
