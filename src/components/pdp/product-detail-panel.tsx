"use client";

import { HtmlContent } from "@/components/shared/html-content";
import { MrgImage } from "@/components/shared/mrg-image";
import { useEffect, useState } from "react";

import { computeDiscountPct, formatPriceIDR } from "@/lib/format";
import type { Product } from "@/lib/partner-api";
import { pickProductCoverImage } from "@/lib/partner-api";
import { partnerBrowserApi } from "@/lib/partner-api/browser-client";

type Tab = "description" | "how-to";

// The how-to article is shared by every product under the same item type, so
// cache article bodies by item_type_id — reopening the panel for another
// product in the same item type reuses it instead of re-fetching. Keyed by
// item_type_id (not the faq id itself) since that's the field the product
// list is actually filtered/grouped by.
const howToArticleCache = new Map<number, string>();

// The zendesk proxy returns the article body HTML-entity-escaped (e.g. "&lt;p&gt;")
// rather than raw markup, so decode it once before handing it to HtmlContent —
// otherwise the tags render as visible text instead of formatted content.
function decodeHtmlEntities(html: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

type ProductDetailPanelProps = {
  product: Product;
  hashCode: string;
  onClose: () => void;
};

export function ProductDetailPanel({ product, hashCode, onClose }: ProductDetailPanelProps) {
  const [tab, setTab] = useState<Tab>("description");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => { if (imageIndex !== 0) setImageIndex(0); }, [product.id]);
  useEffect(() => { if (tab !== "description") setTab("description"); }, [product.id]);

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
  const description = ((product as Product & { description?: string }).description ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();
  const howToTradeFaqId = (product.item_type as { how_to_trade_faq_id?: string } | undefined)?.how_to_trade_faq_id;

  const itemTypeId = product.item_type_id;

  const [howToArticle, setHowToArticle] = useState<{ itemTypeId: number; body: string } | null>(null);
  const [howToLoading, setHowToLoading] = useState(false);
  const [howToError, setHowToError] = useState(false);

  useEffect(() => {
    if (tab !== "how-to" || !howToTradeFaqId || itemTypeId === undefined) return;
    if (howToArticle?.itemTypeId === itemTypeId) return;

    const cached = howToArticleCache.get(itemTypeId);
    if (cached !== undefined) {
      setHowToArticle({ itemTypeId, body: cached });
      setHowToError(false);
      return;
    }

    const ctrl = new AbortController();
    let cancelled = false;
    async function loadHowToArticle() {
      setHowToLoading(true);
      setHowToError(false);
      try {
        const res = await partnerBrowserApi.getZendeskArticle(howToTradeFaqId as string, {
          hashCode,
          signal: ctrl.signal,
        });
        const body = decodeHtmlEntities(res.article?.body ?? "");
        howToArticleCache.set(itemTypeId as number, body);
        if (!cancelled) setHowToArticle({ itemTypeId: itemTypeId as number, body });
      } catch {
        if (!cancelled) setHowToError(true);
      } finally {
        if (!cancelled) setHowToLoading(false);
      }
    }
    loadHowToArticle();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [tab, howToTradeFaqId, itemTypeId, howToArticle?.itemTypeId, hashCode]);

  return (
    <aside
      aria-label="Product detail"
      className="animate-slide-in-right sticky top-4 flex h-[700px] w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)]"
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
            Cara Transaksi
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
        ) : howToLoading ? (
          <p className="leading-6 text-(--color-text-subdued)">Memuat...</p>
        ) : howToTradeFaqId && !howToError && howToArticle && product.item_type_id === itemTypeId ? (
          <HtmlContent
            data={howToArticle.body}
            className="leading-6 [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_li]:pl-1 [&_p]:mb-3 [&_strong]:font-bold [&_b]:font-bold [&_a]:text-(--color-brand) [&_a]:underline"
          />
        ) : (
          <p className="leading-6">There is no transaction guidance available for this product.</p>
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
