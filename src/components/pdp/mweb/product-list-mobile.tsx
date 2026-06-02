"use client";

import {
  ProductListDesktop,
  type ProductListViewProps,
} from "@/components/pdp/dweb/product-list-desktop";

/**
 * Mobile (mweb) product list view — STUB.
 *
 * The product grid lives in an embedded iframe and the desktop shell is already
 * fluid, so we delegate to it for now. Build the mobile-first shell here — e.g.
 * a full-bleed iframe with a larger touch target on the `FloatingPurchaseBar`,
 * or a native (non-iframe) mobile grid — then drop the delegation.
 */
export function ProductListMobile(props: ProductListViewProps) {
  return <ProductListDesktop {...props} />;
}
