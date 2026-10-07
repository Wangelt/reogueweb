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
