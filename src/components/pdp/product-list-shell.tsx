"use client";

import { useEffect, useState } from "react";

import { FloatingPurchaseBar } from "@/components/pdp/floating-purchase-bar";
import {
  isProductListMessage,
  PRODUCT_DESELECTED,
  PRODUCT_SELECTED,
  type ProductSelectedPayload,
} from "@/components/pdp/product-list-messaging";
import { useRouter } from "@/i18n/navigation";

type ProductListShellProps = {
  hashCode: string;
};

export function ProductListShell({ hashCode }: ProductListShellProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ProductSelectedPayload | null>(null);

  // Listen for selection updates from the iframe. Only accept messages from
  // our own origin and only ones matching our protocol shape.
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
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
      <iframe
        src={iframeSrc}
        title="Product list"
        className="min-h-[calc(100vh-4rem)] w-full flex-1 border-0"
      />
      {selected && (
        <FloatingPurchaseBar
          price={selected.productPrice}
          itemInfoName={selected.itemInfoName}
          serverName={selected.serverName}
          onBuy={handleBuy}
        />
      )}
    </div>
  );
}
