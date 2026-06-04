import type { Product, ProductWholesaleTier } from "./types";

function toNumber(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export type WholesalePrice = {
  unitPrice: number;
  tier: ProductWholesaleTier | null;
};


export function resolveWholesalePrice(
  product: Pick<Product, "price" | "wholesale">,
  quantity: number,
): WholesalePrice {
  const base = toNumber(product.price);
  const tiers = (product.wholesale ?? [])
    .filter((t) => t && toNumber(t.minimum_order) > 0)
    .sort((a, b) => toNumber(a.minimum_order) - toNumber(b.minimum_order));

  let tier: ProductWholesaleTier | null = null;
  for (const t of tiers) {
    if (quantity >= toNumber(t.minimum_order)) tier = t;
  }

  return { unitPrice: tier ? toNumber(tier.price) : base, tier };
}
