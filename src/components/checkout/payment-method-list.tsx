"use client";

import { useMemo, useState } from "react";

import { formatPriceIDR } from "@/lib/format";
import { calculatePaymentFee, checkPaymentMethodLimit } from "@/lib/partner-api";
import type { PaymentGroup, PaymentLimitViolation, PaymentMethod } from "@/lib/partner-api";

import { ChevronRightIcon } from "@/components/icon";

import { PaymentMethodModal } from "./payment-method-modal";

type PaymentMethodListProps = {
  groups: PaymentGroup[] | null;
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Order subtotal — feeds the tiered `(amount + fixed_fee) * fixed_rate%` calc. */
  amount: number;
  /** How many methods to show before collapsing the rest behind "+N lainnya". */
  initialVisibleCount?: number;
};

function flatten(groups: PaymentGroup[] | null): PaymentMethod[] {
  if (!groups) return [];
  return groups
    .filter((g) => g.is_active === 1)
    .flatMap((g) => g.payment_method_list.filter((m) => m.is_active === 1));
}

export function PaymentMethodList({
  groups,
  loading,
  error,
  selectedId,
  onSelect,
  amount,
  initialVisibleCount = 3,
}: PaymentMethodListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const all = useMemo(() => flatten(groups), [groups]);

  if (loading) {
    return (
      <section className="flex w-full flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
          Metode Pembayaran
        </h2>
        <div className="rounded-2xl border border-(--color-border-low) bg-white p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[68px] animate-pulse rounded-2xl border border-(--color-border-low) bg-(--color-bg-subtle)"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex w-full flex-col gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
          Metode Pembayaran
        </h2>
        <div className="rounded-2xl border border-(--color-border-low) bg-white p-6 text-sm text-(--color-promotion)">
          Gagal memuat metode pembayaran: {error}
        </div>
      </section>
    );
  }

  // Pin the currently-selected method into the inline preview, so the user
  // always sees what they picked even if the full list is hidden behind the
  // modal.
  const selectedIndex = selectedId != null ? all.findIndex((m) => m.id === selectedId) : -1;
  const showAll = all.length <= initialVisibleCount + 1;
  const baseVisible = showAll ? all : all.slice(0, initialVisibleCount);
  const visible =
    !showAll && selectedIndex >= initialVisibleCount
      ? [...baseVisible.slice(0, initialVisibleCount - 1), all[selectedIndex]]
      : baseVisible;
  const hidden = showAll ? [] : all.slice(initialVisibleCount);

  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Metode Pembayaran
      </h2>
      <div className="rounded-2xl border border-(--color-border-low) bg-white p-6">
        <div role="radiogroup" aria-label="Metode Pembayaran" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((m) => {
            const violation = checkPaymentMethodLimit(m, amount);
            return (
              <PaymentCard
                key={m.id}
                method={m}
                fee={calculatePaymentFee(m, amount)}
                selected={m.id === selectedId}
                violation={violation}
                onSelect={() => onSelect(m.id)}
              />
            );
          })}

          {hidden.length > 0 && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex h-[68px] min-w-0 items-center gap-3 rounded-2xl border border-(--color-border-low) bg-white px-6 transition hover:border-(--color-border) hover:bg-(--color-bg-subtle)"
            >
              <span className="flex flex-1 items-center gap-3 text-left">
                <span className="flex items-center gap-2">
                  {hidden.slice(0, 3).map((m) => (
                    <PaymentLogoChip key={m.id} method={m} />
                  ))}
                </span>
                <span className="font-[family-name:var(--font-heading)] text-base leading-6 text-(--color-text-secondary)">
                  +{hidden.length} lainnya
                </span>
              </span>
              <ChevronRightIcon className="size-6 text-(--color-text-secondary)" />
            </button>
          )}
        </div>
      </div>

      <PaymentMethodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        groups={groups ?? []}
        amount={amount}
        selectedId={selectedId}
        onConfirm={onSelect}
      />
    </section>
  );
}

function PaymentCard({
  method,
  fee,
  selected,
  violation,
  onSelect,
}: {
  method: PaymentMethod;
  fee: number;
  selected: boolean;
  violation: PaymentLimitViolation | null;
  onSelect: () => void;
}) {
  const disabled = violation != null;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      title={disabled ? formatLimitViolation(violation) : undefined}
      onClick={onSelect}
      className={`flex h-[68px] min-w-0 items-center gap-3 rounded-2xl px-6 py-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border border-(--color-border-low) bg-white"
          : selected
            ? "border-2 border-(--color-brand) bg-(--color-surface-focus)"
            : "border border-(--color-border-low) bg-white hover:border-(--color-border)"
      }`}
    >
      <PaymentLogoChip method={method} />
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={`truncate font-[family-name:var(--font-heading)] text-base leading-6 ${
              disabled ? "text-(--color-text-disabled)" : "text-(--color-text-secondary)"
            }`}
          >
            {method.name}
          </span>
          {disabled && (
            <span className="truncate text-sm leading-5 text-(--color-promotion)">
              {formatLimitViolation(violation)}
            </span>
          )}
        </span>
        <span
          className={`ml-auto whitespace-nowrap font-[family-name:var(--font-heading)] text-sm leading-6 ${
            disabled ? "text-(--color-text-disabled)" : "text-(--color-text-secondary)"
          }`}
        >
          {fee > 0 ? formatPriceIDR(fee) : "Gratis"}
        </span>
      </span>
    </button>
  );
}

function formatLimitViolation(v: PaymentLimitViolation | null): string {
  if (!v) return "";
  return v.type === "below_min"
    ? `Min. Pembayaran ${formatPriceIDR(v.limit)}`
    : `Maks. Pembayaran ${formatPriceIDR(v.limit)}`;
}

function PaymentLogoChip({ method }: { method: PaymentMethod }) {
  if (method.media_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={method.media_url}
        alt=""
        className="h-8 w-14 shrink-0 object-contain"
        loading="lazy"
      />
    );
  }
  return (
    <span className="flex h-8 w-14 shrink-0 items-center justify-center rounded-sm bg-(--color-bg-subtle) text-[11px] font-bold leading-none text-(--color-text-secondary)">
      {method.name.slice(0, 4).toUpperCase()}
    </span>
  );
}
