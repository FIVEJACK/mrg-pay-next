"use client";

import { CheckoutDesktop, type CheckoutViewProps } from "@/components/checkout/dweb/checkout-desktop";

/**
 * Mobile (mweb) checkout view — STUB.
 *
 * The desktop view already collapses to a single column at small widths via its
 * Tailwind breakpoints, so for now we render it to keep mobile traffic working.
 * Build the dedicated mobile experience here (e.g. a sticky bottom checkout bar
 * instead of the right-hand `PaymentDetailSidebar`, step-by-step sections) and
 * drop the desktop delegation when ready. The buyer-state logic should be
 * lifted into a shared `useCheckout()` hook so both views consume it.
 */
export function CheckoutMobile(props: CheckoutViewProps) {
  return <CheckoutDesktop {...props} />;
}
