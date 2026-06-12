"use client";

import { MrgImage } from "@/components/shared/mrg-image";
import { useEffect, useState } from "react";

import { computeDiscountPct, formatPriceIDR } from "@/lib/format";
import type { Product } from "@/lib/partner-api";
import { pickProductCoverImage } from "@/lib/partner-api";

type Tab = "description" | "how-to";

type ProductDetailPanelProps = {
  product: Product;
  onClose: () => void;
};

export function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
  const [tab, setTab] = useState<Tab>("description");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => { if (imageIndex !== 0) setImageIndex(0); }, [product.id]);

  const allImages: string[] = [];
  for (const img of product.images ?? []) {
    const url = img.image_url?.trim() || img.horizontal_image_url?.trim() || img.thumbnail_image_url?.trim() || img.vertical_image_url?.trim();
    if (url) allImages.push(url);
  }
  if (allImages.length === 0) {
    const fallback = pickProductCoverImage(product);
    if (fallback) allImages.push(fallback);
  }
  const hasMultiple = allImages.length > 1;
  const cover = allImages[imageIndex] ?? null;
  // competitor_price = normal/reference price; price = (potentially discounted) selling price.
  const normalPrice = product.competitor_price ?? null;
  const discount = computeDiscountPct(product.seller_price, normalPrice);
  const itemTypeName = product.item_type?.name ?? "";
  const description = ((product as Product & { description?: string }).description ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();

  return (
    <aside
      aria-label="Product detail"
      className="animate-slide-in-right sticky top-20 flex h-[700px] w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
          Product Description
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product detail"
          className="rounded p-1 text-(--color-text-secondary) hover:bg-(--color-surface-secondary)"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="relative aspect-[210/118] w-full shrink-0 bg-(--color-surface-secondary)">
        {cover ? (
          <MrgImage
            src={cover}
            alt={product.name}
            fill
            sizes="380px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-(--color-text-subdued)">
            No image
          </div>
        )}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
              disabled={imageIndex === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow transition-opacity disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setImageIndex((i) => Math.min(allImages.length - 1, i + 1))}
              disabled={imageIndex === allImages.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow transition-opacity disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === imageIndex ? "w-3 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 px-4 py-3">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-(--color-text-title)">
          {product.name}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-(--color-promotion)">
            {formatPriceIDR(product.seller_price)}
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
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.stock !== undefined && (
            <span className="rounded-sm border border-(--color-border) bg-white px-2.5 py-0.5 text-xs text-(--color-text-body)">
              Stok: {product.stock}
            </span>
          )}
          <span className="rounded-sm border border-(--color-border) bg-white px-2.5 py-0.5 text-xs text-(--color-text-body)">
            Min. beli: {product.wholesale?.[0]?.minimum_order ?? 1}
          </span>
        </div>
      </div>

      <div className="shrink-0 border-b border-(--color-border-low) px-4">
        <div role="tablist" className="flex gap-4">
          <TabButton active={tab === "description"} onClick={() => setTab("description")}>
            Deskripsi
          </TabButton>
          <TabButton active={tab === "how-to"} onClick={() => setTab("how-to")}>
            Cara {itemTypeName || "Transaksi"}
          </TabButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-(--color-text-body)">
        {tab === "description" ? (
          description ? (
            <p className="whitespace-pre-wrap leading-6">{description}</p>
          ) : (
            <p className="whitespace-pre-wrap leading-6">There is no description available for this product.</p>
          )
        ) : (
          <p className="leading-6">
            How to complete the transaction will appear here. (Cara {itemTypeName || "transaksi"})
          </p>
        )}
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative shrink-0 px-1 py-3 text-sm outline-none ${
        active
          ? "font-bold text-(--color-text-title)"
          : "cursor-pointer font-semibold text-(--color-text-subdued) hover:text-(--color-text-body)"
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-(--color-brand)" />
      )}
    </button>
  );
}
