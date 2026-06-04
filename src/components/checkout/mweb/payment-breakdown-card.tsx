"use client";

import { formatPriceIDR } from "@/lib/format";

type PaymentBreakdownCardProps = {
  subtotal: number;
  adminFee: number;
  total: number;
};

export function PaymentBreakdownCard({ subtotal, adminFee, total }: PaymentBreakdownCardProps) {
  return (
    <section className="flex w-full flex-col gap-3 bg-white px-4 py-5">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Detail Pembayaran
      </h2>
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border-low) p-4">
        <Row label="Total Pesanan" value={formatPriceIDR(subtotal)} />
        <Row label="Biaya Admin" value={formatPriceIDR(adminFee)} />
        <div className="h-px w-full bg-(--color-border)" />
        <Row label="Total Pembayaran" value={formatPriceIDR(total)} emphasized />
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`font-[family-name:var(--font-heading)] text-base leading-6 ${
          emphasized
            ? "font-bold text-(--color-text-title)"
            : "text-(--color-text-secondary)"
        }`}
      >
        {label}
      </span>
      <span
        className={`ml-auto text-right font-[family-name:var(--font-heading)] text-base leading-6 ${
          emphasized ? "font-bold text-(--color-text-title)" : "text-(--color-text-title)"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
