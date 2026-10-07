"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
