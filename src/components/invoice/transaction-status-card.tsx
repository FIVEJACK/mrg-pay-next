"use client";

import { MrgImage } from "@/components/shared/mrg-image";
import { useEffect, useState } from "react";

import { ClockIcon } from "@/components/icon";
import { formatPriceIDR } from "@/lib/format";
import type { TransactionDetail } from "@/lib/partner-api";

import { StepProgress } from "./step-progress";

export type InvoiceState = "pending" | "on_process" | "completed" | "expired";

type Props = {
  state: InvoiceState;
  transaction: TransactionDetail;
  bare?: boolean;
};

function wrapClass(bare?: boolean) {
  return bare
    ? "flex w-full flex-col gap-4 bg-white px-4 py-5"
    : "flex w-full flex-col gap-4 rounded-2xl border border-(--color-border-low) bg-white p-6";
}

export function TransactionStatusCard({ state, transaction, bare }: Props) {
  if (state === "pending") return <PendingCard transaction={transaction} bare={bare} />;
  if (state === "expired") return <ExpiredCard transaction={transaction} bare={bare} />;
  return <OnProcessCard transaction={transaction} state={state} bare={bare} />;
}

function OnProcessCard({
  transaction,
  state,
  bare,
}: {
  transaction: TransactionDetail;
  state: "on_process" | "completed";
  bare?: boolean;
}) {
  const isCompleted = state === "completed";
  return (
    <section className={wrapClass(bare)}>
      <header>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
          {isCompleted ? "Transaksi selesai" : "Transaksi sedang diproses"}
        </h2>
        <p className="mt-1 text-sm leading-5 text-(--color-text-body)">
          {isCompleted
            ? "Terima kasih sudah berbelanja!"
            : (
              <>
                Lanjutkan transaksi menggunakan{" "}
                <strong className="font-bold">chat</strong> ya!
              </>
            )}
        </p>
      </header>

      <div className="my-2 px-4">
        <StepProgress active={isCompleted ? "selesai" : "diproses"} />
      </div>

      <TransactionMeta transaction={transaction} />
    </section>
  );
}

function PendingCard({
  transaction,
  bare,
}: {
  transaction: TransactionDetail;
  bare?: boolean;
}) {
  const total = toNumber(transaction.invoice_amount);
  const checkoutUrl =
    transaction.direct_payment?.checkoutUrl ??
    transaction.direct_payment?.gateway?.url ??
    transaction.payment_url ??
    null;

  return (
    <section className={wrapClass(bare)}>
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
          Bayar transaksi kamu, yuk!
        </h2>
        {transaction.payment_due_date && (
          <CountdownPill deadline={transaction.payment_due_date} />
        )}
      </header>

      {(transaction.payment_method_name || total) && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-(--color-brand) bg-(--color-surface-focus) px-6 py-4">
          <div className="flex items-center gap-3">
            {transaction.payment_method_media_url && (
              <MrgImage
                src={transaction.payment_method_media_url}
                alt=""
                width={48}
                height={24}
                className="h-6 w-auto object-contain"
                unoptimized
              />
            )}
            <div>
              <p className="text-xs leading-4 text-(--color-text-subdued)">
                Metode pembayaran
              </p>
              <p className="font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)">
                {transaction.payment_method_name ?? "—"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs leading-4 text-(--color-text-subdued)">
              Total pembayaran
            </p>
            <p className="font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)">
              {formatPriceIDR(total)}
            </p>
          </div>
        </div>
      )}

      <TransactionMeta transaction={transaction} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--color-border-low) pt-4">
        <p className="max-w-md text-xs leading-4 text-(--color-text-subdued)">
          <strong className="font-bold text-(--color-text-body)">Catatan:</strong>{" "}
          Jika kamu sudah bayar, mohon tunggu sebentar hingga kami terima status pembayaran
          dari sistem.
        </p>
        {checkoutUrl && (
          <a
            href={checkoutUrl}
            className="rounded-full border-2 border-(--color-brand) px-4 py-2 text-sm font-bold text-(--color-brand) transition hover:bg-(--color-surface-focus)"
          >
            Lanjutkan pembayaran
          </a>
        )}
      </div>
    </section>
  );
}

function ExpiredCard({
  transaction,
  bare,
}: {
  transaction: TransactionDetail;
  bare?: boolean;
}) {
  return (
    <section className={wrapClass(bare)}>
      <header>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
          Transaksi sudah kedaluwarsa
        </h2>
        <p className="mt-1 text-sm leading-5 text-(--color-text-body)">
          Kamu bisa buat transaksi yang baru ya!
        </p>
      </header>
      <TransactionMeta transaction={transaction} />
    </section>
  );
}

function TransactionMeta({ transaction }: { transaction: TransactionDetail }) {
  const trxNumber = transaction.transaction_number ?? `#${transaction.id}`;
  return (
    <dl className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <dt className="w-[200px] shrink-0 text-sm text-(--color-text-subdued)">
          No. transaksi
        </dt>
        <dd className="flex min-w-0 flex-1 items-center gap-2">
          <span className="font-[family-name:var(--font-heading)] truncate text-sm text-(--color-text-title)">
            {trxNumber}
          </span>
          <CopyButton value={trxNumber} />
        </dd>
      </div>
      {transaction.created_at && (
        <div className="flex items-center gap-4">
          <dt className="w-[200px] shrink-0 text-sm text-(--color-text-subdued)">
            Waktu transaksi
          </dt>
          <dd className="min-w-0 flex-1 font-[family-name:var(--font-heading)] text-sm text-(--color-text-title)">
            {formatTransactionDate(transaction.created_at)}
          </dd>
        </div>
      )}
    </dl>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-bold text-(--color-brand) transition hover:underline"
    >
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

function CountdownPill({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState(() => calcRemaining(deadline));

  useEffect(() => {
    // Re-seed when deadline changes (lazy init only runs on first mount).
    setRemaining(calcRemaining(deadline));
    const id = window.setInterval(() => {
      const next = calcRemaining(deadline);
      setRemaining(next);
      if (next <= 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  return (
    <span className="flex items-center gap-1 rounded-full bg-[#FFE7E0] px-3 py-1 text-xs font-bold text-[#E42B2B]">
      <ClockIcon className="size-3.5" /> {formatRemaining(remaining)}
    </span>
  );
}

function calcRemaining(deadline: string): number {
  // Normalize "YYYY-MM-DD HH:mm:ss" → ISO for Safari parsing.
  const normalized = deadline.includes("T") ? deadline : deadline.replace(" ", "T");
  const ms = new Date(normalized).getTime() - Date.now();
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.floor(ms / 1000));
}

function formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}


function formatTransactionDate(raw: string): string {
  // The gateway returns timestamps as "YYYY-MM-DD HH:mm:ss". Safari rejects
  // that form — normalize to ISO ("YYYY-MM-DDTHH:mm:ss") before parsing.
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function toNumber(v: number | string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}
