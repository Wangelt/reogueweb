import { productsApi } from "@/lib/api/products";
import { ApiError } from "@/lib/api/errors";
import { HomeContent } from "@/components/home-content";
import type { HomeProduct } from "@/lib/catalog/home-products";
import type { Product, ProductCondition } from "@/lib/api/types";

const CONDITION_LABEL: Record<ProductCondition, string> = {
  LIKE_NEW: "Very good",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
};

function toHomeProduct(p: Product): HomeProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    size: p.size,
    condition: CONDITION_LABEL[p.condition],
    priceInr: p.sellingPrice,
    imageSrc: p.images[0]?.url,
  };
}

export default async function Home() {
  const result = await productsApi
    .list({ limit: 20, sort: "newest" })
    .catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 429) return null;
      throw error;
    });

  return (
    <HomeContent
      products={result?.data.map(toHomeProduct) ?? []}
      productsRateLimited={!result}
    />
  );
}
