"use client";
import { useCallback, useEffect, useState } from "react";
import { adminOrdersApi } from "@/lib/api/admin/orders";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import type { Order, OrderStatus } from "@/lib/api/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING_PAYMENT", "PAYMENT_FAILED", "CONFIRMED", "PROCESSING",
  "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
];

function statusVariant(status: OrderStatus): "default" | "success" | "warning" | "error" | "info" {
  const map: Record<OrderStatus, "default" | "success" | "warning" | "error" | "info"> = {
    PENDING_PAYMENT: "warning", PAYMENT_FAILED: "error", CONFIRMED: "info",
    PROCESSING: "info", SHIPPED: "info", DELIVERED: "success",
    CANCELLED: "error", REFUNDED: "default",
  };
  return map[status] ?? "default";
}

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function StatusUpdater({ order, onUpdated }: { order: Order; onUpdated: () => void }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate() {
    setError(""); setLoading(true);
    try {
      await adminOrdersApi.updateStatus(order.id, { status, note: note || undefined });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="border border-line bg-transparent px-2 py-1 text-[12px] focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 border border-line bg-transparent px-2 py-1 text-[12px] focus:outline-none"
        />
        <Button variant="secondary" onClick={handleUpdate} loading={loading}>Update</Button>
      </div>
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await adminOrdersApi.list({ page: p, limit: 20 });
      setOrders(result.data);
      setTotalPages(result.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(page); }, [load, page]);

  const columns: Column<Order>[] = [
    { key: "id", header: "Order", render: (o) => `#${o.id.slice(-8).toUpperCase()}` },
    { key: "createdAt", header: "Date", render: (o) => new Date(o.createdAt).toLocaleDateString("en-IN") },
    { key: "total", header: "Total", render: (o) => formatInr(o.total) },
    { key: "status", header: "Status", render: (o) => <Badge variant={statusVariant(o.status)}>{o.status.replace(/_/g, " ")}</Badge> },
    {
      key: "actions",
      header: "Actions",
      render: (o) => (
        <button
          onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
          className="text-[12px] text-mute underline-offset-2 hover:underline"
        >
          {expandedId === o.id ? "Close" : "Update Status"}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[11px] uppercase tracking-[0.28em]">Orders</h1>
      <div className="flex flex-col gap-0">
        {orders.length === 0 && !loading && (
          <p className="text-sm text-mute">No orders found.</p>
        )}
        {orders.map((order) => (
          <div key={order.id} className="border-b border-line">
            <div className="grid grid-cols-[1fr_120px_120px_160px_120px] items-center gap-4 px-4 py-3 text-sm">
              <span>#{order.id.slice(-8).toUpperCase()}</span>
              <span className="text-mute">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              <span className="tabular-nums">{formatInr(order.total)}</span>
              <Badge variant={statusVariant(order.status)}>{order.status.replace(/_/g, " ")}</Badge>
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="text-[12px] text-mute underline-offset-2 hover:underline text-left"
              >
                {expandedId === order.id ? "Close" : "Update Status"}
              </button>
            </div>
            {expandedId === order.id && (
              <div className="border-t border-line bg-stone/10 px-4 py-3">
                <StatusUpdater order={order} onUpdated={() => { void load(page); setExpandedId(null); }} />
              </div>
            )}
          </div>
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
