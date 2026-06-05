"use client";

import type { Product } from "@/lib/partner-api";

/**
 * postMessage protocol between the product-iframe (`/iframe/product`) and the
 * `/product-list` shell that hosts it. Both files import these types/constants
 * so the wire format stays in sync.
 */

export const PRODUCT_SELECTED = "lg:product-selected" as const;
export const PRODUCT_DESELECTED = "lg:product-deselected" as const;
/** Parent → iframe command telling the iframe to clear its selected product. */
export const CLEAR_SELECTION = "lg:clear-selection" as const;

export type ProductSelectedPayload = {
  productId: number;
  productName: string;
  productPrice: number;
  itemInfoName: string | null;
  serverName: string | null;
  itemTypeId: number | null;
  gameId: number | null;
  hashCode: string;
  /** Full product object — used by the mobile ProductDetailSheet to render without a re-fetch. */
  product: Product;
};

export type ProductSelectedMessage = {
  type: typeof PRODUCT_SELECTED;
  payload: ProductSelectedPayload;
};

export type ProductDeselectedMessage = {
  type: typeof PRODUCT_DESELECTED;
};

export type ClearSelectionMessage = {
  type: typeof CLEAR_SELECTION;
};

export type ProductListMessage = ProductSelectedMessage | ProductDeselectedMessage;

/**
 * Type guard for inbound messages. Use this on the parent (`window.message`
 * listener) to filter out unrelated postMessages from extensions, devtools,
 * etc.
 */
export function isProductListMessage(value: unknown): value is ProductListMessage {
  if (typeof value !== "object" || value === null) return false;
  const v = value as { type?: unknown };
  return v.type === PRODUCT_SELECTED || v.type === PRODUCT_DESELECTED;
}

type PostOptions = {
  hashCode: string;
  /** Active item_type_id from the iframe context — used when the product itself doesn't carry one. */
  fallbackItemTypeId: number | null;
};

/**
 * Publish a product-selection change to the parent window. Same-origin only —
 * the second arg pins the target origin to ours so the message never crosses
 * frames we don't own.
 */
export function postProductSelection(
  product: Product | null,
  { hashCode, fallbackItemTypeId }: PostOptions,
): void {
  if (typeof window === "undefined") return;
  // No parent (page opened directly) → nothing to do.
  if (window.parent === window) return;

  if (!product) {
    const msg: ProductDeselectedMessage = { type: PRODUCT_DESELECTED };
    window.parent.postMessage(msg, window.location.origin);
    return;
  }

  const itemInfo = product.item_info as { name?: string; slug?: string } | undefined;
  const msg: ProductSelectedMessage = {
    type: PRODUCT_SELECTED,
    payload: {
      productId: product.id,
      productName: product.name,
      productPrice: product.seller_price ?? product.price,
      itemInfoName: itemInfo?.name ?? itemInfo?.slug ?? null,
      serverName: product.server_name ?? null,
      itemTypeId: product.item_type_id ?? fallbackItemTypeId,
      gameId: product.game_id ?? null,
      hashCode,
      product,
    },
  };
  window.parent.postMessage(msg, window.location.origin);
}
