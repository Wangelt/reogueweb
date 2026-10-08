import { Suspense } from "react";
import { productsApi } from "@/lib/api/products";
import { ApiError } from "@/lib/api/errors";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import type { ProductFilters as Filters } from "@/lib/api/types";

export const metadata = { title: "Shop" };

async function ProductResults({ filters }: { filters: Filters }) {
  const result = await productsApi.list(filters).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 429) return null;
    throw error;
  });

  if (!result) {
    return (
      <p role="alert" className="py-16 text-center text-sm text-mute">
        The shop is receiving too many requests right now. Please wait a moment
        and refresh the page.
      </p>
    );
  }

  return <ProductGrid products={result.data} />;
}


export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const condition =
    typeof sp.condition === "string" ? sp.condition : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : undefined;

  const filters: Filters = {
    page: sp.page ? Number(sp.page) : 1,
    limit: 24,
    category: typeof sp.category === "string" ? sp.category : undefined,
    gender: typeof sp.gender === "string" ? sp.gender : undefined,
    size: typeof sp.size === "string" ? sp.size : undefined,
    condition:
      condition === "NEW_WITH_TAGS" ? "LIKE_NEW" : condition,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
    sort:
      sort === "price_asc"
        ? "priceAsc"
        : sort === "price_desc"
          ? "priceDesc"
          : sort,
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
