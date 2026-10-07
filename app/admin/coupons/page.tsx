"use client";
import { useCallback, useEffect, useState } from "react";
import { adminCouponsApi } from "@/lib/api/admin/coupons";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";
import type { Coupon, CouponType } from "@/lib/api/types";

const COUPON_TYPES: CouponType[] = ["PERCENTAGE", "FIXED"];

const COLUMNS: Column<Coupon>[] = [
  { key: "code", header: "Code" },
  { key: "type", header: "Type" },
  { key: "value", header: "Value", render: (c) => c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}` },
  { key: "usageCount", header: "Used" },
  { key: "expiryDate", header: "Expires", render: (c) => new Date(c.expiryDate).toLocaleDateString("en-IN") },
  { key: "isActive", header: "Active", render: (c) => (c.isActive ? "Yes" : "No") },
];

type FormData = {
  code: string;
  description: string;
  type: CouponType;
  value: string;
  minimumOrderAmount: string;
  maximumDiscountAmount: string;
  startDate: string;
  expiryDate: string;
  usageLimit: string;
  perUserLimit: string;
  isActive: boolean;
};

const EMPTY: FormData = {
  code: "", description: "", type: "PERCENTAGE", value: "",
  minimumOrderAmount: "", maximumDiscountAmount: "",
  startDate: "", expiryDate: "", usageLimit: "", perUserLimit: "", isActive: true,
};

function toIsoDate(date: string) {
  return date ? new Date(date).toISOString() : "";
}

function CouponForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await adminCouponsApi.create({
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        value: Number(form.value),
        minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : undefined,
        maximumDiscountAmount: form.maximumDiscountAmount ? Number(form.maximumDiscountAmount) : undefined,
        startDate: toIsoDate(form.startDate),
        expiryDate: toIsoDate(form.expiryDate),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : undefined,
        isActive: form.isActive,
      });
      onSave();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-line p-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Code" id="code" required value={form.code} onChange={set("code")} />
        <Input label="Description" id="description" value={form.description} onChange={set("description")} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-mute mb-1">Type</label>
          <select value={form.type} onChange={set("type")} className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground">
            {COUPON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Input label="Value" id="value" type="number" required value={form.value} onChange={set("value")} />
        <Input label="Min Order Amount" id="minimumOrderAmount" type="number" value={form.minimumOrderAmount} onChange={set("minimumOrderAmount")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" id="startDate" type="date" required value={form.startDate} onChange={set("startDate")} />
        <Input label="Expiry Date" id="expiryDate" type="date" required value={form.expiryDate} onChange={set("expiryDate")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Usage Limit" id="usageLimit" type="number" value={form.usageLimit} onChange={set("usageLimit")} />
        <Input label="Per User Limit" id="perUserLimit" type="number" value={form.perUserLimit} onChange={set("perUserLimit")} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="accent-foreground" />
        Active
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>Create Coupon</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCoupons(await adminCouponsApi.list()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDeactivate(coupon: Coupon) {
    if (!confirm(`Deactivate coupon "${coupon.code}"?`)) return;
    try {
      await adminCouponsApi.deactivate(coupon.id);
      void load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed.");
    }
  }

  const columns: Column<Coupon>[] = [
    ...COLUMNS,
    {
      key: "actions",
      header: "Actions",
      render: (c) =>
        c.isActive ? (
          <button onClick={() => handleDeactivate(c)} className="text-[12px] text-red-500 underline-offset-2 hover:underline">
            Deactivate
          </button>
        ) : (
          <span className="text-[12px] text-mute">Inactive</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[11px] uppercase tracking-[0.28em]">Coupons</h1>
        {!showForm && (
          <Button variant="secondary" onClick={() => setShowForm(true)}>+ Add Coupon</Button>
        )}
      </div>

      {showForm && (
        <CouponForm
          onSave={() => { setShowForm(false); void load(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        emptyMessage="No coupons found."
      />
    </div>
  );
}
