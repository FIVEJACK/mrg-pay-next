"use client";

import { useState } from "react";

import { formatPriceIDR } from "@/lib/format";
import { ChevronDownIcon, ShieldFilledIcon, XIcon } from "@/components/icon";

type CheckoutBottomBarProps = {
  total: number;
  subtotal: number;
  adminFee: number;
  /** Selected payment method name, shown in the expanded detail popup. */
  methodName: string | null;
  ctaLabel: string;
  ctaDisabled: boolean;
  submitting: boolean;
  onSubmit: () => void;
};

export function CheckoutBottomBar({
  total,
  subtotal,
  adminFee,
  methodName,
  ctaLabel,
  ctaDisabled,
  submitting,
  onSubmit,
}: CheckoutBottomBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {expanded && (
        <div
          className="animate-fade-in fixed inset-0 z-30 bg-black/40"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-[640px]">
          {expanded && (
            <div className="animate-slide-up flex flex-col gap-3 rounded-t-2xl bg-white p-4 shadow-[0px_-1px_2px_rgba(0,0,0,0.02),0px_-10px_20px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-[family-name:var(--font-heading)] text-base font-bold leading-5 text-(--color-text-title)">
                  Detail Pembayaran
                </h3>
                <button
                  type="button"
                  aria-label="Tutup"
                  onClick={() => setExpanded(false)}
                  className="text-(--color-text-secondary) transition hover:text-(--color-text-body)"
                >
                  <XIcon className="size-6" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <DetailRow label="Metode pembayaran" value={methodName ?? "—"} />
                <div className="h-px w-full bg-(--color-border)" />
                <DetailRow label="Total pesanan" value={formatPriceIDR(subtotal)} />
                <DetailRow label="Biaya admin" value={formatPriceIDR(adminFee)} />
                <div className="h-px w-full bg-(--color-border)" />
                <DetailRow label="Total pembayaran" value={formatPriceIDR(total)} emphasized />
              </div>

              <div className="h-px w-full bg-(--color-border)" />
              <p className="text-center font-[family-name:var(--font-heading)] text-xs leading-4 text-(--color-text-subdued)">
                Dengan melanjutkan, saya setuju dengan{" "}
                <span className="text-(--color-brand)">Syarat &amp; Ketentuan</span> yang berlaku di
                Lapakgaming.
              </p>
            </div>
          )}

          <div className="bg-white shadow-[0px_-1px_2px_rgba(0,0,0,0.02),0px_-10px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-4 px-4 py-3">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
              >
                <span className="text-xs leading-4 text-(--color-text-secondary)">
                  Total pembayaran
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-[family-name:var(--font-heading)] text-base font-bold leading-5 text-(--color-text-title)">
                    {formatPriceIDR(total)}
                  </span>
                  <ChevronDownIcon
                    className={`size-5 text-(--color-text-title) transition-transform duration-200 ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={ctaDisabled || submitting}
                className="flex shrink-0 items-center justify-center rounded-full bg-(--color-brand) px-12 py-3.5 font-[family-name:var(--font-heading)] text-base font-bold leading-5 text-white transition hover:bg-(--color-brand-hover) disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Memproses…" : ctaLabel}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 bg-[#e5f6fd] px-4 py-1.5">
              <ShieldFilledIcon className="size-4 shrink-0" />
              <p className="font-[family-name:var(--font-heading)] text-center text-xs leading-4 text-(--color-text-secondary)">
                Transaksi Aman • Jaminan Uang Kembali
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`font-[family-name:var(--font-heading)] text-sm leading-5 ${
          emphasized ? "font-bold text-(--color-text-title)" : "text-(--color-text-subdued)"
        }`}
      >
        {label}
      </span>
      <span
        className={`ml-auto text-right font-[family-name:var(--font-heading)] text-sm leading-5 ${
          emphasized ? "font-bold text-(--color-text-title)" : "text-(--color-text-title)"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
