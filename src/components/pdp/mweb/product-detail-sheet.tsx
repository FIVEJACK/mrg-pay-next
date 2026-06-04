"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { computeDiscountPct, formatPriceIDR } from "@/lib/format";
import { pickProductCoverImage } from "@/lib/partner-api";
import type { Product } from "@/lib/partner-api";
import type { ProductImage } from "@/lib/partner-api/types";
import type { ProductSelectedPayload } from "@/components/pdp/product-list-messaging";

const CLOSE_DURATION = 320;
type Tab = "description" | "how-to";

type ProductDetailSheetProps = {
  payload: ProductSelectedPayload | null;
  onClose: () => void;
  onBuy: () => void;
};

function getImageUrl(img: ProductImage): string | null {
  return img.image_url ?? img.horizontal_image_url ?? img.thumbnail_image_url ?? img.vertical_image_url ?? null;
}

export function ProductDetailSheet({ payload, onClose, onBuy }: ProductDetailSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [cachedPayload, setCachedPayload] = useState<ProductSelectedPayload | null>(null);
  const [tab, setTab] = useState<Tab>("description");
  const [imgIndex, setImgIndex] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  // Open / update when new payload arrives
  useEffect(() => {
    if (!payload) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setCachedPayload(payload);
    setClosing(false);
    setOpen(true);
    setTab("description");
    setImgIndex(0);
  }, [payload]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => () => { closeTimerRef.current && clearTimeout(closeTimerRef.current); }, []);

  function handleClose() {
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      onClose();
    }, CLOSE_DURATION);
  }

  const visible = open || closing;

  // Use the full product object carried in the payload (no re-fetch needed)
  const product = cachedPayload?.product ?? null;

  const rawImages = (product?.images ?? []).map(getImageUrl).filter(Boolean) as string[];
  const cover = product ? pickProductCoverImage(product) : null;
  const allImages = rawImages.length > 0 ? rawImages : cover ? [cover] : [];

  const normalPrice = product?.competitor_price ?? null;
  const discount = product ? computeDiscountPct(product.price, normalPrice) : null;
  const itemTypeName = product?.item_type?.name ?? "";
  const description = (
    (product as (Product & { description?: string }) | null)?.description ?? ""
  ).replace(/<[^>]*>/g, "").trim();

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${closing ? "animate-fade-out" : "animate-fade-in"}`}
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet — 3-row grid: header | scrollable body | sticky footer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product description"
        className={`${closing ? "animate-sheet-down" : "animate-sheet-up"} relative grid h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto] rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
            {product?.name ?? cachedPayload?.productName ?? "Detail Produk"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded text-(--color-text-subdued) hover:text-(--color-text-body)"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto overscroll-contain">
          {/* Image carousel */}
          <div className="relative aspect-video w-full bg-(--color-surface-secondary)">
            {allImages.length > 0 ? (
              <Image
                key={allImages[imgIndex]}
                src={allImages[imgIndex] ?? ""}
                alt={product?.name ?? cachedPayload?.productName ?? ""}
                fill
                sizes="100vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-(--color-text-subdued)">
                Tidak ada gambar
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                  aria-label="Gambar sebelumnya"
                  className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setImgIndex((i) => (i + 1) % allImages.length)}
                  aria-label="Gambar berikutnya"
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
                  {imgIndex + 1}/{allImages.length}
                </div>
              </>
            )}
          </div>

          {/* Product info */}
          {product && (
            <>
              <div className="px-4 pt-4">
                <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
                  {product.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-(--color-promotion)">
                    {formatPriceIDR(product.price)}
                  </span>
                  {normalPrice && discount !== null && (
                    <>
                      <span className="text-sm text-(--color-text-subdued) line-through">
                        {formatPriceIDR(normalPrice)}
                      </span>
                      <span className="rounded-sm bg-(--color-promotion) px-1 py-0.5 text-xs font-bold text-white">
                        {discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 border-b border-(--color-border-low) px-4">
                <div role="tablist" className="flex gap-4">
                  {(
                    [
                      { id: "description" as Tab, label: "Deskripsi" },
                      { id: "how-to" as Tab, label: `Cara ${itemTypeName || "Transaksi"}` },
                    ] as const
                  ).map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={tab === id}
                      onClick={() => setTab(id)}
                      className={`relative shrink-0 px-1 py-3 text-sm outline-none ${
                        tab === id
                          ? "font-bold text-(--color-text-title)"
                          : "font-semibold text-(--color-text-subdued)"
                      }`}
                    >
                      {label}
                      {tab === id && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-(--color-brand)" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4 text-sm leading-6 text-(--color-text-body)">
                {tab === "description" ? (
                  description ? (
                    <p className="whitespace-pre-wrap">{description}</p>
                  ) : (
                    <DescriptionFallback product={product} />
                  )
                ) : (
                  <p>Cara {itemTypeName || "transaksi"} akan muncul di sini.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex items-center gap-4 border-t border-(--color-border-low) px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-(--color-promotion)">
              {formatPriceIDR(product?.price ?? cachedPayload?.productPrice ?? 0)}
            </p>
            {cachedPayload?.itemInfoName && (
              <p className="truncate text-xs text-(--color-text-subdued)">{cachedPayload.itemInfoName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onBuy}
            className="h-11 shrink-0 rounded-full bg-(--color-brand) px-8 text-sm font-bold text-white transition hover:opacity-90"
          >
            Beli sekarang
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DescriptionFallback({ product }: { product: Product }) {
  return (
    <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2">
      {product.item_info?.slug && (
        <>
          <dt className="text-(--color-text-subdued)">Item</dt>
          <dd>{product.item_info.slug}</dd>
        </>
      )}
      {product.server_name && (
        <>
          <dt className="text-(--color-text-subdued)">Server</dt>
          <dd>{product.server_name}</dd>
        </>
      )}
      {product.seller?.shop_name && (
        <>
          <dt className="text-(--color-text-subdued)">Seller</dt>
          <dd>{product.seller.shop_name}</dd>
        </>
      )}
      {product.stock !== undefined && (
        <>
          <dt className="text-(--color-text-subdued)">Stock</dt>
          <dd>{product.stock.toLocaleString("en-US")}</dd>
        </>
      )}
      <dt className="text-(--color-text-subdued)">Delivery</dt>
      <dd>
        {product.use_instant_delivery === 1
          ? "Instant"
          : product.use_auto_delivery === 1
            ? "Direct Gift"
            : "Face to Face"}
      </dd>
    </dl>
  );
}
