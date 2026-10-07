# Revogue Web App — Plan 2: Customer Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all customer-facing pages: auth flows, product catalog + detail, account management, cart, wishlist, and checkout with Razorpay payment.

**Architecture:** RSC for product listing/detail (SEO-friendly). Client components for all forms and interactive pages (cart, wishlist, checkout). Contexts from Plan 1 (AuthContext, CartContext, WishlistContext) wire up the interactive state.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Framer Motion. Razorpay JS SDK loaded via Next.js `<Script>`.

**Prerequisite:** Plan 1 (Foundation) must be complete before starting this plan.

**Run TypeScript check:** `cd revogueweb && npx tsc --noEmit`

**IMPORTANT — Next.js 16 conventions:**
- `params` is `Promise<{...}>` — always `await params` before accessing properties
- `searchParams` is `Promise<Record<string, string | string[] | undefined>>` — always `await searchParams`
- `cookies()` is async — `await cookies()`
- Every new page/layout auto-updates `.next/dev/types/routes.d.ts` with correct `PageProps` types

---

### Task 1: Auth page infrastructure — add `/verify-email` to auth routes

**Files:**
- Modify: `lib/proxy/routes.ts`

- [ ] **Step 1: Update `lib/proxy/routes.ts` to include `/verify-email`**

```typescript
export const AUTH_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export const PROTECTED_PREFIXES = [
  "/account",
  "/cart",
  "/checkout",
  "/wishlist",
  "/orders",
  "/admin",
];

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/proxy/routes.ts
git commit -m "feat: add /verify-email to auth pages list"
```

---

### Task 2: Login page

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/login/loading.tsx`

- [ ] **Step 1: Create `app/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const next = searchParams.get("next") ?? "/account";
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">
          Sign In
        </h1>

        {error && (
          <p className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-[11px] text-mute underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-[12px] text-mute">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline-offset-2 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/login/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/login/
git commit -m "feat: add login page"
```

---

### Task 3: Register page

**Files:**
- Create: `app/register/page.tsx`
- Create: `app/register/loading.tsx`

- [ ] **Step 1: Create `app/register/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">
          Create Account
        </h1>

        {error && (
          <p className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" id="firstName" required value={form.firstName} onChange={set("firstName")} />
            <Input label="Last Name" id="lastName" required value={form.lastName} onChange={set("lastName")} />
          </div>
          <Input label="Email" id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
          <Input label="Phone (optional)" id="phone" type="tel" value={form.phone} onChange={set("phone")} />
          <Input label="Password" id="password" type="password" autoComplete="new-password" required value={form.password} onChange={set("password")} />
          <Input label="Confirm Password" id="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={set("confirmPassword")} />

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-[12px] text-mute">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/register/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/register/
git commit -m "feat: add register page"
```

---

### Task 4: Forgot password page

**Files:**
- Create: `app/forgot-password/page.tsx`

- [ ] **Step 1: Create `app/forgot-password/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm">
            If an account with <strong>{email}</strong> exists, you'll receive a reset link shortly.
          </p>
          <Link href="/login" className="mt-6 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em]">Reset Password</h1>
        <p className="mb-8 text-sm text-mute">Enter your email and we'll send a reset link.</p>

        {error && (
          <p className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input label="Email" id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
        </form>

        <Link href="/login" className="mt-6 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/forgot-password/
git commit -m "feat: add forgot-password page"
```

---

### Task 5: Reset password page

**Files:**
- Create: `app/reset-password/page.tsx`

- [ ] **Step 1: Create `app/reset-password/page.tsx`**

```tsx
"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return <p className="text-sm text-red-600">Invalid or missing reset token.</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <p className="text-sm">Password reset successfully. Redirecting to sign in…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <Input label="New Password" id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <Input label="Confirm Password" id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <Button type="submit" loading={loading} className="w-full">Set New Password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">Set New Password</h1>
        <Suspense fallback={<div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />}>
          <ResetForm />
        </Suspense>
        <Link href="/login" className="mt-6 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/reset-password/
git commit -m "feat: add reset-password page"
```

---

### Task 6: Verify email page

**Files:**
- Create: `app/verify-email/page.tsx`

- [ ] **Step 1: Create `app/verify-email/page.tsx`**

```tsx
"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
      });
  }, [token]);

  if (status === "pending") {
    return <p className="text-sm text-mute">Verifying your email…</p>;
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <p className="text-sm">Email verified successfully!</p>
        <Link href="/account" className="mt-4 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
          Go to account
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-red-600">{message}</p>
      <Link href="/login" className="mt-4 inline-block text-[12px] text-mute underline-offset-2 hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-5">
      <Suspense fallback={<div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-foreground" />}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/verify-email/
git commit -m "feat: add verify-email page"
```

---

### Task 7: Products listing page

**Files:**
- Create: `app/products/page.tsx`
- Create: `app/products/loading.tsx`
- Create: `components/product/product-filters.tsx`
- Create: `components/product/product-grid.tsx`

- [ ] **Step 1: Create `components/product/product-filters.tsx`**

This is a client component that reads/writes URL search params.

```tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const GENDERS = ["WOMEN", "MEN", "UNISEX", "KIDS"];
const CONDITIONS = ["NEW_WITH_TAGS", "EXCELLENT", "GOOD", "FAIR"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const get = (key: string) => searchParams.get(key) ?? "";

  return (
    <aside className="flex flex-col gap-6 text-sm">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Sort</p>
        <select
          value={get("sort")}
          onChange={(e) => setParam("sort", e.target.value)}
          className="w-full border border-line bg-transparent px-3 py-2 text-sm"
        >
          <option value="">Default</option>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Gender</p>
        <div className="flex flex-col gap-2">
          {GENDERS.map((g) => (
            <label key={g} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={get("gender") === g}
                onChange={() => setParam("gender", get("gender") === g ? "" : g)}
                className="accent-foreground"
              />
              <span className="text-[13px] capitalize">{g.toLowerCase()}</span>
            </label>
          ))}
          {get("gender") && (
            <button onClick={() => setParam("gender", "")} className="text-left text-[11px] text-mute underline-offset-2 hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Condition</p>
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                value={c}
                checked={get("condition") === c}
                onChange={() => setParam("condition", get("condition") === c ? "" : c)}
                className="accent-foreground"
              />
              <span className="text-[13px] capitalize">{c.replace(/_/g, " ").toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Price</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={get("minPrice")}
            onChange={(e) => setParam("minPrice", e.target.value)}
            className="w-full border border-line bg-transparent px-2 py-1.5 text-sm"
          />
          <span className="text-mute">—</span>
          <input
            type="number"
            placeholder="Max"
            value={get("maxPrice")}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className="w-full border border-line bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <button
        onClick={() => router.push(pathname)}
        className="text-left text-[11px] text-mute underline-offset-2 hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: Create `components/product/product-grid.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/types";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-mute text-sm">
        No products found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.slug}`} className="group">
          <div className="relative aspect-[3/4] overflow-hidden bg-stone">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-mute">
                No image
              </div>
            )}
          </div>
          <h3 className="mt-3 text-sm font-normal tracking-tight">{product.name}</h3>
          <p className="mt-0.5 text-[12px] text-mute">
            {product.size} · {product.condition.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-sm tabular-nums">{formatInr(product.sellingPrice)}</p>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create `app/products/page.tsx`**

RSC — reads search params on server and fetches products.

```tsx
import { Suspense } from "react";
import { productsApi } from "@/lib/api/products";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import type { ProductFilters as Filters } from "@/lib/api/types";

export const metadata = { title: "Shop" };

async function ProductResults({ filters }: { filters: Filters }) {
  const result = await productsApi.list(filters);
  return <ProductGrid products={result.data} />;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const filters: Filters = {
    page: sp.page ? Number(sp.page) : 1,
    limit: 24,
    category: typeof sp.category === "string" ? sp.category : undefined,
    gender: typeof sp.gender === "string" ? sp.gender : undefined,
    size: typeof sp.size === "string" ? sp.size : undefined,
    condition: typeof sp.condition === "string" ? sp.condition : undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="mb-10 text-[11px] font-medium uppercase tracking-[0.28em]">Shop</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <Suspense>
          <ProductFilters />
        </Suspense>
        <Suspense fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-stone" />
                <div className="mt-3 h-3 w-3/4 bg-stone" />
                <div className="mt-1.5 h-3 w-1/2 bg-stone" />
              </div>
            ))}
          </div>
        }>
          <ProductResults filters={filters} />
        </Suspense>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Create `app/products/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-10 h-3 w-16 animate-pulse bg-stone" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-stone/50" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-stone" />
              <div className="mt-3 h-3 w-3/4 bg-stone" />
              <div className="mt-1.5 h-3 w-1/2 bg-stone" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add app/products/ components/product/
git commit -m "feat: add products listing page with filters"
```

---

### Task 8: Product detail page

**Files:**
- Create: `app/products/[slug]/page.tsx`
- Create: `app/products/[slug]/loading.tsx`
- Create: `components/product/product-detail-actions.tsx`

- [ ] **Step 1: Create `components/product/product-detail-actions.tsx`**

Client component for Add to Cart + Wishlist toggle.

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useCart } from "@/components/providers";
import { useWishlist } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import type { Product } from "@/lib/api/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem: addToCart, loading: cartLoading } = useCart();
  const { isWishlisted, addItem: addToWishlist, removeByProductId } = useWishlist();

  const [cartError, setCartError] = useState("");
  const wishlisted = isWishlisted(product.id);

  async function handleAddToCart() {
    if (!user) { router.push(`/login?next=/products/${product.slug}`); return; }
    setCartError("");
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      setCartError(err instanceof ApiError ? err.message : "Could not add to bag.");
    }
  }

  async function handleToggleWishlist() {
    if (!user) { router.push(`/login?next=/products/${product.slug}`); return; }
    if (wishlisted) {
      await removeByProductId(product.id);
    } else {
      await addToWishlist(product.id);
    }
  }

  if (!product.inStock || product.status !== "PUBLISHED") {
    return <p className="text-sm text-mute">This item is no longer available.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {cartError && (
        <p className="text-sm text-red-600">{cartError}</p>
      )}
      <Button onClick={handleAddToCart} loading={cartLoading} className="w-full">
        Add to Bag
      </Button>
      <Button variant="secondary" onClick={handleToggleWishlist} className="w-full">
        {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/products/[slug]/page.tsx`**

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { productsApi } from "@/lib/api/products";
import { ProductDetailActions } from "@/components/product/product-detail-actions";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const product = await productsApi.getBySlug(slug);
    return { title: product.name };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await productsApi.getBySlug(slug);
  } catch {
    notFound();
  }

  const category =
    typeof product.category === "object" ? product.category.name : product.category;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Images */}
        <div className="flex flex-col gap-3">
          {product.images.length > 0 ? (
            product.images.map((src, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden bg-stone">
                <Image
                  src={src}
                  alt={`${product.name} — image ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center bg-stone text-[11px] text-mute">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5 md:sticky md:top-24 md:self-start">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-mute">
              {product.brand} · {category}
            </p>
            <h1 className="text-xl font-normal tracking-tight">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-xl tabular-nums">{formatInr(product.sellingPrice)}</span>
            {product.originalPrice > product.sellingPrice && (
              <span className="text-sm tabular-nums text-mute line-through">
                {formatInr(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 border-t border-line pt-5 text-sm">
            <p><span className="text-mute">Size</span> &nbsp; {product.size}</p>
            <p><span className="text-mute">Condition</span> &nbsp; {product.condition.replace(/_/g, " ")}</p>
            <p><span className="text-mute">Colour</span> &nbsp; {product.color}</p>
            {product.material && <p><span className="text-mute">Material</span> &nbsp; {product.material}</p>}
          </div>

          {product.conditionDescription && (
            <p className="text-sm text-mute">{product.conditionDescription}</p>
          )}

          <p className="text-sm leading-relaxed text-mute">{product.description}</p>

          <ProductDetailActions product={product} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create `app/products/[slug]/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-[3/4] animate-pulse bg-stone" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 animate-pulse bg-stone" />
          <div className="h-6 w-3/4 animate-pulse bg-stone" />
          <div className="h-6 w-20 animate-pulse bg-stone" />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/products/\[slug\]/ components/product/product-detail-actions.tsx
git commit -m "feat: add product detail page"
```

---

### Task 9: Cart page

**Files:**
- Create: `app/cart/page.tsx`

- [ ] **Step 1: Create `app/cart/page.tsx`**

```tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();

  if (loading && !cart) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5">
        <p className="text-sm text-mute">Your bag is empty.</p>
        <Link href="/products">
          <Button variant="secondary">Start Shopping</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <h1 className="mb-10 text-[11px] font-medium uppercase tracking-[0.28em]">Your Bag</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-5 border-b border-line pb-6">
              <Link href={`/products/${item.product.slug}`} className="shrink-0">
                <div className="relative h-24 w-16 overflow-hidden bg-stone">
                  {item.product.images[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                  ) : null}
                </div>
              </Link>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-normal">{item.product.name}</p>
                    <p className="text-[12px] text-mute">
                      {item.product.size} · {item.product.condition.replace(/_/g, " ")}
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">{formatInr(item.product.sellingPrice)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 text-mute hover:text-foreground"
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-mute hover:text-foreground"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[12px] text-mute underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border border-line p-6 self-start">
          <p className="text-[11px] uppercase tracking-[0.2em]">Summary</p>
          <div className="flex justify-between text-sm">
            <span className="text-mute">Subtotal</span>
            <span className="tabular-nums">{formatInr(cart.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-mute">Shipping</span>
            <span className="text-mute">Calculated at checkout</span>
          </div>
          <hr className="border-line" />
          <div className="flex justify-between text-sm font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatInr(cart.total)}</span>
          </div>
          <Link href="/checkout">
            <Button className="w-full mt-2">Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/cart/
git commit -m "feat: add cart page"
```

---

### Task 10: Wishlist page

**Files:**
- Create: `app/wishlist/page.tsx`

- [ ] **Step 1: Create `app/wishlist/page.tsx`**

```tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/components/providers";
import { useCart } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function WishlistPage() {
  const { items, loading, removeByProductId } = useWishlist();
  const { addItem: addToCart } = useCart();

  if (loading && items.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5">
        <p className="text-sm text-mute">Your wishlist is empty.</p>
        <Link href="/products">
          <Button variant="secondary">Browse Products</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="mb-10 text-[11px] font-medium uppercase tracking-[0.28em]">Wishlist</h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <Link href={`/products/${item.product.slug}`}>
              <div className="relative aspect-[3/4] overflow-hidden bg-stone">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <h3 className="mt-3 text-sm font-normal tracking-tight">{item.product.name}</h3>
              <p className="mt-0.5 text-[12px] text-mute">
                {item.product.size} · {item.product.condition.replace(/_/g, " ")}
              </p>
              <p className="mt-1 text-sm tabular-nums">{formatInr(item.product.sellingPrice)}</p>
            </Link>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full text-[12px]"
                onClick={() => addToCart(item.product.id, 1)}
              >
                Add to Bag
              </Button>
              <button
                onClick={() => removeByProductId(item.product.id)}
                className="text-center text-[12px] text-mute underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/wishlist/
git commit -m "feat: add wishlist page"
```

---

### Task 11: Account layout + profile page

**Files:**
- Create: `app/account/layout.tsx`
- Create: `app/account/page.tsx`
- Create: `app/account/loading.tsx`

- [ ] **Step 1: Create `app/account/layout.tsx`**

```tsx
import Link from "next/link";

const NAV = [
  { href: "/account", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" },
];

export default function AccountLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="mb-8 text-[11px] font-medium uppercase tracking-[0.28em]">Account</h1>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-5 md:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] uppercase tracking-[0.2em] text-mute transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/account/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/components/providers";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(""); setProfileSuccess(false);
    setProfileLoading(true);
    try {
      await usersApi.updateMe({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone || undefined });
      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Passwords do not match."); return; }
    setPwError(""); setPwSuccess(false);
    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Password change failed.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Profile */}
      <section>
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-mute">Profile</h2>
        {profileError && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</p>}
        {profileSuccess && <p className="mb-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Profile updated.</p>}
        <form onSubmit={saveProfile} className="flex flex-col gap-5 max-w-sm">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" id="firstName" required value={profileForm.firstName} onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
            <Input label="Last Name" id="lastName" required value={profileForm.lastName} onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))} />
          </div>
          <Input label="Phone" id="phone" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
          <Input label="Email" id="email" type="email" value={user?.email ?? ""} disabled className="opacity-60 cursor-not-allowed" />
          <Button type="submit" loading={profileLoading}>Save Changes</Button>
        </form>
      </section>

      {/* Change Password */}
      <section>
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-mute">Change Password</h2>
        {pwError && <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwError}</p>}
        {pwSuccess && <p className="mb-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Password changed.</p>}
        <form onSubmit={changePassword} className="flex flex-col gap-5 max-w-sm">
          <Input label="Current Password" id="currentPassword" type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
          <Input label="New Password" id="newPassword" type="password" required value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
          <Input label="Confirm New Password" id="confirmPassword" type="password" required value={pwForm.confirmPassword} onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
          <Button type="submit" loading={pwLoading}>Change Password</Button>
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/account/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse bg-stone/50" />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/account/
git commit -m "feat: add account layout and profile page"
```

---

### Task 12: Addresses page

**Files:**
- Create: `app/account/addresses/page.tsx`

- [ ] **Step 1: Create `app/account/addresses/page.tsx`**

```tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { usersApi } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import type { Address } from "@/lib/api/types";

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Address;
  onSave: (data: Omit<Address, "id" | "userId" | "isDefault">, setDefault: boolean) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    addressLine1: initial?.addressLine1 ?? "",
    addressLine2: initial?.addressLine2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    postalCode: initial?.postalCode ?? "",
    country: initial?.country ?? "India",
  });
  const [setDefault, setSetDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSave(form, setDefault);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-line p-5">
      <Input label="Full Name" id="fullName" required value={form.fullName} onChange={set("fullName")} />
      <Input label="Phone" id="phone" required value={form.phone} onChange={set("phone")} />
      <Input label="Address Line 1" id="addressLine1" required value={form.addressLine1} onChange={set("addressLine1")} />
      <Input label="Address Line 2 (optional)" id="addressLine2" value={form.addressLine2} onChange={set("addressLine2")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" id="city" required value={form.city} onChange={set("city")} />
        <Input label="State" id="state" required value={form.state} onChange={set("state")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Postal Code" id="postalCode" required value={form.postalCode} onChange={set("postalCode")} />
        <Input label="Country" id="country" required value={form.country} onChange={set("country")} />
      </div>
      {!initial?.isDefault && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={setDefault} onChange={(e) => setSetDefault(e.target.checked)} className="accent-foreground" />
          Set as default
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{initial ? "Update" : "Add Address"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setAddresses(await usersApi.listAddresses()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function handleAdd(data: Parameters<typeof usersApi.addAddress>[0], setDefault: boolean) {
    await usersApi.addAddress({ ...data, isDefault: setDefault });
    await reload();
    setEditing(null);
  }

  async function handleUpdate(id: string, data: Parameters<typeof usersApi.updateAddress>[1]) {
    await usersApi.updateAddress(id, data);
    await reload();
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    await usersApi.deleteAddress(id);
    await reload();
  }

  async function handleSetDefault(id: string) {
    await usersApi.setDefaultAddress(id);
    await reload();
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-mute">Addresses</h2>
        {editing !== "new" && (
          <Button variant="secondary" onClick={() => setEditing("new")}>+ Add New</Button>
        )}
      </div>

      {editing === "new" && (
        <AddressForm
          onSave={(data, setDefault) => handleAdd(data, setDefault)}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="flex flex-col gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border border-line p-5">
            {editing === addr.id ? (
              <AddressForm
                initial={addr}
                onSave={(data) => handleUpdate(addr.id, data)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{addr.fullName}</p>
                    <p className="text-mute">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                    <p className="text-mute">{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="text-mute">{addr.country}</p>
                    <p className="text-mute">{addr.phone}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[11px] uppercase tracking-wider text-mute">Default</span>
                  )}
                </div>
                <div className="mt-4 flex gap-4 text-[12px]">
                  <button onClick={() => setEditing(addr.id)} className="text-mute underline-offset-2 hover:underline">Edit</button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-mute underline-offset-2 hover:underline">Set Default</button>
                  )}
                  <button onClick={() => handleDelete(addr.id)} className="text-red-500 underline-offset-2 hover:underline">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/account/addresses/
git commit -m "feat: add addresses management page"
```

---

### Task 13: Orders list page

**Files:**
- Create: `app/account/orders/page.tsx`

- [ ] **Step 1: Create `app/account/orders/page.tsx`**

```tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { Order, OrderStatus } from "@/lib/api/types";

function statusVariant(status: OrderStatus) {
  const map: Record<OrderStatus, "default" | "success" | "warning" | "error" | "info"> = {
    PENDING_PAYMENT: "warning",
    PAYMENT_FAILED: "error",
    CONFIRMED: "info",
    PROCESSING: "info",
    SHIPPED: "info",
    DELIVERED: "success",
    CANCELLED: "error",
    REFUNDED: "default",
  };
  return map[status] ?? "default";
}

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await ordersApi.list({ page: p, limit: 10 });
      setOrders(result.data);
      setTotalPages(result.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(page); }, [load, page]);

  if (loading && orders.length === 0) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }

  if (orders.length === 0) {
    return <p className="text-sm text-mute">You haven&apos;t placed any orders yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[11px] uppercase tracking-[0.2em] text-mute">Orders</h2>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="flex items-center justify-between border border-line p-5 transition-colors hover:bg-stone/20"
          >
            <div>
              <p className="text-sm font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className="mt-1 text-[12px] text-mute">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={statusVariant(order.status)}>
                {order.status.replace(/_/g, " ")}
              </Badge>
              <p className="text-sm tabular-nums">{formatInr(order.total)}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="border border-line px-4 py-2 text-[13px] hover:bg-stone/30 disabled:opacity-40">Previous</button>
          <span className="text-[13px] text-mute">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="border border-line px-4 py-2 text-[13px] hover:bg-stone/30 disabled:opacity-40">Next</button>
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
git add app/account/orders/page.tsx
git commit -m "feat: add orders list page"
```

---

### Task 14: Order detail page

**Files:**
- Create: `app/account/orders/[id]/page.tsx`

- [ ] **Step 1: Create `app/account/orders/[id]/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ordersApi } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { Order, OrderStatus } from "@/lib/api/types";

function statusVariant(status: OrderStatus) {
  const map: Record<OrderStatus, "default" | "success" | "warning" | "error" | "info"> = {
    PENDING_PAYMENT: "warning",
    PAYMENT_FAILED: "error",
    CONFIRMED: "info",
    PROCESSING: "info",
    SHIPPED: "info",
    DELIVERED: "success",
    CANCELLED: "error",
    REFUNDED: "default",
  };
  return map[status] ?? "default";
}

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getById(params.id)
      .then(setOrder)
      .catch(() => notFound())
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (!order) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-mute">Order Details</h2>
          <p className="mt-1 text-sm font-medium">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-[12px] text-mute">{new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Badge variant={statusVariant(order.status)}>{order.status.replace(/_/g, " ")}</Badge>
      </div>

      {/* Items */}
      <section>
        <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-mute">Items</h3>
        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <Link href={`/products/${item.product.slug}`} className="shrink-0">
                <div className="relative h-20 w-14 overflow-hidden bg-stone">
                  {item.product.images[0] && (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
                  )}
                </div>
              </Link>
              <div className="flex flex-1 items-start justify-between text-sm">
                <div>
                  <p className="font-normal">{item.product.name}</p>
                  <p className="text-[12px] text-mute">{item.product.size} · Qty {item.quantity}</p>
                </div>
                <p className="tabular-nums">{formatInr(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Totals */}
      <section className="border-t border-line pt-5">
        <div className="flex flex-col gap-2 text-sm max-w-xs">
          <div className="flex justify-between"><span className="text-mute">Subtotal</span><span className="tabular-nums">{formatInr(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-mute">Discount</span><span className="tabular-nums text-green-600">−{formatInr(order.discount)}</span></div>}
          <div className="flex justify-between font-medium border-t border-line pt-2"><span>Total</span><span className="tabular-nums">{formatInr(order.total)}</span></div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Delivery Address</h3>
        <div className="text-sm text-mute">
          <p className="font-medium text-foreground">{order.address.fullName}</p>
          <p>{order.address.addressLine1}{order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}</p>
          <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
          <p>{order.address.country}</p>
        </div>
      </section>

      {/* Status history */}
      <section>
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Status History</h3>
        <div className="flex flex-col gap-2">
          {order.statusHistory.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-stone-deep" />
              <div>
                <p>{entry.status.replace(/_/g, " ")}</p>
                <p className="text-[12px] text-mute">{new Date(entry.updatedAt).toLocaleString("en-IN")}</p>
                {entry.note && <p className="text-[12px] text-mute">{entry.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/account/orders/[id]/"
git commit -m "feat: add order detail page"
```

---

### Task 15: Checkout page with Razorpay

**Files:**
- Create: `app/checkout/page.tsx`

- [ ] **Step 1: Create `app/checkout/page.tsx`**

```tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/components/providers";
import { usersApi } from "@/lib/api/users";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import { couponsApi } from "@/lib/api/coupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import type { Address, Order } from "@/lib/api/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, reload: reloadCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAddresses = useCallback(async () => {
    try {
      const data = await usersApi.listAddresses();
      setAddresses(data);
      const def = data.find((a) => a.isDefault) ?? data[0];
      if (def) setSelectedAddressId(def.id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAddresses(); }, [loadAddresses]);

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setCouponError(""); setCouponLoading(true);
    try {
      const result = await couponsApi.validate(couponCode, cart?.total ?? 0);
      if (result.valid) {
        setCouponDiscount(result.discount);
      } else {
        setCouponError("Invalid or expired coupon.");
        setCouponDiscount(0);
      }
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : "Could not validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handlePayNow() {
    if (!selectedAddressId) { setError("Please select a delivery address."); return; }
    setError(""); setCheckoutLoading(true);

    let order: Order;
    try {
      order = await ordersApi.create({
        addressId: selectedAddressId,
        couponCode: couponCode.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create order.");
      setCheckoutLoading(false);
      return;
    }

    if (!order.razorpayOrderId) {
      setCheckoutLoading(false);
      router.push(`/account/orders/${order.id}`);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.total * 100,
      currency: "INR",
      name: "ReVogue",
      order_id: order.razorpayOrderId,
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          await paymentsApi.verify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          await reloadCart();
          router.push(`/account/orders/${order.id}`);
        } catch {
          setError("Payment verification failed. Please contact support.");
          setCheckoutLoading(false);
        }
      },
      modal: {
        ondismiss: () => setCheckoutLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  const subtotal = cart?.total ?? 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <h1 className="mb-10 text-[11px] font-medium uppercase tracking-[0.28em]">Checkout</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-8">
            {/* Address */}
            <section>
              <h2 className="mb-5 text-[11px] uppercase tracking-[0.2em] text-mute">Delivery Address</h2>
              {addresses.length === 0 ? (
                <p className="text-sm text-mute">
                  No addresses saved.{" "}
                  <a href="/account/addresses" className="underline">Add one</a>.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex cursor-pointer gap-4 border p-4 transition-colors ${selectedAddressId === addr.id ? "border-foreground" : "border-line"}`}>
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 accent-foreground"
                      />
                      <div className="text-sm">
                        <p className="font-medium">{addr.fullName}</p>
                        <p className="text-mute">{addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-mute">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Coupon */}
            <section>
              <h2 className="mb-5 text-[11px] uppercase tracking-[0.2em] text-mute">Coupon Code</h2>
              <div className="flex gap-3">
                <Input
                  id="coupon"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponDiscount(0); setCouponError(""); }}
                  className="flex-1"
                />
                <Button variant="secondary" onClick={validateCoupon} loading={couponLoading}>Apply</Button>
              </div>
              {couponDiscount > 0 && <p className="mt-2 text-sm text-green-600">Coupon applied — {formatInr(couponDiscount)} off!</p>}
              {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
            </section>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4 border border-line p-6 self-start">
            <p className="text-[11px] uppercase tracking-[0.2em]">Order Summary</p>
            {cart?.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-mute truncate mr-2">{item.product.name}</span>
                <span className="tabular-nums shrink-0">{formatInr(item.product.sellingPrice)}</span>
              </div>
            ))}
            <hr className="border-line" />
            <div className="flex justify-between text-sm">
              <span className="text-mute">Subtotal</span>
              <span className="tabular-nums">{formatInr(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-mute">Discount</span>
                <span className="tabular-nums text-green-600">−{formatInr(couponDiscount)}</span>
              </div>
            )}
            <hr className="border-line" />
            <div className="flex justify-between text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatInr(finalTotal)}</span>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button onClick={handlePayNow} loading={checkoutLoading} className="w-full mt-2">
              Pay {formatInr(finalTotal)}
            </Button>

            <p className="text-center text-[11px] text-mute">Secured by Razorpay</p>
          </div>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` to `.env.example`**

Open `revogueweb/.env.example` and add:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
```

- [ ] **Step 3: Verify TypeScript**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/checkout/ .env.example
git commit -m "feat: add checkout page with Razorpay payment flow"
```

---

### Task 16: Final verification

- [ ] **Step 1: Full TypeScript check**

Run: `cd revogueweb && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 2: Dev server end-to-end smoke test**

Run: `cd revogueweb && npm run dev`

Test these flows in order:
1. `http://localhost:3001/products` — product grid with filters loads
2. Click a product — detail page shows, Add to Bag + wishlist buttons visible
3. `http://localhost:3001/login` — form submits, redirects to `/account`
4. `http://localhost:3001/register` — form submits, redirects to `/account`
5. `http://localhost:3001/cart` — shows cart items with quantity controls
6. `http://localhost:3001/wishlist` — shows wishlist items
7. `http://localhost:3001/account` — profile form + change password
8. `http://localhost:3001/account/addresses` — add/edit/delete addresses
9. `http://localhost:3001/account/orders` — order list
10. `http://localhost:3001/checkout` — address selector + coupon + pay button

---

**Plan 2 complete.** Proceed to Plan 3 (`2026-10-07-plan3-admin.md`) for the admin panel.
