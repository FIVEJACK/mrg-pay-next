"use client";

import { useMemo, useState } from "react";

import { SearchIcon } from "@/components/icon";
import type { FilterOption, FilterOptionId } from "./filter-popover";

export type { FilterOption, FilterOptionId };


type CheckboxFilterPopoverProps = {
  title: string;
  options: FilterOption[];
  selectedIds?: FilterOptionId[];
  searchable?: boolean;
  onApply: (ids: FilterOptionId[]) => void;
  onClose: () => void;
};

export function CheckboxFilterPopover({
  title,
  options,
  selectedIds = [],
  searchable = true,
  onApply,
  onClose,
}: CheckboxFilterPopoverProps) {
  const [staged, setStaged] = useState<FilterOptionId[]>(selectedIds);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  const sections = useMemo(() => {
    const map = new Map<string, FilterOption[]>();
    for (const o of filtered) {
      const key = o.section ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function toggle(id: FilterOptionId) {
    setStaged((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-1.5">
        {sections.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--color-text-subdued)">
            Tidak ada hasil
          </p>
        ) : (
          sections.map(([sectionName, items]) => (
            <div key={sectionName || "_default"} className="mb-2 last:mb-0">
              {sectionName && (
                <p className="py-2 text-sm font-bold text-(--color-text-title)">
                  {sectionName}
                </p>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {items.map((opt) => (
                  <CheckboxRow
                    key={opt.id}
                    label={opt.name}
                    checked={staged.includes(opt.id)}
                    onChange={() => toggle(opt.id)}
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
          onClick={() => setStaged([])}
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

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 py-1.5 text-sm ${
        checked ? "text-(--color-brand)" : "text-(--color-text-body)"
      }`}
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          checked
            ? "border-(--color-brand) bg-(--color-brand)"
            : "border-(--color-border) bg-white"
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-2.5"
          >
            <path
              d="M1 3.5L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span className="truncate">{label}</span>
    </label>
  );
}
