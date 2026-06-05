"use client";

import { useEffect, useRef, useState } from "react";
import { ProductDetailSheet } from "@/components/pdp/mweb/product-detail-sheet";
import {
  CLEAR_SELECTION,
  isProductListMessage,
  PRODUCT_DESELECTED,
  PRODUCT_SELECTED,
  type ProductSelectedPayload,
} from "@/components/pdp/product-list-messaging";
import { useRouter } from "@/i18n/navigation";
import type { ProductListViewProps } from "@/components/pdp/dweb/product-list-desktop";

export function ProductListMobile({ hashCode }: ProductListViewProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selected, setSelected] = useState<ProductSelectedPayload | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isProductListMessage(event.data)) return;

      if (event.data.type === PRODUCT_SELECTED) {
        if (event.data.payload.hashCode !== hashCode) return;
        setSelected(event.data.payload);
      } else if (event.data.type === PRODUCT_DESELECTED) {
        setSelected(null);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [hashCode]);

  function handleBuy() {
    if (!selected) return;
    const qs = new URLSearchParams({
      product_id: String(selected.productId),
      hash_code: hashCode,
    });
    if (selected.itemTypeId != null) qs.set("item_type_id", String(selected.itemTypeId));
    if (selected.gameId != null) qs.set("game_id", String(selected.gameId));
    router.push(`/checkout?${qs.toString()}`);
  }

  function handleClose() {
    setSelected(null);
    // Tell the iframe to clear its selection so re-tapping the same product reopens the sheet.
    iframeRef.current?.contentWindow?.postMessage(
      { type: CLEAR_SELECTION },
      window.location.origin,
    );
  }

  const iframeSrc = `/iframe/product?hash_code=${encodeURIComponent(hashCode)}`;

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        title="Product list"
        className="h-full w-full flex-1 border-0"
      />
      <ProductDetailSheet
        payload={selected}
        onClose={handleClose}
        onBuy={handleBuy}
      />
    </div>
  );
}
