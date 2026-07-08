"use client";

import { useEffect, useState } from "react";

import { XIcon } from "@/components/icon";

export type RangeValue = { min: string; max: string };

type RangeFilterPopoverProps = {
  /** Displayed in the dialog header bar. */
  title: string;
  /** Bold label shown above the inputs (e.g. the attribute name). */
  sectionLabel: string;
  /** Current range selection. */
  value?: Partial<RangeValue>;
  /** Hard lower bound from validation_rules. */
  constraintMin?: string;
  /** Hard upper bound from validation_rules. */
  constraintMax?: string;
  onApply: (value?: Partial<RangeValue>) => void;
  onClose: () => void;
  sheet?: boolean;
};

export function RangeFilterPopover({
  title,
  sectionLabel,
  value,
  constraintMin,
  constraintMax,
  onApply,
  onClose,
  sheet = false,
}: RangeFilterPopoverProps) {
  const [min, setMin] = useState(value?.min ?? "");
  const [max, setMax] = useState(value?.max ?? "");

  useEffect(() => {
    setMin(value?.min ?? "");
    setMax(value?.max ?? "");
  }, [value?.min, value?.max]);

  function handleApply() {
    let minNum = min !== "" ? Number(min) : undefined;
    let maxNum = max !== "" ? Number(max) : undefined;

    // Clamp each value to the hard bounds from validation_rules.
    const cMin = constraintMin !== undefined ? Number(constraintMin) : undefined;
    const cMax = constraintMax !== undefined ? Number(constraintMax) : undefined;
    if (cMin !== undefined) {
      if (minNum !== undefined) minNum = Math.max(cMin, minNum);
      if (maxNum !== undefined) maxNum = Math.max(cMin, maxNum);
    }
    if (cMax !== undefined) {
      if (minNum !== undefined) minNum = Math.min(cMax, minNum);
      if (maxNum !== undefined) maxNum = Math.min(cMax, maxNum);
    }

    // Swap inverted range so min is always ≤ max.
    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      [minNum, maxNum] = [maxNum, minNum];
    }

    const result: Partial<RangeValue> = {};
    if (minNum !== undefined) result.min = String(minNum);
    if (maxNum !== undefined) result.max = String(maxNum);
    onApply(Object.keys(result).length > 0 ? result : undefined);
    onClose();
  }

  function handleReset() {
    setMin("");
    setMax("");
  }

  return (
    <div
      role="dialog"
      aria-label={title}
      className={
        sheet
          ? "flex h-full min-h-0 flex-col overflow-hidden"
          : "flex w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.15)]"
      }
    >
      {sheet && (
        <div className="flex items-center px-4 pb-1.5 pt-3">
          <h3 className="flex-1 font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center text-(--color-text-subdued) hover:text-(--color-text-body)"
          >
            <XIcon className="size-5" />
          </button>
        </div>
      )}
      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {sectionLabel !== title && (
          <p className="mb-3 text-sm font-bold text-(--color-text-title)">{sectionLabel}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--color-text-subdued)">Minimum</label>
            <input
              type="number"
              value={min}
              min={constraintMin}
              max={constraintMax}
              onChange={(e) => setMin(e.target.value)}
              placeholder={constraintMin ?? "0"}
              className="h-10 w-full rounded-xl border border-(--color-border) bg-white px-3 text-sm text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none focus:border-(--color-brand) [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--color-text-subdued)">Maksimum</label>
            <input
              type="number"
              value={max}
              min={constraintMin}
              max={constraintMax}
              onChange={(e) => setMax(e.target.value)}
              placeholder={constraintMax ?? "0"}
              className="h-10 w-full rounded-xl border border-(--color-border) bg-white px-3 text-sm text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none focus:border-(--color-brand) [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center gap-2 border-t border-(--color-border-low) px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleReset}
          className="h-10 flex-1 rounded-full border border-(--color-brand) bg-white text-sm font-bold text-(--color-brand) transition hover:bg-(--color-surface-focus, #e8f2ff)"
        >
          Reset Filter
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="h-10 flex-1 rounded-full bg-(--color-brand) text-sm font-bold text-white transition hover:opacity-90"
        >
          Terapkan
        </button>
      </div>
    </div>
  );
}
