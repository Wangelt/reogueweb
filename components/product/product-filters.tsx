"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const GENDERS = ["WOMEN", "MEN", "UNISEX", "KIDS"];
const CONDITIONS = ["NEW_WITH_TAGS", "EXCELLENT", "GOOD", "FAIR"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const get = (key: string) => searchParams.get(key) ?? "";

  return (
    <aside className="flex flex-col gap-6 text-sm">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Sort</p>
        <select
          value={get("sort")}
          onChange={(e) => setParam("sort", e.target.value)}
          className="w-full border border-line bg-transparent px-3 py-2 text-sm"
        >
          <option value="">Default</option>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Gender</p>
        <div className="flex flex-col gap-2">
          {GENDERS.map((g) => (
            <label key={g} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={get("gender") === g}
                onChange={() => setParam("gender", get("gender") === g ? "" : g)}
                className="accent-foreground"
              />
              <span className="text-[13px] capitalize">{g.toLowerCase()}</span>
            </label>
          ))}
          {get("gender") && (
            <button onClick={() => setParam("gender", "")} className="text-left text-[11px] text-mute underline-offset-2 hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Condition</p>
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                value={c}
                checked={get("condition") === c}
                onChange={() => setParam("condition", get("condition") === c ? "" : c)}
                className="accent-foreground"
              />
              <span className="text-[13px] capitalize">{c.replace(/_/g, " ").toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-mute">Price</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={get("minPrice")}
            onChange={(e) => setParam("minPrice", e.target.value)}
            className="w-full border border-line bg-transparent px-2 py-1.5 text-sm"
          />
          <span className="text-mute">—</span>
          <input
            type="number"
            placeholder="Max"
            value={get("maxPrice")}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className="w-full border border-line bg-transparent px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <button
        onClick={() => router.push(pathname)}
        className="text-left text-[11px] text-mute underline-offset-2 hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
}
