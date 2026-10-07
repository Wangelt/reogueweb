"use client";
import { useCallback, useEffect, useState } from "react";
import { usersApi } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";
import type { Address } from "@/lib/api/types";

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Address;
  onSave: (data: Omit<Address, "id" | "userId" | "isDefault">, setDefault: boolean) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    addressLine1: initial?.addressLine1 ?? "",
    addressLine2: initial?.addressLine2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    postalCode: initial?.postalCode ?? "",
    country: initial?.country ?? "India",
  });
  const [setDefault, setSetDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSave(form, setDefault);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-line p-5">
      <Input label="Full Name" id="fullName" required value={form.fullName} onChange={set("fullName")} />
      <Input label="Phone" id="phone" required value={form.phone} onChange={set("phone")} />
      <Input label="Address Line 1" id="addressLine1" required value={form.addressLine1} onChange={set("addressLine1")} />
      <Input label="Address Line 2 (optional)" id="addressLine2" value={form.addressLine2} onChange={set("addressLine2")} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" id="city" required value={form.city} onChange={set("city")} />
        <Input label="State" id="state" required value={form.state} onChange={set("state")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Postal Code" id="postalCode" required value={form.postalCode} onChange={set("postalCode")} />
        <Input label="Country" id="country" required value={form.country} onChange={set("country")} />
      </div>
      {!initial?.isDefault && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={setDefault} onChange={(e) => setSetDefault(e.target.checked)} className="accent-foreground" />
          Set as default
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{initial ? "Update" : "Add Address"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setAddresses(await usersApi.listAddresses()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function handleAdd(data: Parameters<typeof usersApi.addAddress>[0], setDefault: boolean) {
    await usersApi.addAddress({ ...data, isDefault: setDefault });
    await reload();
    setEditing(null);
  }

  async function handleUpdate(id: string, data: Parameters<typeof usersApi.updateAddress>[1]) {
    await usersApi.updateAddress(id, data);
    await reload();
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    await usersApi.deleteAddress(id);
    await reload();
  }

  async function handleSetDefault(id: string) {
    await usersApi.setDefaultAddress(id);
    await reload();
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-mute">Addresses</h2>
        {editing !== "new" && (
          <Button variant="secondary" onClick={() => setEditing("new")}>+ Add New</Button>
        )}
      </div>

      {editing === "new" && (
        <AddressForm
          onSave={(data, setDefault) => handleAdd(data, setDefault)}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="flex flex-col gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border border-line p-5">
            {editing === addr.id ? (
              <AddressForm
                initial={addr}
                onSave={(data) => handleUpdate(addr.id, data)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{addr.fullName}</p>
                    <p className="text-mute">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                    <p className="text-mute">{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="text-mute">{addr.country}</p>
                    <p className="text-mute">{addr.phone}</p>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[11px] uppercase tracking-wider text-mute">Default</span>
                  )}
                </div>
                <div className="mt-4 flex gap-4 text-[12px]">
                  <button onClick={() => setEditing(addr.id)} className="text-mute underline-offset-2 hover:underline">Edit</button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-mute underline-offset-2 hover:underline">Set Default</button>
                  )}
                  <button onClick={() => handleDelete(addr.id)} className="text-red-500 underline-offset-2 hover:underline">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
