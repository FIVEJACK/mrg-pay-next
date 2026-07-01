"use client";

import { useEffect, useRef, useState } from "react";
import { MobilePurchaseBar } from "@/components/pdp/mweb/mobile-purchase-bar";
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
    router.push(`/checkout?${qs.toString()}`);
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
      {selected && (
        <MobilePurchaseBar
          price={selected.productPrice}
          itemInfoName={selected.itemInfoName}
          onBuy={handleBuy}
        />
      )}
    </div>
  );
}
