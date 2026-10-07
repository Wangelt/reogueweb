"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ordersApi } from "@/lib/api/orders";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { Order, OrderStatus } from "@/lib/api/types";

function statusVariant(status: OrderStatus): "default" | "success" | "warning" | "error" | "info" {
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

      <section className="border-t border-line pt-5">
        <div className="flex flex-col gap-2 text-sm max-w-xs">
          <div className="flex justify-between"><span className="text-mute">Subtotal</span><span className="tabular-nums">{formatInr(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-mute">Discount</span><span className="tabular-nums text-green-600">−{formatInr(order.discount)}</span></div>}
          <div className="flex justify-between font-medium border-t border-line pt-2"><span>Total</span><span className="tabular-nums">{formatInr(order.total)}</span></div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Delivery Address</h3>
        <div className="text-sm text-mute">
          <p className="font-medium text-foreground">{order.address.fullName}</p>
          <p>{order.address.addressLine1}{order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}</p>
          <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
          <p>{order.address.country}</p>
        </div>
      </section>

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
