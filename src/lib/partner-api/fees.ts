import type { PaymentMethod, PaymentMethodFeeTier } from "./types";

function toNumber(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Pick the active fee tier for an `amount` using `amount_priority`.
 *
 * Tiers are sorted ascending by `amount_priority`. The selected tier is the
 * first whose priority is strictly greater than `amount`. When none qualifies
 * (the amount exceeds every priority) we fall back to the highest-priority
 * tier — which is why a sole `amount_priority: 0` row acts as a "default" tier
 * (matches how QRIS-style methods publish a single row).
 *
 * Example tiers `[{p:0}, {p:100}, {p:200}]`:
 *   amount=70  → first row where 70 < p  → p=100
 *   amount=170 → first row where 170 < p → p=200
 *   amount=250 → no row matches          → p=200 (highest)
 */
export function selectPaymentFeeTier(
  tiers: readonly PaymentMethodFeeTier[] | null | undefined,
  amount: number,
): PaymentMethodFeeTier | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.amount_priority - b.amount_priority);
  const hit = sorted.find((t) => amount < t.amount_priority);
  return hit ?? sorted[sorted.length - 1] ?? null;
}

/**
 * Compute the payment fee for an `amount` using the tier's two components:
 *
 *   fee = fixed_fee + (amount + fixed_fee) × fixed_rate%
 *
 * `fixed_fee` is a flat per-transaction charge; `fixed_rate` is the percentage
 * as published by the API (e.g. `"1.62"` → 1.62%) applied to the grossed-up
 * base. Result is rounded to whole rupiah.
 */
export function calculatePaymentFee(
  method: Pick<PaymentMethod, "payment_method_fee"> | null | undefined,
  amount: number,
): number {
  const tier = selectPaymentFeeTier(method?.payment_method_fee, amount);
  if (!tier) return 0;
  const fixedFee = toNumber(tier.fixed_fee);
  const fixedRate = toNumber(tier.fixed_rate);
  return Math.round(fixedFee + (amount + fixedFee) * (fixedRate / 100));
}
