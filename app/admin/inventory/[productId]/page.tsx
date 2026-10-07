"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminInventoryApi } from "@/lib/api/admin/inventory";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import type { Inventory, InventoryMovement } from "@/lib/api/types";

const MOVEMENT_COLUMNS: Column<InventoryMovement>[] = [
  { key: "type", header: "Type" },
  { key: "delta", header: "Delta", render: (m) => (m.delta > 0 ? `+${m.delta}` : String(m.delta)) },
  { key: "reason", header: "Reason" },
  { key: "createdAt", header: "Date", render: (m) => new Date(m.createdAt).toLocaleString("en-IN") },
];

export default function AdminInventoryPage() {
  const params = useParams<{ productId: string }>();
  const { productId } = params;

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [movPage, setMovPage] = useState(1);
  const [movTotalPages, setMovTotalPages] = useState(1);

  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  const loadInventory = useCallback(async () => {
    try {
      const inv = await adminInventoryApi.get(productId);
      setInventory(inv);
    } catch {
      setInventory(null);
    }
  }, [productId]);

  const loadMovements = useCallback(async (p: number) => {
    try {
      const result = await adminInventoryApi.listMovements(productId, { page: p, limit: 10 });
      setMovements(result.data);
      setMovTotalPages(result.pagination.totalPages);
    } catch {
      setMovements([]);
    }
  }, [productId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadInventory(), loadMovements(movPage)]);
    setLoading(false);
  }, [loadInventory, loadMovements, movPage]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  async function handleInit() {
    setAdjustError(""); setAdjusting(true);
    try {
      await adminInventoryApi.init(productId, { quantity: Number(delta) || 0, reason: reason || undefined });
      setDelta(""); setReason("");
      void loadAll();
    } catch (err) {
      setAdjustError(err instanceof ApiError ? err.message : "Failed.");
    } finally {
      setAdjusting(false);
    }
  }

  async function handleAdjust() {
    if (!delta) return;
    setAdjustError(""); setAdjusting(true);
    try {
      await adminInventoryApi.adjust(productId, { delta: Number(delta), reason: reason || undefined });
      setDelta(""); setReason("");
      void loadAll();
    } catch (err) {
      setAdjustError(err instanceof ApiError ? err.message : "Failed.");
    } finally {
      setAdjusting(false);
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-[11px] uppercase tracking-[0.28em]">Inventory — {productId}</h1>

      {inventory ? (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="border border-line p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-mute">Total</p>
            <p className="mt-2 text-xl tabular-nums font-medium">{inventory.quantity}</p>
          </div>
          <div className="border border-line p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-mute">Reserved</p>
            <p className="mt-2 text-xl tabular-nums font-medium">{inventory.reservedQuantity}</p>
          </div>
          <div className="border border-line p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-mute">Available</p>
            <p className="mt-2 text-xl tabular-nums font-medium">{inventory.availableQuantity}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-mute">No inventory record found. Initialize below.</p>
      )}

      <section>
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-mute">
          {inventory ? "Adjust Inventory" : "Initialize Inventory"}
        </h2>
        <div className="flex gap-3 items-end">
          <div className="w-28">
            <Input
              label={inventory ? "Delta" : "Quantity"}
              id="delta"
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder={inventory ? "+5 or -2" : "0"}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Reason (optional)"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={inventory ? handleAdjust : handleInit}
            loading={adjusting}
          >
            {inventory ? "Adjust" : "Initialize"}
          </Button>
        </div>
        {adjustError && <p className="mt-2 text-sm text-red-600">{adjustError}</p>}
      </section>

      <section>
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-mute">Movement History</h2>
        <DataTable
          columns={MOVEMENT_COLUMNS}
          data={movements}
          emptyMessage="No movements yet."
          page={movPage}
          totalPages={movTotalPages}
          onPageChange={(p) => { setMovPage(p); void loadMovements(p); }}
        />
      </section>
    </div>
  );
}
