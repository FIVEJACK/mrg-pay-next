import { MrgImage } from "@/components/shared/mrg-image";

import { formatPriceIDR } from "@/lib/format";
import type { TransactionDetail } from "@/lib/partner-api";

type PaymentDetailCardProps = {
  transaction: TransactionDetail;
  /** Hide the "Metode Pembayaran" row when the page already surfaces it (e.g. on the Pending Payment hero card). */
  hidePaymentMethod?: boolean;
  bare?: boolean;
};

export function PaymentDetailCard({
  transaction,
  hidePaymentMethod = false,
  bare,
}: PaymentDetailCardProps) {
  const subtotal = toNumber(transaction.total_order_value ?? transaction.total_buyer_order_value);
  const fee = toNumber(transaction.total_payment_fee);
  const total = toNumber(transaction.invoice_amount ?? subtotal + fee);

  return (
    <section
      className={
        bare
          ? "flex w-full flex-col gap-4 bg-white px-4 py-5"
          : "flex w-full flex-col gap-4 rounded-2xl border border-(--color-border-low) bg-white p-6"
      }
    >
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Detail Pembayaran
      </h2>

      <div className="flex flex-col gap-3">
        {!hidePaymentMethod && transaction.payment_method_name && (
          <Row
            label="Metode Pembayaran"
            value={transaction.payment_method_name}
            mediaUrl={transaction.payment_method_media_url}
          />
        )}
        <Row label="Total Pesanan" value={formatPriceIDR(subtotal)} />
        <Row label="Biaya Admin" value={formatPriceIDR(fee)} />
        <div className="h-px w-full bg-(--color-border)" />
        <Row label="Total Pembayaran" value={formatPriceIDR(total)} emphasized />
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  mediaUrl,
  emphasized,
}: {
  label: React.ReactNode;
  value: string;
  mediaUrl?: string | null;
  emphasized?: boolean;
}) {
  const cls = emphasized
    ? "font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)"
    : "font-[family-name:var(--font-heading)] text-base leading-6 text-(--color-text-secondary)";
  const valueCls = emphasized
    ? "font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)"
    : "font-[family-name:var(--font-heading)] text-base leading-6 text-(--color-text-title)";
  return (
    <div className="flex items-center gap-4">
      <span className={cls}>{label}</span>
      <span className={`ml-auto flex items-center gap-2 text-right ${valueCls}`}>
        {mediaUrl && (
          <MrgImage
            src={mediaUrl}
            alt=""
            width={40}
            height={20}
            className="h-5 w-auto object-contain"
            unoptimized
          />
        )}
        {value}
      </span>
    </div>
  );
}

function toNumber(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}
