"use client";

import { useEffect, useState } from "react";
import { ProductDetailSheet } from "@/components/pdp/mweb/product-detail-sheet";
import {
  isProductListMessage,
  PRODUCT_DESELECTED,
  PRODUCT_SELECTED,
  type ProductSelectedPayload,
} from "@/components/pdp/product-list-messaging";
import { useRouter } from "@/i18n/navigation";
import type { ProductListViewProps } from "@/components/pdp/dweb/product-list-desktop";

export function ProductListMobile({ hashCode }: ProductListViewProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ProductSelectedPayload | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isProductListMessage(event.data)) return;

      if (event.data.type === PRODUCT_SELECTED) {
        setSelected(event.data.payload);
      } else if (event.data.type === PRODUCT_DESELECTED) {
        setSelected(null);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function handleBuy() {
    if (!selected) return;
    const qs = new URLSearchParams({
      product_id: String(selected.productId),
      hash_code: selected.hashCode,
    });
    if (selected.itemTypeId != null) qs.set("item_type_id", String(selected.itemTypeId));
    if (selected.gameId != null) qs.set("game_id", String(selected.gameId));
    router.push(`/checkout?${qs.toString()}`);
  }

  const iframeSrc = `/iframe/product?hash_code=${encodeURIComponent(hashCode)}`;

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <iframe
        src={iframeSrc}
        title="Product list"
        className="min-h-[100dvh] w-full flex-1 border-0"
      />
      <ProductDetailSheet
        payload={selected}
        onClose={() => setSelected(null)}
        onBuy={handleBuy}
      />
    </div>
  );
}
