"use client";

import { MrgImage } from "@/components/shared/mrg-image";
import { useMemo } from "react";

import { formatPriceIDR } from "@/lib/format";
import type { RequiredInfoField } from "@/lib/partner-api";

import { ChevronDownIcon, InfoIcon, MinusIcon, PlusIcon } from "@/components/icon";
import { Popover } from "@/components/pdp/popover";
import { SortPopover } from "@/components/pdp/sort-popover";

type OrderSummaryCardProps = {
  productName: string;
  productSubtitle?: string | null;
  productImageUrl?: string | null;
  unitPrice: number;
  /** Pre-discount unit price shown inline in the desktop product subtitle. Defaults to `unitPrice`. */
  basePrice?: number;
  quantity: number;
  maxQuantity?: number;
  onQuantityChange: (next: number) => void;
 requiredInfoFields: RequiredInfoField[];
  requiredInfoLoading?: boolean;
  requiredInfoValues: Record<string, string>;
  onRequiredInfoChange: (fieldName: string, value: string) => void;
  requiredInfoErrors?: Record<string, string>;
  bare?: boolean;
  wholesale?: boolean;
};

export function OrderSummaryCard({
  productName,
  productSubtitle,
  productImageUrl,
  unitPrice,
  basePrice,
  quantity,
  maxQuantity,
  onQuantityChange,
  requiredInfoFields,
  requiredInfoLoading = false,
  requiredInfoValues,
  onRequiredInfoChange,
  requiredInfoErrors,
  bare = false,
  wholesale = false,
}: OrderSummaryCardProps) {
  const decDisabled = quantity <= 1;
  const incDisabled = maxQuantity !== undefined && quantity >= maxQuantity;

  const productInfo = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-subtle)">
        {productImageUrl ? (
          <MrgImage
            src={productImageUrl}
            alt=""
            width={48}
            height={48}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-[family-name:var(--font-heading)] truncate text-sm font-bold leading-5 text-(--color-text-title)">
          {productName}
        </p>
        {productSubtitle && (
          <p className="font-[family-name:var(--font-heading)] truncate text-xs leading-4 text-(--color-text-subdued)">
            {productSubtitle}
          </p>
        )}
      </div>
    </div>
  );

  // Mobile product price: discounted price with a "Grosir" badge and the
  // struck-through original when a wholesale tier is active, otherwise just the
  // price.
  const wholesaleActive = wholesale && basePrice != null && basePrice > unitPrice;
  const price = (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <span className="font-[family-name:var(--font-heading)] whitespace-nowrap text-right text-sm font-bold leading-5 text-(--color-text-title)">
          {formatPriceIDR(unitPrice)}
        </span>
        {wholesaleActive && (
          <span className="rounded bg-[#fdeded] px-1 py-0.5 text-[11px] leading-[14px] text-(--color-promotion)">
            Grosir
          </span>
        )}
      </div>
      {wholesaleActive && (
        <span className="whitespace-nowrap text-xs leading-4 text-(--color-text-subdued) line-through">
          {formatPriceIDR(basePrice)}
        </span>
      )}
    </div>
  );

  const stepper = (
    <div className="flex h-11 w-[160px] items-stretch">
      <button
        type="button"
        aria-label="Kurangi jumlah"
        disabled={decDisabled}
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        className="flex size-11 items-center justify-center rounded-l-2xl border border-r-0 border-(--color-border) bg-white text-(--color-text-body) transition enabled:hover:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:text-(--color-text-disabled)"
      >
        <MinusIcon className="size-6" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={quantity}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "");
          if (digits === "") return;
          const n = parseInt(digits, 10);
          if (!Number.isFinite(n) || n < 1) return;
          onQuantityChange(maxQuantity ? Math.min(maxQuantity, n) : n);
        }}
        className="h-11 w-full appearance-none border border-(--color-border) bg-white text-center text-base leading-5 text-(--color-text-body) outline-none focus:border-(--color-brand)"
        aria-label="Jumlah"
      />
      <button
        type="button"
        aria-label="Tambah jumlah"
        disabled={incDisabled}
        onClick={() =>
          onQuantityChange(maxQuantity ? Math.min(maxQuantity, quantity + 1) : quantity + 1)
        }
        className="flex size-11 items-center justify-center rounded-r-2xl border border-l-0 border-(--color-border) bg-white text-(--color-text-body) transition enabled:hover:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:text-(--color-text-disabled)"
      >
        <PlusIcon className="size-6" />
      </button>
    </div>
  );

  // Desktop product header: the unit price lives inline in the subtitle
  // (e.g. "Fish It! • Rp20.000") instead of a separate right-aligned block.
  const productInfoWithPrice = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-subtle)">
        {productImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={productImageUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-[family-name:var(--font-heading)] truncate text-base font-bold leading-6 text-(--color-text-title)">
          {productName}
        </p>
        <div className="flex min-w-0 items-center gap-2 font-[family-name:var(--font-heading)] text-sm leading-5 text-(--color-text-subdued)">
          {productSubtitle && <span className="truncate">{productSubtitle}</span>}
          {productSubtitle && (
            <span className="size-1 shrink-0 rounded-full bg-(--color-text-subdued)" />
          )}
          <span className="shrink-0 whitespace-nowrap">{formatPriceIDR(basePrice ?? unitPrice)}</span>
        </div>
      </div>
    </div>
  );

  const stockLabel = maxQuantity !== undefined && (
    <div className="flex shrink-0 items-center gap-1 whitespace-nowrap font-[family-name:var(--font-heading)] text-base leading-5">
      <span className="text-(--color-text-subdued)">Stok:</span>
      <span className="font-bold text-(--color-text-secondary)">{maxQuantity}</span>
    </div>
  );

  const showDivider = requiredInfoLoading || requiredInfoFields.length > 0;

  const requiredInfo = requiredInfoLoading ? (
    <div className="h-11 w-full max-w-[410px] animate-pulse rounded-2xl bg-(--color-bg-subtle)" />
  ) : (
    requiredInfoFields.length > 0 && (
      // Desktop lays the fields out two-per-row (matching the design's Order
      // Info grid); mobile keeps them stacked in a single column.
      <div className={bare ? "flex flex-col gap-4" : "grid grid-cols-2 gap-4"}>
        {requiredInfoFields.map((field) => (
          <RequiredInfoInput
            key={field.id}
            field={field}
            value={requiredInfoValues[field.field_name] ?? ""}
            onChange={(v) => onRequiredInfoChange(field.field_name, v)}
            error={requiredInfoErrors?.[field.field_name]}
          />
        ))}
      </div>
    )
  );

  return (
    <section
      className={`flex w-full flex-col gap-3 ${bare ? "bg-white px-4 py-5" : ""}`}
    >
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Pesanan kamu
      </h2>
      <div
        className={
          bare
            ? "flex w-full flex-col gap-4"
            : "flex w-full flex-col gap-4 rounded-2xl border border-(--color-border-low) bg-white p-6"
        }
      >
        {bare ? (
          // Mobile design order: product + price → buyer field(s) → stock + stepper.
          <>
            <div className="flex items-start justify-between gap-4">
              {productInfo}
              {price}
            </div>
            {requiredInfo}
            <div className="flex items-center gap-4">
              {stockLabel}
              <div className="ml-auto">{stepper}</div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-6">
              {productInfoWithPrice}
              <div className="flex items-center gap-4">
                {stockLabel}
                {stepper}
              </div>
            </div>
            {showDivider && <div className="h-px w-full bg-(--color-border)" />}
            {requiredInfo}
          </>
        )}
      </div>
    </section>
  );
}

function RequiredInfoInput({
  field,
  value,
  onChange,
  error,
}: {
  field: RequiredInfoField;
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  const dropdownOptions = useMemo(() => parseDropdown(field.dropdown_options), [
    field.dropdown_options,
  ]);
  const isDropdown = field.is_dropdown === 1 && dropdownOptions.length > 0;

  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="font-[family-name:var(--font-heading)] text-sm leading-5 text-(--color-text-secondary)">
        {field.name}
      </span>
      {isDropdown ? (
        <Popover
          renderTrigger={({ ref, onClick, open }) => (
            <button
              ref={ref}
              type="button"
              onClick={onClick}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={`flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border bg-(--color-surface) px-3 text-base leading-6 outline-none transition-colors duration-150 ease-out ${
                error
                  ? "border-(--color-promotion)"
                  : open
                    ? "border-(--color-brand)"
                    : "border-(--color-border) hover:border-(--color-brand)"
              } ${value ? "text-(--color-text-body)" : "text-(--color-text-subdued)"}`}
            >
              <span className="truncate">
                {value || field.placeholder || `Pilih ${field.name.toLowerCase()}`}
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
              title={field.name}
              options={dropdownOptions.map((opt) => ({ value: opt, label: opt }))}
              value={value}
              onSelect={(v) => onChange(v)}
              onClose={close}
            />
          )}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          aria-invalid={error ? true : undefined}
          className={`h-11 w-full rounded-2xl border bg-(--color-surface) px-3 text-base leading-6 text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none ${
            error
              ? "border-(--color-promotion)"
              : "border-(--color-border) focus:border-(--color-brand)"
          }`}
        />
      )}
      {error && (
        <span role="alert" className="flex items-center gap-1 text-xs leading-4 text-(--color-promotion)">
          <InfoIcon className="size-4 shrink-0" />
          {error}
        </span>
      )}
    </label>
  );
}

function parseDropdown(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
