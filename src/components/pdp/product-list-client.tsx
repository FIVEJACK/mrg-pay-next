"use client";

import { useEffect, useState } from "react";

import { FilterBar, buildAttributePayload } from "@/components/pdp/filter-bar";
import { FilterBarMobile } from "@/components/pdp/mweb/filter-bar-mobile";
import { ProductDetailSheet } from "@/components/pdp/mweb/product-detail-sheet";
import { Pagination } from "@/components/pdp/pagination";
import { ProductDetailPanel } from "@/components/pdp/product-detail-panel";
import { ProductGrid } from "@/components/pdp/product-grid";
import {
  FilterBarMobileSkeleton,
  FilterBarSkeleton,
  ProductGridSkeleton,
  ResultsCountSkeleton,
} from "@/components/pdp/skeletons";
import { postProductSelection } from "@/components/pdp/product-list-messaging";
import { CLIENT_NAME, EVENT, trackEvent } from "@/lib/amplitude";
import { getItemCategoryName } from "@/lib/item-category";
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
  attributes: B2b2cAttribute[];
  servers: Server[];
  serverLabel: string | null;
  hasServer: boolean;
  filters: Filters;
  mobile?: boolean;
  gameName: string;
  country: string;
};

const PER_PAGE = 20;

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
  mobile,
  gameName,
  country,
}: Props) {
  const [activeItemTypeId, setActiveItemTypeId] = useState(initialItemTypeId);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [detail, setDetail] = useState<GameInfoDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [productList, setProductList] = useState<ProductListData | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeItemType = itemTypes.find((t) => t.id === activeItemTypeId);

  // Sync selection up to the parent window so it can render the purchase bar.
  useEffect(() => {
    postProductSelection(selectedProduct, { hashCode, fallbackItemTypeId: activeItemTypeId });
  }, [selectedProduct, hashCode, activeItemTypeId]);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;
    async function loadDetail() {
      setDetailLoading(true);
      try {
        const v = await partnerBrowserApi.getGameInfoDetail(activeItemTypeId, {
          gameId,
          hashCode,
          signal: ctrl.signal,
        });
        if (!cancelled) setDetail(v);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    loadDetail();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [gameId, activeItemTypeId, hashCode]);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;
    async function loadProducts() {
      setProductsLoading(true);
      const scopedAttributes = attributes.filter((a) => a.item_type_id === activeItemTypeId);
      const rawAttributes = scopedAttributes.length > 0 ? filters.attributes : {};
      const attributePayload = buildAttributePayload(rawAttributes, scopedAttributes);
      const hasAttributePayload = Object.keys(attributePayload).length > 0;
      try {
        const v = await partnerBrowserApi.getProducts(
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
        );
        if (!cancelled) setProductList(v);
      } catch {
        if (!cancelled) setProductList(null);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }
    loadProducts();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [
    hashCode,
    gameId,
    activeItemTypeId,
    attributes,
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
    const itemType = itemTypes.find((t) => t.id === id);
    trackEvent(EVENT.VISIT_PRODUCT_CATALOGUE, {
      "Client Name": CLIENT_NAME,
      Game: gameName,
      "Item Type": itemType?.name ?? null,
      Country: country,
    });
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
    setSelectedProduct(null);
    syncUrl(id, reset);
  }

  function handleChangeFilters(updates: Partial<Filters>) {
    const next: Filters = { ...filters, ...updates, page: 1 };
    setFilters(next);
    setSelectedProduct(null);
    syncUrl(activeItemTypeId, next);
  }

  function handleChangePage(p: number) {
    const next: Filters = { ...filters, page: p };
    setFilters(next);
    syncUrl(activeItemTypeId, next);
  }

  const products = productList?.data ?? [];
  const totalItem = productList?.total_item ?? products.length;

  const itemPerPage = productList?.item_per_page ?? PER_PAGE;
  const totalPages =
    productList?.total_page ??
    (totalItem > 0 ? Math.ceil(totalItem / itemPerPage) : 1);
  const groups = detail?.item_info_group ?? [];

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    trackEvent(EVENT.VISIT_PRODUCT_DESCRIPTION, {
      "Client Name": CLIENT_NAME,
      Game: gameName,
      "Item Type": product.item_type?.name ?? activeItemType?.name ?? null,
      "Item Category": getItemCategoryName(product.item_category_id),
      "Device Env": mobile ? "Mobile" : "Desktop",
      "Product ID": product.id,
      "Product Name": product.name,
      Country: country,
    });
  }

  return (
    <>
      <div className="mt-6 border-b border-(--color-border-low)">
        <div role="tablist" className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        mobile ? <FilterBarMobileSkeleton /> : <FilterBarSkeleton />
      ) : mobile ? (
        <FilterBarMobile
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
            produk dari partner pilihan kami
          </p>
        )}
      </div>

      <div className="flex gap-6 pt-3">
        <div className="min-w-0 flex-1">
          {productsLoading ? (
            <ProductGridSkeleton count={PER_PAGE} mobile={mobile} />
          ) : (
            <div className="animate-fade-in">
              <ProductGrid
                products={products}
                selectedId={selectedProduct?.id}
                onSelect={handleSelectProduct}
                compact={selectedProduct !== null}
                mobile={mobile}
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

        {!mobile && selectedProduct && (
          <ProductDetailPanel
            key={selectedProduct.id}
            product={selectedProduct}
            hashCode={hashCode}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>

      {!mobile && selectedProduct && (
        // Spacer so iframe content can scroll past the parent's fixed purchase bar.
        <div aria-hidden="true" className="h-20" />
      )}

      {mobile && (
        <ProductDetailSheet
          product={selectedProduct}
          hashCode={hashCode}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
