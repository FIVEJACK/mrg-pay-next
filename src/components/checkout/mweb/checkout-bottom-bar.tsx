"use client";

import { formatPriceIDR } from "@/lib/format";
import { ShieldFilledIcon } from "@/components/icon";

type CheckoutBottomBarProps = {
  total: number;
  ctaLabel: string;
  ctaDisabled: boolean;
  submitting: boolean;
  errorMessage?: string | null;
  onSubmit: () => void;
};

export function CheckoutBottomBar({
  total,
  ctaLabel,
  ctaDisabled,
  submitting,
  errorMessage,
  onSubmit,
}: CheckoutBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-(--color-border-low) bg-white">
      {errorMessage && (
        <p
          role="alert"
          className="mx-4 mt-3 rounded-md bg-(--color-bg-subtle) px-3 py-2 text-xs leading-4 text-(--color-promotion)"
        >
          {errorMessage}
        </p>
      )}

      <div className="mx-auto flex max-w-[640px] items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-xs leading-4 text-(--color-text-secondary)">
            Total Pembayaran
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg font-bold leading-6 text-(--color-text-title)">
            {formatPriceIDR(total)}
          </span>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={ctaDisabled || submitting}
          className="ml-auto flex shrink-0 items-center justify-center rounded-full bg-(--color-brand) px-12 py-3.5 font-[family-name:var(--font-heading)] text-base font-bold leading-5 text-white transition hover:bg-(--color-brand-hover) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Memproses…" : ctaLabel}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-(--color-border-low) px-4 py-2">
        <ShieldFilledIcon className="size-5 shrink-0" />
        <p className="font-[family-name:var(--font-heading)] text-center text-xs leading-5 text-(--color-text-secondary)">
          Transaksi Aman • Jaminan Uang Kembali
        </p>
      </div>
    </div>
  );
}
