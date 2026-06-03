"use client";

import { useEffect, useState } from "react";

import { FilterBar, buildAttributePayload } from "@/components/pdp/filter-bar";
import { Pagination } from "@/components/pdp/pagination";
import { ProductDetailPanel } from "@/components/pdp/product-detail-panel";
import { ProductGrid } from "@/components/pdp/product-grid";
import {
  FilterBarSkeleton,
  ProductGridSkeleton,
  ResultsCountSkeleton,
} from "@/components/pdp/skeletons";
import { postProductSelection } from "@/components/pdp/product-list-messaging";
import { partnerBrowserApi } from "@/lib/partner-api/browser-client";
import type {
  B2b2cAttribute,
  GameInfoDetailData,
  ItemType,
  Product,
  ProductListData,
  ProductListQuery,
  Server,
} from "@/lib/partner-api";

type Filters = {
  itemInfoGroupId?: number;
  itemInfoId?: number;
  serverId?: number;
  attributes: Record<string, string>;
  page: number;
  keyword?: string;
  sort: NonNullable<ProductListQuery["sort"]>;
};

type Props = {
  hashCode: string;
  gameId: number;
  itemTypes: ItemType[];
  initialItemTypeId: number;
  /** Product-attribute configuration (b2b2c-scoped). */
  attributes: B2b2cAttribute[];
  servers: Server[];
  serverLabel: string | null;
  hasServer: boolean;
  filters: Filters;
};

const PER_PAGE = 12;

export function ProductListClient({
  hashCode,
  gameId,
  itemTypes,
  initialItemTypeId,
  attributes,
  servers,
  serverLabel,
  hasServer,
  filters: initialFilters,
}: Props) {
  const [activeItemTypeId, setActiveItemTypeId] = useState(initialItemTypeId);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const [detail, setDetail] = useState<GameInfoDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  const [productList, setProductList] = useState<ProductListData | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  /**
   * The gateway uses cursor pagination (`next_page` only — no global total).
   * We track the highest page we've ever seen as the user navigates so the
   * numbered pager can grow honestly: page 1 with a next_page shows [1] [2];
   * jump to page 5 and we know there are at least 5 pages, etc.
   */
  const [discoveredMaxPage, setDiscoveredMaxPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeItemType = itemTypes.find((t) => t.id === activeItemTypeId);

  // Sync selection up to the parent window (the iframe shell renders the FAB).
  useEffect(() => {
    postProductSelection(selectedProduct, { hashCode, fallbackItemTypeId: activeItemTypeId });
  }, [selectedProduct, hashCode, activeItemTypeId]);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;
    setDetailLoading(true);
    partnerBrowserApi
      .getGameInfoDetail(activeItemTypeId, {
        gameId,
        hashCode,
        signal: ctrl.signal,
      })
      .then((v) => !cancelled && setDetail(v))
      .catch(() => !cancelled && setDetail(null))
      .finally(() => !cancelled && setDetailLoading(false));
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [gameId, activeItemTypeId, hashCode]);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;
    setProductsLoading(true);
    const scopedAttributes = attributes.filter((a) => a.item_type_id === activeItemTypeId);
    const rawAttributes = scopedAttributes.length > 0 ? filters.attributes : {};
    const attributePayload = buildAttributePayload(rawAttributes, scopedAttributes);
    const hasAttributePayload = Object.keys(attributePayload).length > 0;

    partnerBrowserApi
      .getProducts(
        {
          game_id: gameId,
          item_type_id: activeItemTypeId,
          item_info_group_id: filters.itemInfoGroupId,
          item_info_id: filters.itemInfoId,
          server_id: filters.serverId,
          page: filters.page,
          per_page: PER_PAGE,
          keyword: filters.keyword,
          sort: filters.sort,
          ...(hasAttributePayload ? { attributes: attributePayload } : {}),
        },
        { hashCode, signal: ctrl.signal },
      )
      .then((v) => {
        if (cancelled) return;
        setProductList(v);
        const cur = v?.current_page ?? filters.page;
        const hasNext = v?.next_page != null;
        setDiscoveredMaxPage((prev) => Math.max(prev, cur + (hasNext ? 1 : 0)));
      })
      .catch(() => !cancelled && setProductList(null))
      .finally(() => !cancelled && setProductsLoading(false));
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [
    hashCode,
    gameId,
    activeItemTypeId,
    filters.itemInfoGroupId,
    filters.itemInfoId,
    filters.serverId,
    filters.attributes,
    filters.page,
    filters.keyword,
    filters.sort,
  ]);

  function syncUrl(nextItemTypeId: number, nextFilters: Filters) {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams();
    usp.set("hash_code", hashCode);
    if (nextItemTypeId) usp.set("item_type_id", String(nextItemTypeId));
    if (nextFilters.itemInfoGroupId)
      usp.set("item_info_group_id", String(nextFilters.itemInfoGroupId));
    if (nextFilters.itemInfoId)
      usp.set("item_info_id", String(nextFilters.itemInfoId));
    if (nextFilters.serverId) usp.set("server_id", String(nextFilters.serverId));
    for (const [k, v] of Object.entries(nextFilters.attributes ?? {})) {
      if (v && v.trim() !== "") usp.set(`attr_${k}`, v);
    }
    if (nextFilters.keyword) usp.set("keyword", nextFilters.keyword);
    if (nextFilters.sort && nextFilters.sort !== "popular")
      usp.set("sort", nextFilters.sort);
    if (nextFilters.page > 1) usp.set("page", String(nextFilters.page));
    window.history.replaceState(null, "", `${window.location.pathname}?${usp.toString()}`);
  }

  function handleSelectItemType(id: number) {
    if (id === activeItemTypeId) return;
    // Reset item_info_group_id / item_info_id since they don't apply across types.
    // Attribute filters are also b2b2c-scoped — drop them when leaving the hash type.
    // server_id is game-scoped so it stays.
    const reset: Filters = {
      ...filters,
      itemInfoGroupId: undefined,
      itemInfoId: undefined,
      attributes: {},
      page: 1,
    };
    setActiveItemTypeId(id);
    setFilters(reset);
    setDiscoveredMaxPage(1);
    setSelectedProduct(null);
    syncUrl(id, reset);
  }

  function handleChangeFilters(updates: Partial<Filters>) {
    const next: Filters = { ...filters, ...updates, page: 1 };
    setFilters(next);
    setDiscoveredMaxPage(1);
    setSelectedProduct(null);
    syncUrl(activeItemTypeId, next);
  }

  function handleChangePage(p: number) {
    const next: Filters = { ...filters, page: p };
    setFilters(next);
    syncUrl(activeItemTypeId, next);
  }

  const products = productList?.data ?? [];
  // `total_item` from the gateway is the count of items in THIS response, not
  // a global total (cursor pagination). Display it as the visible-on-this-page
  // count.
  const totalItem = productList?.total_item ?? products.length;
  // Display total = gateway's `total_page` (rarely set) → otherwise our
  // monotonically-growing `discoveredMaxPage`. Always at least 1.
  const totalPages = Math.max(productList?.total_page ?? 0, discoveredMaxPage, 1);
  const groups = detail?.item_info_group ?? [];

  return (
    <>
      <div className="mt-6 border-b border-(--color-border-low)">
        <div role="tablist" className="flex gap-4 overflow-x-auto">
          {itemTypes.map((t) => {
            const active = t.id === activeItemTypeId;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectItemType(t.id)}
                className={`relative shrink-0 p-4 text-base outline-none transition-colors duration-150 ease-out ${
                  active
                    ? "font-bold text-(--color-text-title)"
                    : "cursor-pointer font-semibold text-(--color-text-subdued) hover:text-(--color-text-body)"
                }`}
              >
                {t.name}
                {active && (
                  <span className="animate-fade-in absolute inset-x-4 bottom-0 h-1 rounded-full bg-(--color-brand)" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {detailLoading ? (
        <FilterBarSkeleton />
      ) : (
        <FilterBar
          hashCode={hashCode}
          groups={groups}
          groupLabel={activeItemType?.item_info_group_label ?? "Tipe"}
          itemLabel={activeItemType?.item_info_label ?? "Item"}
          itemInfoGroupId={filters.itemInfoGroupId}
          itemInfoId={filters.itemInfoId}
          servers={hasServer ? servers : []}
          serverLabel={serverLabel}
          serverId={filters.serverId}
          attributes={attributes.filter((a) => a.item_type_id === activeItemTypeId)}
          attributeValues={filters.attributes}
          keyword={filters.keyword}
          sort={filters.sort}
          onChange={handleChangeFilters}
        />
      )}

      <div className="py-2">
        {productsLoading ? (
          <ResultsCountSkeleton />
        ) : (
          <p className="animate-fade-in text-base text-(--color-text-body)">
            <span className="font-bold">{totalItem.toLocaleString("en-US")}</span>{" "}
            products from our trusted partners
          </p>
        )}
      </div>

      <div className="flex gap-6 pt-3">
        <div className="min-w-0 flex-1">
          {productsLoading ? (
            <ProductGridSkeleton count={PER_PAGE} />
          ) : (
            <div className="animate-fade-in">
              <ProductGrid
                products={products}
                selectedId={selectedProduct?.id}
                onSelect={setSelectedProduct}
                compact={selectedProduct !== null}
              />
            </div>
          )}

          <div className="flex justify-center pt-8">
            {!productsLoading && totalPages > 1 && (
              <Pagination
                page={filters.page}
                totalPages={totalPages}
                hrefFor={(p) => `#page-${p}`}
                onSelect={handleChangePage}
              />
            )}
          </div>
        </div>

        {selectedProduct && (
          <ProductDetailPanel
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>

      {selectedProduct && (
        // Spacer so iframe content can scroll past the parent's fixed purchase bar.
        <div aria-hidden="true" className="h-20" />
      )}
    </>
  );
}
