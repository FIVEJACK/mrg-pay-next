"use client";

import { useEffect, useMemo, useState } from "react";

import { SearchIcon } from "@/components/icon";

export type FilterOptionId = number | string;

export type FilterOption = {
  id: FilterOptionId;
  name: string;
  /** Optional grouping label (e.g. "Popular"). All options sharing the same `section` render together. */
  section?: string;
};

type FilterPopoverProps = {
  title: string;
  options: FilterOption[];
  selectedId?: FilterOptionId;
  /** Section chips rendered as a row above the list. Pass undefined to hide. */
  sectionChips?: { id: string | null; label: string }[];
  activeSectionId?: string | null;
  onSectionChange?: (id: string | null) => void;
  /** Show search input. */
  searchable?: boolean;
  /** Apply the staged selection. */
  onApply: (id?: FilterOptionId) => void;
  /** Close popover (called for cancel + after apply). */
  onClose: () => void;
};

export function FilterPopover({
  title,
  options,
  selectedId,
  sectionChips,
  activeSectionId,
  onSectionChange,
  searchable = true,
  onApply,
  onClose,
}: FilterPopoverProps) {
  // Staged selection — apply only on "Apply".
  const [staged, setStaged] = useState<FilterOptionId | undefined>(selectedId);
  const [query, setQuery] = useState("");

  // Reset staged value when popover re-mounts with a different selectedId.
  useEffect(() => {
    setStaged(selectedId);
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  // Group by section so we can render headers like "Popular".
  const sections = useMemo(() => {
    const map = new Map<string, FilterOption[]>();
    for (const o of filtered) {
      const key = o.section ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const useTwoColumns = filtered.length > 6;

  return (
    <div
      role="dialog"
      aria-label={title}
      className="flex h-full max-h-[520px] w-[380px] flex-col overflow-hidden overscroll-contain rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-center px-4 pb-1.5 pt-3">
        <h3 className="flex-1 font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
          {title}
        </h3>
      </div>

      {searchable && (
        <div className="px-4 py-1.5">
          <label className="flex h-9 w-full items-center gap-2 rounded-xl border border-(--color-border) bg-white px-3">
            <SearchIcon className="size-5 text-(--color-text-subdued)" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none"
            />
          </label>
        </div>
      )}

      {sectionChips && sectionChips.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-1.5">
          {sectionChips.map((c) => {
            const active = (c.id ?? null) === (activeSectionId ?? null);
            return (
              <button
                key={c.id ?? "_all"}
                type="button"
                onClick={() => onSectionChange?.(c.id)}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  active
                    ? "bg-(--color-brand) text-white"
                    : "border border-(--color-border) bg-white text-(--color-text-body) hover:border-(--color-brand)"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-1.5">
        {sections.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--color-text-subdued)">
            No matches
          </p>
        ) : (
          sections.map(([sectionName, items]) => (
            <div key={sectionName || "_default"} className="mb-2 last:mb-0">
              {sectionName && (
                <p className="py-2 text-sm font-bold text-(--color-text-title)">
                  {sectionName}
                </p>
              )}
              <div
                className={
                  useTwoColumns
                    ? "grid grid-cols-2 gap-x-3 gap-y-1"
                    : "flex flex-col gap-1"
                }
              >
                {items.map((opt) => (
                  <RadioRow
                    key={opt.id}
                    label={opt.name}
                    checked={staged === opt.id}
                    onChange={() => setStaged(opt.id)}
                  />

                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-(--color-border-low) px-4 py-3">
        <button
          type="button"
          onClick={() => setStaged(undefined)}
          className="h-10 flex-1 rounded-full border border-(--color-brand) bg-white text-sm font-bold text-(--color-brand) transition hover:bg-(--color-surface-focus, #e8f2ff)"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => {
            onApply(staged);
            onClose();
          }}
          className="h-10 flex-1 rounded-full bg-(--color-brand) text-sm font-bold text-white transition hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-(--color-text-body)">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? "border-(--color-brand)" : "border-(--color-border)"
        }`}
      >
        {checked && <span className="size-2 rounded-full bg-(--color-brand)" />}
      </span>
      <input
        type="radio"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span className="truncate">{label}</span>
    </label>
  );
}
