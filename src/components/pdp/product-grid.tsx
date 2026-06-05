import type { Product } from "@/lib/partner-api";

import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: Product[];
  selectedId?: number;
  onSelect?: (product: Product) => void;
  /** When true, render as 3 columns max (a side panel is taking space). */
  compact?: boolean;
  mobile?: boolean;
};

export function ProductGrid({ products, selectedId, onSelect, compact, mobile }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-(--color-border) py-12 text-sm text-(--color-text-subdued)">
        No products match the current filters.
      </div>
    );
  }
  const colsClass = mobile
    ? "grid grid-cols-2 gap-3"
    : compact
      ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  return (
    <div className={colsClass}>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          selected={p.id === selectedId}
          mobile={mobile}
          onClick={onSelect ? () => onSelect(p) : undefined}
        />
      ))}
    </div>
  );
}
