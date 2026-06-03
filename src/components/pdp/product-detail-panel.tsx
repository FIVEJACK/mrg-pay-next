"use client";

import Image from "next/image";
import { useState } from "react";

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

  const cover = pickProductCoverImage(product);
  // competitor_price = normal/reference price; price = (potentially discounted) selling price.
  const normalPrice = product.competitor_price ?? null;
  const discount = computeDiscountPct(product.price, normalPrice);
  const itemTypeName = product.item_type?.name ?? "";
  const description = ((product as Product & { description?: string }).description ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();

  return (
    <aside
      aria-label="Product detail"
      className="animate-slide-in-right sticky top-20 flex h-[calc(100vh-7rem)] w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between px-4 py-3">
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

      <div className="flex-1 overflow-y-auto">
        <div className="relative aspect-[210/118] w-full bg-(--color-surface-secondary)">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="380px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-(--color-text-subdued)">
              No image
            </div>
          )}
        </div>

        <div className="px-4 pt-4">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-(--color-text-title)">
            {product.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold text-(--color-promotion)">
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

        <div className="mt-4 border-b border-(--color-border-low) px-4">
          <div role="tablist" className="flex gap-4">
            <TabButton active={tab === "description"} onClick={() => setTab("description")}>
              Deskripsi
            </TabButton>
            <TabButton active={tab === "how-to"} onClick={() => setTab("how-to")}>
              Cara {itemTypeName || "Transaksi"}
            </TabButton>
          </div>
        </div>

        <div className="px-4 py-4 text-sm text-(--color-text-body)">
          {tab === "description" ? (
            description ? (
              <p className="whitespace-pre-wrap leading-6">{description}</p>
            ) : (
              <DescriptionFallback product={product} />
            )
          ) : (
            <p className="leading-6">
              How to complete the transaction will appear here. (Cara {itemTypeName || "transaksi"})
            </p>
          )}
        </div>
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

function DescriptionFallback({ product }: { product: Product }) {
  const sellerName = product.seller?.shop_name;
  const itemInfoName = product.item_info?.slug;
  const stock = product.stock;
  return (
    <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2">
      {itemInfoName && (
        <>
          <dt className="text-(--color-text-subdued)">Item</dt>
          <dd>{itemInfoName}</dd>
        </>
      )}
      {product.server_name && (
        <>
          <dt className="text-(--color-text-subdued)">Server</dt>
          <dd>{product.server_name}</dd>
        </>
      )}
      {sellerName && (
        <>
          <dt className="text-(--color-text-subdued)">Seller</dt>
          <dd>{sellerName}</dd>
        </>
      )}
      {stock !== undefined && (
        <>
          <dt className="text-(--color-text-subdued)">Stock</dt>
          <dd>{stock.toLocaleString("en-US")}</dd>
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
