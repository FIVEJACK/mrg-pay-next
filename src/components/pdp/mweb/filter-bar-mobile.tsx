"use client";

import { useMemo } from "react";

import { CheckboxFilterPopover } from "@/components/pdp/checkbox-filter-popover";
import {
  buildAttributeFilters,
  FIELD_TYPE,
  humanizeKey,
  SORT_OPTIONS,
  type AttrFilter,
} from "@/components/pdp/filter-bar";
import { FilterPopover, type FilterOption } from "@/components/pdp/filter-popover";
import { RangeFilterPopover } from "@/components/pdp/range-filter-popover";
import { SortPopover } from "@/components/pdp/sort-popover";
import { BottomSheet } from "@/components/pdp/mweb/bottom-sheet";
import { ChevronDownIcon, SearchIcon, SortIcon, XIcon } from "@/components/icon";
import type {
  B2b2cAttribute,
  ItemInfoGroup,
  ProductListQuery,
  Server,
} from "@/lib/partner-api";

type Filters = {
  itemInfoGroupId?: number;
  itemInfoId?: number;
  serverId?: number;
  attributes: Record<string, string>;
  keyword?: string;
  sort: NonNullable<ProductListQuery["sort"]>;
  page: number;
};

type FilterBarMobileProps = {
  hashCode: string;
  groupLabel?: string | null;
  itemLabel?: string | null;
  groups: ItemInfoGroup[];
  itemInfoGroupId?: number;
  itemInfoId?: number;
  servers: Server[];
  serverLabel?: string | null;
  serverId?: number;
  attributes: B2b2cAttribute[];
  attributeValues: Record<string, string>;
  keyword?: string;
  sort: NonNullable<ProductListQuery["sort"]>;
  onChange: (updates: Partial<Filters>) => void;
};

const CHIP =
  "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl border bg-white px-3 text-sm outline-none transition-colors duration-150";
const CHIP_DEFAULT = `${CHIP} border-(--color-border) text-(--color-text-body)`;
const CHIP_ACTIVE = `${CHIP} border-(--color-brand) text-(--color-brand)`;

export function FilterBarMobile({
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
}: FilterBarMobileProps) {
  const attributeFilters = useMemo(() => buildAttributeFilters(attributes), [attributes]);

  const groupOptions: FilterOption[] = useMemo(
    () => groups.map((g) => ({ id: g.id, name: g.name })),
    [groups],
  );

  const itemOptions: FilterOption[] = useMemo(() => {
    const activeGroup = itemInfoGroupId
      ? groups.find((g) => g.id === itemInfoGroupId)
      : undefined;
    return activeGroup
      ? activeGroup.item_info.map((i) => ({ id: i.id, name: i.name }))
      : groups.flatMap((g) => g.item_info.map((i) => ({ id: i.id, name: i.name, section: g.name })));
  }, [groups, itemInfoGroupId]);

  const serverOptions: FilterOption[] = useMemo(
    () => servers.map((s) => ({ id: s.id, name: s.name })),
    [servers],
  );

  // Active filter chips for the removable strip below the filter row.
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
      const [minPart = "", maxPart = ""] = raw.split("|");
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
    <div className="flex flex-col gap-2 py-3">
      {/* Search row */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const value = String(new FormData(e.currentTarget).get("keyword") ?? "").trim();
          onChange({ keyword: value || undefined });
        }}
      >
        <label className="flex h-11 w-full items-center gap-2 rounded-2xl border border-(--color-border) bg-white px-3">
          <SearchIcon className="size-5 shrink-0 text-(--color-text-subdued)" />
          <input
            type="search"
            name="keyword"
            defaultValue={keyword}
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none"
          />
        </label>
      </form>

      {/* Filter chips row + sort icon */}
      <div className="flex items-center gap-2">
        {/* Horizontally scrollable chips */}
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {groupOptions.length > 0 && (
            <GroupChip
              label={groupLabel ?? "Tipe"}
              active={!!itemInfoGroupId}
              options={groupOptions}
              selectedId={itemInfoGroupId}
              onApply={(id) =>
                onChange({
                  itemInfoGroupId: typeof id === "number" ? id : undefined,
                  itemInfoId: undefined,
                })
              }
            />
          )}

          {itemOptions.length > 0 && (
            <GroupChip
              label={itemLabel ?? "Item"}
              active={!!itemInfoId}
              options={itemOptions}
              selectedId={itemInfoId}
              onApply={(id) =>
                onChange({ itemInfoId: typeof id === "number" ? id : undefined })
              }
            />
          )}

          {serverOptions.length > 0 && (
            <GroupChip
              label={serverLabel ?? "Server"}
              active={!!serverId}
              options={serverOptions}
              selectedId={serverId}
              onApply={(id) =>
                onChange({ serverId: typeof id === "number" ? id : undefined })
              }
            />
          )}

          {attributeFilters.map((attr) => (
            <AttrChip
              key={attr.id}
              attr={attr}
              attributeValues={attributeValues}
              onChange={onChange}
            />
          ))}
        </div>

        {/* Sort icon button */}
        <BottomSheet
          renderTrigger={({ ref, onClick, open }) => (
            <button
              ref={ref}
              type="button"
              onClick={onClick}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label="Urutkan"
              className={`flex size-9 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-150 ${
                open || sort !== "popular"
                  ? "border-(--color-brand) text-(--color-brand)"
                  : "border-(--color-border) text-(--color-text-body)"
              } bg-white`}
            >
              <SortIcon className="size-5" />
            </button>
          )}
          renderContent={({ close }) => (
            <SortPopover
              options={SORT_OPTIONS}
              value={sort}
              onSelect={(v) => onChange({ sort: v })}
              onClose={close}
              sheet
            />
          )}
        />
      </div>

      {/* Active filter chips strip */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="flex items-center gap-1 rounded-full border border-(--color-border) bg-white px-2.5 py-1 text-xs text-(--color-text-body)"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Hapus ${chip.label}`}
                className="flex size-3.5 items-center justify-center text-(--color-text-subdued)"
              >
                <XIcon className="size-3" />
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
            className="text-xs font-bold text-(--color-brand)"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- helpers ----------

function GroupChip({
  label,
  active,
  options,
  selectedId,
  onApply,
}: {
  label: string;
  active: boolean;
  options: FilterOption[];
  selectedId?: number;
  onApply: (id?: number | string) => void;
}) {
  return (
    <BottomSheet
      renderTrigger={({ ref, onClick, open }) => (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={active || open ? CHIP_ACTIVE : CHIP_DEFAULT}
        >
          <span className="truncate">{label}</span>
          <ChevronDownIcon className="size-4 shrink-0" />
        </button>
      )}
      renderContent={({ close }) => (
        <FilterPopover
          title={label}
          options={options}
          selectedId={selectedId}
          searchable={options.length > 8}
          onApply={onApply}
          onClose={close}
          sheet
        />
      )}
    />
  );
}

function AttrChip({
  attr,
  attributeValues,
  onChange,
}: {
  attr: AttrFilter;
  attributeValues: Record<string, string>;
  onChange: (updates: Partial<Filters>) => void;
}) {
  const idKey = String(attr.id);
  const label = humanizeKey(attr.translationKey);
  const selected = attributeValues[idKey];
  const active = !!selected;

  if (attr.fieldType === FIELD_TYPE.FREE_TEXT) {
    const parts = selected ? selected.split("|") : ["", ""];
    const rangeValue = { min: parts[0] ?? "", max: parts[1] ?? "" };
    return (
      <BottomSheet
        renderTrigger={({ ref, onClick, open }) => (
          <button
            ref={ref}
            type="button"
            onClick={onClick}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={active || open ? CHIP_ACTIVE : CHIP_DEFAULT}
          >
            <span className="truncate">{label}</span>
            <ChevronDownIcon className="size-4 shrink-0" />
          </button>
        )}
        renderContent={({ close }) => (
          <RangeFilterPopover
            title={label}
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
            sheet
          />
        )}
      />
    );
  }

  if (attr.fieldType === FIELD_TYPE.CHECKBOX) {
    const selectedArr = selected ? selected.split(",") : [];
    return (
      <BottomSheet
        renderTrigger={({ ref, onClick, open }) => (
          <button
            ref={ref}
            type="button"
            onClick={onClick}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={active || open ? CHIP_ACTIVE : CHIP_DEFAULT}
          >
            <span className="truncate">{label}</span>
            <ChevronDownIcon className="size-4 shrink-0" />
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
            sheet
          />
        )}
      />
    );
  }

  // RADIO (single-select)
  return (
    <BottomSheet
      renderTrigger={({ ref, onClick, open }) => (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={active || open ? CHIP_ACTIVE : CHIP_DEFAULT}
        >
          <span className="truncate">{label}</span>
          <ChevronDownIcon className="size-4 shrink-0" />
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
          sheet
        />
      )}
    />
  );
}
