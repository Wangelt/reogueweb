"use client";
import { useCallback, useEffect, useState } from "react";
import { adminCategoriesApi } from "@/lib/api/admin/categories";
import { categoriesApi } from "@/lib/api/categories";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";
import type { Category } from "@/lib/api/types";

const COLUMNS: Column<Category>[] = [
  { key: "name", header: "Name" },
  { key: "slug", header: "Slug" },
  { key: "sortOrder", header: "Sort Order" },
  { key: "isActive", header: "Active", render: (c) => (c.isActive ? "Yes" : "No") },
];

type FormData = { name: string; slug: string; description: string; parent: string; sortOrder: string; isActive: boolean };
const EMPTY: FormData = { name: "", slug: "", description: "", parent: "", sortOrder: "0", isActive: true };

function categoryToForm(c: Category): FormData {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    parent: c.parent ? (typeof c.parent === "string" ? c.parent : c.parent.id) : "",
    sortOrder: String(c.sortOrder),
    isActive: c.isActive,
  };
}

function CategoryForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial?: Category;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormData>(initial ? categoryToForm(initial) : EMPTY);
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
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        parent: form.parent || undefined,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      };
      if (initial) {
        await adminCategoriesApi.update(initial.id, payload);
      } else {
        await adminCategoriesApi.create(payload);
      }
      onSave();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-line p-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name" id="name" required value={form.name} onChange={set("name")} />
        <Input label="Slug" id="slug" required value={form.slug} onChange={set("slug")} />
      </div>
      <Input label="Description" id="description" value={form.description} onChange={set("description")} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-mute mb-1">Parent Category</label>
          <select value={form.parent} onChange={set("parent")} className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground">
            <option value="">None (top-level)</option>
            {categories.filter((c) => c.id !== initial?.id).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Input label="Sort Order" id="sortOrder" type="number" value={form.sortOrder} onChange={set("sortOrder")} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="accent-foreground" />
        Active
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{initial ? "Update" : "Create"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCategories(await categoriesApi.list()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"?`)) return;
    try {
      await adminCategoriesApi.delete(category.id);
      void load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  const columns: Column<Category>[] = [
    ...COLUMNS,
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex gap-3 text-[12px]">
          <button onClick={() => setEditing(c)} className="text-mute underline-offset-2 hover:underline">Edit</button>
          <button onClick={() => handleDelete(c)} className="text-red-500 underline-offset-2 hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[11px] uppercase tracking-[0.28em]">Categories</h1>
        {editing !== "new" && (
          <Button variant="secondary" onClick={() => setEditing("new")}>+ Add Category</Button>
        )}
      </div>

      {editing === "new" && (
        <CategoryForm
          categories={categories}
          onSave={() => { setEditing(null); void load(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {editing && editing !== "new" && (
        <CategoryForm
          initial={editing}
          categories={categories}
          onSave={() => { setEditing(null); void load(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories found."
      />
    </div>
  );
}
