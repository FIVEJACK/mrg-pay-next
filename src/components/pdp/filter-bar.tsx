"use client";

import { useMemo } from "react";

import type {
  B2b2cAttribute,
  ItemInfoGroup,
  ProductListQuery,
  Server,
} from "@/lib/partner-api";

import { FilterPopover, type FilterOption } from "./filter-popover";
import { ChevronDownIcon, SearchIcon } from "@/components/icon";
import { Popover } from "./popover";

type Filters = {
  itemInfoGroupId?: number;
  itemInfoId?: number;
  serverId?: number;
  attributes: Record<string, string>;
  keyword?: string;
  sort: NonNullable<ProductListQuery["sort"]>;
  page: number;
};

type FilterBarProps = {
  hashCode: string;
  groupLabel?: string | null;
  itemLabel?: string | null;
  groups: ItemInfoGroup[];
  itemInfoGroupId?: number;
  itemInfoId?: number;
  servers: Server[];
  serverLabel?: string | null;
  serverId?: number;
  /** Product-attribute configuration (b2b2c-scoped). Empty when not on the hash item_type. */
  attributes: B2b2cAttribute[];
  /** Current attribute selections keyed by translation_key. */
  attributeValues: Record<string, string>;
  keyword?: string;
  sort: NonNullable<ProductListQuery["sort"]>;
  onChange: (updates: Partial<Filters>) => void;
};

type AttrConfig = {
  format?: number;
  field_type?: number;
  options?: string[];
};

type AttrFilter = {
  id: number;
  translationKey: string;
  options: string[];
};

/** Each option-bearing attribute becomes its own popover, keyed by attribute id. */
function buildAttributeFilters(attributes: B2b2cAttribute[]): AttrFilter[] {
  const out: AttrFilter[] = [];
  for (const a of attributes) {
    const cfg = a.configuration as AttrConfig;
    if (!cfg?.options || cfg.options.length === 0) continue;
    out.push({ id: a.id, translationKey: a.translation_key, options: cfg.options });
  }
  return out;
}

/** "nama_hero" → "Nama Hero" */
function humanizeKey(key: string) {
  return key
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

const SORT_OPTIONS: Array<{ value: NonNullable<ProductListQuery["sort"]>; label: string }> = [
  { value: "popular", label: "Popular Product" },
  { value: "latest", label: "Latest" },
  { value: "cheap", label: "Cheapest" },
  { value: "expensive", label: "Most Expensive" },
  { value: "fastest_delivery", label: "Fastest Delivery" },
  { value: "shop_rating", label: "Shop Rating" },
];

const TRIGGER_BASE =
  "flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-(--color-border) bg-white px-3 text-base text-(--color-text-body) outline-none transition-colors duration-150 ease-out focus:border-(--color-brand) hover:border-(--color-brand) disabled:cursor-not-allowed disabled:text-(--color-text-disabled)";

export function FilterBar({
  groupLabel,
  itemLabel,
  groups,
  itemInfoGroupId,
  itemInfoId,
  servers,
  serverLabel,
  serverId,
  attributes,
  attributeValues,
  keyword,
  sort,
  onChange,
}: FilterBarProps) {
  const attributeFilters = useMemo(
    () => buildAttributeFilters(attributes),
    [attributes],
  );
  const groupOptions: FilterOption[] = useMemo(
    () => groups.map((g) => ({ id: g.id, name: g.name })),
    [groups],
  );

  const itemOptions: FilterOption[] = useMemo(() => {
    const activeGroup = itemInfoGroupId
      ? groups.find((g) => g.id === itemInfoGroupId)
      : undefined;
    const flat = activeGroup
      ? activeGroup.item_info.map((i) => ({ id: i.id, name: i.name }))
      : groups.flatMap((g) =>
          g.item_info.map((i) => ({ id: i.id, name: i.name, section: g.name })),
        );
    return flat;
  }, [groups, itemInfoGroupId]);

  const activeGroupName =
    groups.find((g) => g.id === itemInfoGroupId)?.name ?? "Semua";
  const activeItemName =
    groups
      .flatMap((g) => g.item_info)
      .find((i) => i.id === itemInfoId)?.name ?? "Semua";
  const activeServerName =
    servers.find((s) => s.id === serverId)?.name ?? "Semua";

  const groupTriggerLabel = `${groupLabel ?? "Tipe"}: ${activeGroupName}`;
  const itemTriggerLabel = `${itemLabel ?? "Item"}: ${activeItemName}`;
  const serverTriggerLabel = `${serverLabel ?? "Server"}: ${activeServerName}`;

  const serverOptions: FilterOption[] = useMemo(
    () => servers.map((s) => ({ id: s.id, name: s.name })),
    [servers],
  );

  return (
    <div className="flex items-center gap-3 py-4">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const value = String(fd.get("keyword") ?? "").trim();
          onChange({ keyword: value || undefined });
        }}
        className="flex w-[300px] shrink-0"
      >
        <label className="flex h-11 w-full items-center gap-2 rounded-2xl border border-(--color-border) bg-white px-3">
          <SearchIcon className="size-5 text-(--color-text-subdued)" />
          <input
            type="search"
            name="keyword"
            defaultValue={keyword}
            placeholder="Search…"
            className="w-full bg-transparent text-base text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none"
          />
        </label>
      </form>

      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {groupOptions.length > 0 && (
        <Popover
          renderTrigger={({ ref, onClick, open }) => (
            <button
              ref={ref}
              type="button"
              onClick={onClick}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={`${TRIGGER_BASE} ${open ? "border-(--color-brand)" : ""}`}
            >
              <span className="truncate">{groupTriggerLabel}</span>
              <ChevronDownIcon className="size-5 shrink-0 text-(--color-text-subdued)" />
            </button>
          )}
          renderContent={({ close }) => (
            <FilterPopover
              title={groupLabel ?? "Tipe"}
              options={groupOptions}
              selectedId={itemInfoGroupId}
              searchable={groupOptions.length > 8}
              onApply={(id) =>
                onChange({
                  itemInfoGroupId: typeof id === "number" ? id : undefined,
                  itemInfoId: undefined,
                })
              }
              onClose={close}
            />
          )}
        />
      )}

      {itemOptions.length > 0 && (
        <Popover
          renderTrigger={({ ref, onClick, open }) => (
            <button
              ref={ref}
              type="button"
              onClick={onClick}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={`${TRIGGER_BASE} ${open ? "border-(--color-brand)" : ""}`}
            >
              <span className="truncate">{itemTriggerLabel}</span>
              <ChevronDownIcon className="size-5 shrink-0 text-(--color-text-subdued)" />
            </button>
          )}
          renderContent={({ close }) => (
            <FilterPopover
              title={itemLabel ?? "Item"}
              options={itemOptions}
              selectedId={itemInfoId}
              searchable
              onApply={(id) =>
                onChange({ itemInfoId: typeof id === "number" ? id : undefined })
              }
              onClose={close}
            />
          )}
        />
      )}

      {serverOptions.length > 0 && (
        <Popover
          renderTrigger={({ ref, onClick, open }) => (
            <button
              ref={ref}
              type="button"
              onClick={onClick}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={`${TRIGGER_BASE} ${open ? "border-(--color-brand)" : ""}`}
            >
              <span className="truncate">{serverTriggerLabel}</span>
              <ChevronDownIcon className="size-5 shrink-0 text-(--color-text-subdued)" />
            </button>
          )}
          renderContent={({ close }) => (
            <FilterPopover
              title={serverLabel ?? "Server"}
              options={serverOptions}
              selectedId={serverId}
              searchable={serverOptions.length > 8}
              onApply={(id) =>
                onChange({ serverId: typeof id === "number" ? id : undefined })
              }
              onClose={close}
            />
          )}
        />
      )}

      {attributeFilters.map((attr) => {
        const idKey = String(attr.id);
        const label = humanizeKey(attr.translationKey);
        const selected = attributeValues[idKey];
        const triggerLabel = `${label}: ${selected ?? "Semua"}`;
        return (
          <Popover
            key={attr.id}
            renderTrigger={({ ref, onClick, open }) => (
              <button
                ref={ref}
                type="button"
                onClick={onClick}
                aria-haspopup="dialog"
                aria-expanded={open}
                className={`${TRIGGER_BASE} ${open ? "border-(--color-brand)" : ""}`}
              >
                <span className="truncate">{triggerLabel}</span>
                <ChevronDownIcon className="size-5 shrink-0 text-(--color-text-subdued)" />
              </button>
            )}
            renderContent={({ close }) => (
              <FilterPopover
                title={label}
                options={attr.options.map((o) => ({ id: o, name: o }))}
                selectedId={selected}
                searchable={attr.options.length > 8}
                onApply={(id) => {
                  const next = { ...attributeValues };
                  if (id === undefined || id === "") delete next[idKey];
                  else next[idKey] = String(id);
                  onChange({ attributes: next });
                }}
                onClose={close}
              />
            )}
          />
        );
      })}

      </div>

      <div className="relative w-[220px] shrink-0">
        <select
          aria-label="Sort"
          value={sort}
          onChange={(e) =>
            onChange({ sort: e.target.value as NonNullable<ProductListQuery["sort"]> })
          }
          className="h-11 w-full cursor-pointer appearance-none rounded-2xl border border-(--color-border) bg-white pl-3 pr-9 text-base text-(--color-text-body) outline-none focus:border-(--color-brand)"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {`Sort: ${opt.label}`}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-(--color-text-subdued)" />
      </div>
    </div>
  );
}
