"use client";

import { formatPriceIDR } from "@/lib/format";

import { InfoIcon, ShieldFilledIcon } from "@/components/icon";

type PaymentDetailSidebarProps = {
  subtotal: number;
  adminFee: number;
  total: number;
  ctaLabel: string;
  ctaDisabled: boolean;
  submitting: boolean;
  errorMessage?: string | null;
  onSubmit: () => void;
};

export function PaymentDetailSidebar({
  subtotal,
  adminFee,
  total,
  ctaLabel,
  ctaDisabled,
  submitting,
  errorMessage,
  onSubmit,
}: PaymentDetailSidebarProps) {
  return (
    <aside className="sticky top-24 flex w-full max-w-[427px] flex-col gap-4 rounded-2xl border border-(--color-border-low) bg-white px-6 py-4">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Detail Pembayaran
      </h2>

      <div className="flex flex-col gap-3">
        <Row label="Total Pesanan" value={formatPriceIDR(subtotal)} />
        <Row
          label={
            <span className="flex items-center gap-1">
              Biaya Admin
              <InfoIcon className="size-5 text-(--color-text-subdued)" />
            </span>
          }
          value={formatPriceIDR(adminFee)}
        />
        <div className="h-px w-full bg-(--color-border)" />
        <Row label="Total Pembayaran" value={formatPriceIDR(total)} emphasized />
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={ctaDisabled || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-(--color-brand) px-10 py-4 font-[family-name:var(--font-heading)] text-base font-bold leading-5 text-white transition hover:bg-(--color-brand-hover) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Memproses…" : ctaLabel}
        </button>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-md bg-(--color-bg-subtle) px-3 py-2 text-xs leading-4 text-(--color-promotion)"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex items-start justify-center gap-2">
          <ShieldFilledIcon className="size-6 shrink-0" />
          <p className="font-[family-name:var(--font-heading)] text-center text-sm leading-6 text-(--color-text-secondary)">
            Pembayaran Aman • Jaminan Uang Kembali
          </p>
        </div>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  emphasized,
}: {
  label: React.ReactNode;
  value: string;
  emphasized?: boolean;
}) {
  const cls = emphasized
    ? "font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)"
    : "font-[family-name:var(--font-heading)] text-base leading-6 text-(--color-text-secondary)";
  return (
    <div className="flex items-center gap-4">
      <span className={cls}>{label}</span>
      <span
        className={`ml-auto text-right ${
          emphasized
            ? "font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)"
            : "font-[family-name:var(--font-heading)] text-base leading-6 text-(--color-text-title)"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
