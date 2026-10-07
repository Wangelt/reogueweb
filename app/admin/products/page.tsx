"use client";
import { useCallback, useEffect, useState } from "react";
import { adminProductsApi } from "@/lib/api/admin/products";
import { categoriesApi } from "@/lib/api/categories";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/errors";
import type { Product, Category, Gender, ProductCondition } from "@/lib/api/types";

const GENDERS: Gender[] = ["WOMEN", "MEN", "UNISEX", "KIDS"];
const CONDITIONS: ProductCondition[] = ["NEW_WITH_TAGS", "EXCELLENT", "GOOD", "FAIR"];

const COLUMNS: Column<Product>[] = [
  { key: "name", header: "Name" },
  { key: "brand", header: "Brand" },
  { key: "sku", header: "SKU" },
  { key: "sellingPrice", header: "Price", render: (p) => `₹${p.sellingPrice}` },
  { key: "status", header: "Status" },
  { key: "inStock", header: "Stock", render: (p) => (p.inStock ? "In Stock" : "Out") },
];

type FormData = {
  name: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  gender: Gender;
  size: string;
  color: string;
  material: string;
  condition: ProductCondition;
  conditionDescription: string;
  originalPrice: string;
  sellingPrice: string;
  sku: string;
  featured: boolean;
};

const EMPTY_FORM: FormData = {
  name: "", description: "", brand: "", category: "", subcategory: "",
  gender: "WOMEN", size: "", color: "", material: "", condition: "GOOD",
  conditionDescription: "", originalPrice: "", sellingPrice: "", sku: "", featured: false,
};

function productToForm(p: Product): FormData {
  return {
    name: p.name,
    description: p.description,
    brand: p.brand,
    category: typeof p.category === "string" ? p.category : p.category.id,
    subcategory: p.subcategory ? (typeof p.subcategory === "string" ? p.subcategory : p.subcategory.id) : "",
    gender: p.gender,
    size: p.size,
    color: p.color,
    material: p.material ?? "",
    condition: p.condition,
    conditionDescription: p.conditionDescription ?? "",
    originalPrice: String(p.originalPrice),
    sellingPrice: String(p.sellingPrice),
    sku: p.sku,
    featured: p.featured,
  };
}

function ProductForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial?: Product;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormData>(initial ? productToForm(initial) : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        brand: form.brand,
        category: form.category,
        subcategory: form.subcategory || undefined,
        gender: form.gender,
        size: form.size,
        color: form.color,
        material: form.material || undefined,
        condition: form.condition,
        conditionDescription: form.conditionDescription || undefined,
        originalPrice: Number(form.originalPrice),
        sellingPrice: Number(form.sellingPrice),
        sku: form.sku,
        featured: form.featured,
      };
      if (initial) {
        await adminProductsApi.update(initial.id, payload);
      } else {
        await adminProductsApi.create(payload);
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
        <Input label="Brand" id="brand" required value={form.brand} onChange={set("brand")} />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-[0.15em] text-mute mb-1">Description</label>
        <textarea
          required
          value={form.description}
          onChange={set("description")}
          rows={3}
          className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-mute mb-1">Category</label>
          <select required value={form.category} onChange={set("category")} className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground">
            <option value="">Select…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-mute mb-1">Gender</label>
          <select value={form.gender} onChange={set("gender")} className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground">
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Size" id="size" required value={form.size} onChange={set("size")} />
        <Input label="Color" id="color" required value={form.color} onChange={set("color")} />
        <Input label="Material" id="material" value={form.material} onChange={set("material")} />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-[0.15em] text-mute mb-1">Condition</label>
        <select value={form.condition} onChange={set("condition")} className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground">
          {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Original Price" id="originalPrice" type="number" required value={form.originalPrice} onChange={set("originalPrice")} />
        <Input label="Selling Price" id="sellingPrice" type="number" required value={form.sellingPrice} onChange={set("sellingPrice")} />
        <Input label="SKU" id="sku" required value={form.sku} onChange={set("sku")} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} className="accent-foreground" />
        Featured
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{initial ? "Update" : "Create"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const result = await adminProductsApi.list({ page: p, limit: 20, search: q || undefined });
      setProducts(result.data);
      setTotalPages(result.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const cats = await categoriesApi.list();
    setCategories(cats);
  }, []);

  useEffect(() => { void load(page, search); }, [load, page, search]);
  useEffect(() => { void loadCategories(); }, [loadCategories]);

  async function handleStatusAction(product: Product, action: "publish" | "archive" | "delete") {
    try {
      if (action === "publish") await adminProductsApi.publish(product.id);
      else if (action === "archive") await adminProductsApi.archive(product.id);
      else if (action === "delete") {
        if (!confirm(`Delete "${product.name}"?`)) return;
        await adminProductsApi.delete(product.id);
      }
      void load(page, search);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Action failed.");
    }
  }

  const columns: Column<Product>[] = [
    ...COLUMNS,
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex gap-3 text-[12px]">
          <button onClick={() => setEditing(p)} className="text-mute underline-offset-2 hover:underline">Edit</button>
          {p.status === "DRAFT" && (
            <button onClick={() => handleStatusAction(p, "publish")} className="text-mute underline-offset-2 hover:underline">Publish</button>
          )}
          {p.status === "PUBLISHED" && (
            <button onClick={() => handleStatusAction(p, "archive")} className="text-mute underline-offset-2 hover:underline">Archive</button>
          )}
          <button onClick={() => handleStatusAction(p, "delete")} className="text-red-500 underline-offset-2 hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[11px] uppercase tracking-[0.28em]">Products</h1>
        {editing !== "new" && (
          <Button variant="secondary" onClick={() => setEditing("new")}>+ Add Product</Button>
        )}
      </div>

      <Input
        id="search"
        placeholder="Search products…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {editing === "new" && (
        <ProductForm
          categories={categories}
          onSave={() => { setEditing(null); void load(page, search); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {editing && editing !== "new" && (
        <ProductForm
          initial={editing}
          categories={categories}
          onSave={() => { setEditing(null); void load(page, search); }}
          onCancel={() => setEditing(null)}
        />
      )}

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products found."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
