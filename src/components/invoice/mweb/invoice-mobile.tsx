"use client";

import { InvoiceDesktop, type InvoiceViewProps } from "@/components/invoice/dweb/invoice-desktop";

/**
 * Mobile (mweb) invoice view — STUB.
 *
 * Delegates to the desktop view for now. Build the mobile experience here — the
 * desktop layout places the live `ChatPanel` beside the status cards, which on a
 * phone is better as a collapsible/bottom-sheet panel below the order details.
 */
export function InvoiceMobile(props: InvoiceViewProps) {
  return <InvoiceDesktop {...props} />;
}
