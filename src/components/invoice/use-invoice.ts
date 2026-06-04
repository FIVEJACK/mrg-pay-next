"use client";

import { useEffect, useState } from "react";

import { partnerBrowserApi, PartnerApiError } from "@/lib/partner-api/browser-client";
import type { TransactionDetail } from "@/lib/partner-api";

import type { InvoiceState } from "@/components/invoice/transaction-status-card";

export type InvoiceViewProps = {
  transactionUuid: string;
};

export function useInvoice({ transactionUuid }: InvoiceViewProps) {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [userIdLabel, setUserIdLabel] = useState("User ID");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const state = transaction ? deriveState(transaction) : null;
  const order = transaction?.orders[0] ?? null;
  const buyerId = transaction
    ? String(transaction.buyer_id ?? `buyer-${transaction.id}`)
    : "";

  return { transaction, userIdLabel, loading, error, state, order, buyerId };
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
