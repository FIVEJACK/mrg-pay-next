"use client";

import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { partnerBrowserApi, PartnerApiError } from "@/lib/partner-api/browser-client";
import type { TransactionDetail } from "@/lib/partner-api";

import { ChatPanel } from "./chat-panel";
import { OrderDetailCard } from "./order-detail-card";
import { PaymentDetailCard } from "./payment-detail-card";
import { SupportCard } from "./support-card";
import {
  TransactionStatusCard,
  type InvoiceState,
} from "./transaction-status-card";

type InvoiceClientProps = {
  transactionUuid: string;
};

export function InvoiceClient({ transactionUuid }: InvoiceClientProps) {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [userIdLabel, setUserIdLabel] = useState("User ID");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Login first (mint JWT), then fetch the transaction detail. The mint
  // endpoint sets an httpOnly cookie + returns an access_token the browser
  // client stashes for subsequent Authorization headers.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        await partnerBrowserApi.mintPartnerToken(transactionUuid, {
          signal: controller.signal,
        });
        const detail = await partnerBrowserApi.getTransactionDetail(transactionUuid, {
          signal: controller.signal,
        });
        if (cancelled) return;
        setTransaction(detail);

        // Resolve the buyer-identifier label from game.nickname (public
        // endpoint — no hash needed). Fire-and-forget; the default label is
        // already set so a failure here is non-fatal.
        const gameId = detail.orders?.[0]?.game_id;
        if (gameId) {
          partnerBrowserApi
            .getGameInfo(gameId, { signal: controller.signal })
            .then((info) => {
              if (cancelled) return;
              const label = info?.game?.nickname?.trim();
              if (label) setUserIdLabel(label);
            })
            .catch(() => {
              /* ignore — keep default label */
            });
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") return;
        if (cancelled) return;
        const msg =
          err instanceof PartnerApiError
            ? `${err.message} (${err.statusCode})`
            : "Tidak dapat memuat detail transaksi.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [transactionUuid]);

  if (loading) return <LoadingShell />;
  if (error || !transaction) return <ErrorShell message={error ?? "Transaksi tidak ditemukan."} />;

  const state = deriveState(transaction);
  const buyerId = String(transaction.buyer_id ?? `buyer-${transaction.id}`);
  const order = transaction.orders[0];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:px-12">
      <Breadcrumb transactionNumber={transaction.transaction_number ?? `#${transaction.id}`} />
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_506px] lg:gap-x-8">
        <div className="flex flex-col gap-6">
          <TransactionStatusCard state={state} transaction={transaction} />
          {state === "on_process" && order && order.seller_id != null && (
            <ChatPanel
              orderId={order.id}
              buyerId={buyerId}
              sellerId={order.seller_id}
              buyerName={transaction.buyer_name}
            />
          )}
        </div>

        <aside className="flex flex-col gap-6 self-start">
          <OrderDetailCard transaction={transaction} userIdLabel={userIdLabel} />
          <PaymentDetailCard transaction={transaction} />
          <SupportCard />
        </aside>
      </div>
    </div>
  );
}

function deriveState(tx: TransactionDetail): InvoiceState {
  const order = tx.orders[0];
  if (order?.confirmed_at) return "completed";
  if (order?.paid_at) return "on_process";

  if (tx.payment_due_date) {
    const due = new Date(tx.payment_due_date).getTime();
    if (Number.isFinite(due) && due < Date.now()) return "expired";
  }
  return "pending";
}

function Breadcrumb({ transactionNumber }: { transactionNumber: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-(--color-text-subdued)">
        <li>
          <Link href="/" className="font-bold text-(--color-brand) hover:underline">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="font-bold text-(--color-brand)">Transaksi</li>
        <li aria-hidden="true">/</li>
        <li className="truncate">{transactionNumber}</li>
      </ol>
    </nav>
  );
}

function LoadingShell() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:px-12">
      <div className="h-5 w-64 animate-pulse rounded bg-(--color-border-low)" />
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_506px] lg:gap-x-8">
        <div className="flex flex-col gap-6">
          <div className="h-48 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
          <div className="h-[480px] animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
        </div>
        <div className="flex flex-col gap-6 self-start">
          <div className="h-56 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
          <div className="h-56 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
          <div className="h-16 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
        </div>
      </div>
    </div>
  );
}

function ErrorShell({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-[800px] px-6 py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-(--color-promotion)">
        Gagal memuat transaksi
      </h1>
      <p className="mt-3 text-(--color-text-body)">{message}</p>
    </div>
  );
}
