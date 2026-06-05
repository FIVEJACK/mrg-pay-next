"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  B2b2cAttribute,
  ItemInfoGroup,
  ProductListQuery,
  Server,
} from "@/lib/partner-api";

import { FilterPopover, type FilterOption } from "./filter-popover";
import { CheckboxFilterPopover } from "./checkbox-filter-popover";
import { RangeFilterPopover } from "./range-filter-popover";
import { SortPopover } from "./sort-popover";
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

export const FIELD_TYPE = {
  FREE_TEXT: 1,
  CHECKBOX: 2,
  RADIO: 3,
} as const;

const ATTR_FORMAT = {
  STRING: 1,
  NUMERIC: 2,
  PERCENTAGE: 3,
} as const;

type AttrConfig = {
  format?: number;
  field_type?: number;
  options?: string[];
  validation_rules?: Array<{ validation_name: string; value: string }>;
};

export type AttrFilter = {
  id: number;
  translationKey: string;
  fieldType: number;
  format: number;
  options: string[];
  min?: string;
  max?: string;
};

export function buildAttributeFilters(attributes: B2b2cAttribute[]): AttrFilter[] {
  const out: AttrFilter[] = [];
  for (const a of attributes) {
    const cfg = a.configuration as AttrConfig;
    if (!cfg?.field_type) continue;

    const min = cfg.validation_rules?.find((r) => r.validation_name === "min")?.value;
    const max = cfg.validation_rules?.find((r) => r.validation_name === "max")?.value;

    if (cfg.field_type === FIELD_TYPE.FREE_TEXT) {
      out.push({
        id: a.id,
        translationKey: a.translation_key,
        fieldType: cfg.field_type,
        format: cfg.format ?? ATTR_FORMAT.STRING,
        options: [],
        min,
        max,
      });
    } else if (cfg.options && cfg.options.length > 0) {
      out.push({
        id: a.id,
        translationKey: a.translation_key,
        fieldType: cfg.field_type,
        format: cfg.format ?? ATTR_FORMAT.STRING,
        options: cfg.options,
        min,
        max,
      });
    }
  }
  return out;
}

/**
 * Convert the internal URL-safe attribute state into the typed payload the API expects.
 * Internal encoding per field type:
 *   FREE_TEXT  → "min|max" string  → { min?, max? }
 *   CHECKBOX   → "a,b,c" string   → string[]
 *   RADIO      → plain string     → string
 */
export function buildAttributePayload(
  attributeValues: Record<string, string>,
  attributeConfig: B2b2cAttribute[],
): Record<string, string | string[] | { min?: string; max?: string }> {
  const payload: Record<string, string | string[] | { min?: string; max?: string }> = {};
  for (const [idKey, raw] of Object.entries(attributeValues)) {
    if (!raw) continue;
    const cfg = (attributeConfig.find((a) => String(a.id) === idKey)?.configuration ?? {}) as AttrConfig;

    if (cfg.field_type === FIELD_TYPE.FREE_TEXT) {
      const parts = raw.split("|");
      const range: { min?: string; max?: string } = {};
      if (parts[0]) range.min = parts[0];
      if (parts[1]) range.max = parts[1];
      if (range.min || range.max) payload[idKey] = range;
    } else if (cfg.field_type === FIELD_TYPE.CHECKBOX) {
      const values = raw.split(",").filter(Boolean);
      if (values.length > 0) payload[idKey] = values;
    } else {
      payload[idKey] = raw;
    }
  }
  return payload;
}

/** "nama_hero" → "Nama Hero" */
export function humanizeKey(key: string) {
  return key
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export const SORT_OPTIONS: Array<{ value: NonNullable<ProductListQuery["sort"]>; label: string }> = [
  { value: "popular", label: "Produk Terpopuler" },
  { value: "cheap", label: "Harga: Rendah ke Tinggi" },
  { value: "expensive", label: "Harga: Tinggi ke Rendah" },
  { value: "shop_rating", label: "Terlaris" },
  { value: "latest", label: "Terbaru" },
  { value: "fastest_delivery", label: "Pengiriman Tercepat" },
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  // Active filter chips — computed inline (cheap; re-runs only when filter
  // state changes which is exactly when chips should update anyway).
  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (itemInfoGroupId) {
    const name = groups.find((g) => g.id === itemInfoGroupId)?.name ?? String(itemInfoGroupId);
    activeChips.push({
      key: "group",
      label: `${groupLabel ?? "Tipe"}: ${name}`,
      onRemove: () => onChange({ itemInfoGroupId: undefined, itemInfoId: undefined }),
    });
  }

  if (itemInfoId) {
    const name =
      groups.flatMap((g) => g.item_info).find((i) => i.id === itemInfoId)?.name ??
      String(itemInfoId);
    activeChips.push({
      key: "item",
      label: `${itemLabel ?? "Item"}: ${name}`,
      onRemove: () => onChange({ itemInfoId: undefined }),
    });
  }

  if (serverId) {
    const name = servers.find((s) => s.id === serverId)?.name ?? String(serverId);
    activeChips.push({
      key: "server",
      label: `${serverLabel ?? "Server"}: ${name}`,
      onRemove: () => onChange({ serverId: undefined }),
    });
  }

  for (const [idKey, raw] of Object.entries(attributeValues)) {
    if (!raw) continue;
    const attr = attributeFilters.find((a) => String(a.id) === idKey);
    if (!attr) continue;
    const attrLabel = humanizeKey(attr.translationKey);

    let valueLabel: string;
    if (attr.fieldType === FIELD_TYPE.FREE_TEXT) {
      const parts = raw.split("|");
      const minPart = parts[0] ?? "";
      const maxPart = parts[1] ?? "";
      if (minPart && maxPart) valueLabel = `${minPart} – ${maxPart}`;
      else if (minPart) valueLabel = `≥ ${minPart}`;
      else valueLabel = `≤ ${maxPart}`;
    } else if (attr.fieldType === FIELD_TYPE.CHECKBOX) {
      const values = raw.split(",").filter(Boolean);
      valueLabel = values.length === 1 ? values[0] : `${values.length} terpilih`;
    } else {
      valueLabel = raw;
    }

    const capturedKey = idKey;
    activeChips.push({
      key: `attr-${idKey}`,
      label: `${attrLabel}: ${valueLabel}`,
      onRemove: () => {
        const next = { ...attributeValues };
        delete next[capturedKey];
        onChange({ attributes: next });
      },
    });
  }

  return (
    <div>
    <div className="flex items-center gap-3 py-4">
      <div className="relative flex min-w-0 flex-1 items-center">
        {/* Left scroll arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollBy(-200)}
            aria-label="Scroll kiri"
            className="absolute left-0 z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-white shadow-sm hover:border-(--color-brand)"
          >
            <ChevronDownIcon className="size-4 rotate-90 text-(--color-text-body)" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingLeft: canScrollLeft ? "2.25rem" : undefined,
            paddingRight: canScrollRight ? "2.25rem" : undefined,
          }}
        >
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

        if (attr.fieldType === FIELD_TYPE.FREE_TEXT) {
          // Range stored as "min|max" — either part may be empty.
          const parts = selected ? selected.split("|") : ["", ""];
          const rangeValue = { min: parts[0] ?? "", max: parts[1] ?? "" };
          const hasRange = rangeValue.min || rangeValue.max;
          const triggerLabel = hasRange
            ? `${label}: ${rangeValue.min || "…"} – ${rangeValue.max || "…"}`
            : `${label}: Semua`;
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
                <RangeFilterPopover
                  title="Filter"
                  sectionLabel={label}
                  value={rangeValue}
                  constraintMin={attr.min}
                  constraintMax={attr.max}
                  onApply={(v) => {
                    const next = { ...attributeValues };
                    const serialized = `${v?.min ?? ""}|${v?.max ?? ""}`;
                    if (serialized === "|") delete next[idKey];
                    else next[idKey] = serialized;
                    onChange({ attributes: next });
                  }}
                  onClose={close}
                />
              )}
            />
          );
        }

        if (attr.fieldType === FIELD_TYPE.CHECKBOX) {
          const selectedArr = selected ? selected.split(",") : [];
          const triggerLabel =
            selectedArr.length === 0
              ? `${label}: Semua`
              : selectedArr.length === 1
                ? `${label}: ${selectedArr[0]}`
                : `${label}: ${selectedArr.length} terpilih`;
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
                <CheckboxFilterPopover
                  title={label}
                  options={attr.options.map((o) => ({ id: o, name: o }))}
                  selectedIds={selectedArr}
                  searchable={attr.options.length > 8}
                  onApply={(ids) => {
                    const next = { ...attributeValues };
                    if (ids.length === 0) delete next[idKey];
                    else next[idKey] = ids.join(",");
                    onChange({ attributes: next });
                  }}
                  onClose={close}
                />
              )}
            />
          );
        }

        // FIELD_TYPE.RADIO (3) — single-select
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

        {/* Right scroll arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollBy(200)}
            aria-label="Scroll kanan"
            className="absolute right-0 z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-white shadow-sm hover:border-(--color-brand)"
          >
            <ChevronDownIcon className="size-4 -rotate-90 text-(--color-text-body)" />
          </button>
        )}
      </div>

      <Popover
        renderTrigger={({ ref, onClick, open }) => (
          <button
            ref={ref}
            type="button"
            onClick={onClick}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={`${TRIGGER_BASE} w-[220px] shrink-0 ${open ? "border-(--color-brand)" : ""}`}
          >
            <span className="truncate">
              {`Sort: ${SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort}`}
            </span>
            <ChevronDownIcon
              className={`size-5 shrink-0 text-(--color-text-subdued) transition-transform duration-200 ease-out ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
        renderContent={({ close }) => (
          <SortPopover
            options={SORT_OPTIONS}
            value={sort}
            onSelect={(v) => onChange({ sort: v })}
            onClose={close}
          />
        )}
      />
    </div>

    {activeChips.length > 0 && (
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {activeChips.map((chip) => (
          <span
            key={chip.key}
            className="flex items-center gap-1.5 rounded-full border border-(--color-border) bg-white px-3 py-1.5 text-sm text-(--color-text-body)"
          >
            {chip.label}
            <button
              type="button"
              onClick={chip.onRemove}
              aria-label={`Hapus ${chip.label}`}
              className="flex size-4 items-center justify-center text-(--color-text-subdued) hover:text-(--color-text-body)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-3"
              >
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              itemInfoGroupId: undefined,
              itemInfoId: undefined,
              serverId: undefined,
              attributes: {},
            })
          }
          className="text-sm font-bold text-(--color-brand)"
        >
          Clear All
        </button>
      </div>
    )}
    </div>
  );
}
