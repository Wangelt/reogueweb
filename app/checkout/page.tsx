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
