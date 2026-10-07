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
