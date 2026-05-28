export function formatPriceIDR(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "";
  return `Rp${Math.round(num).toLocaleString("id-ID")}`;
}

export function formatSoldCount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "0 sold";
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "0 sold";
  return `${num.toLocaleString("en-US")} sold`;
}

export function computeDiscountPct(
  price: number | string | null | undefined,
  original: number | string | null | undefined,
): number | null {
  const p = typeof price === "string" ? Number(price) : price;
  const o = typeof original === "string" ? Number(original) : original;
  if (!Number.isFinite(p) || !Number.isFinite(o) || !o || (o as number) <= (p as number)) {
    return null;
  }
  return Math.round((1 - (p as number) / (o as number)) * 100);
}
