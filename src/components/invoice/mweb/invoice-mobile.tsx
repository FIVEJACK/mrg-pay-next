"use client";

import { useState } from "react";

import { useInvoice, type InvoiceViewProps } from "@/components/invoice/use-invoice";

import { ChatPanel } from "@/components/invoice/chat-panel";
import { InvoiceBreadcrumb } from "@/components/invoice/invoice-breadcrumb";
import { OrderDetailCard } from "@/components/invoice/order-detail-card";
import { PaymentDetailCard } from "@/components/invoice/payment-detail-card";
import { SupportCard } from "@/components/invoice/support-card";
import { TransactionStatusCard } from "@/components/invoice/transaction-status-card";


export function InvoiceMobile(props: InvoiceViewProps) {
  const { transaction, userIdLabel, loading, error, state, order, buyerId } =
    useInvoice(props);

  if (loading) return <LoadingShell />;
  if (error || !transaction || !state) {
    return <ErrorShell message={error ?? "Transaksi tidak ditemukan."} />;
  }

  const showChat = state === "on_process" && order != null && order.seller_id != null;

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-4 py-5">
      <InvoiceBreadcrumb
        transactionNumber={transaction.transaction_number ?? `#${transaction.id}`}
      />

      <TransactionStatusCard state={state} transaction={transaction} />
      <OrderDetailCard transaction={transaction} userIdLabel={userIdLabel} />
      <PaymentDetailCard transaction={transaction} />

      {showChat && (
        <ChatDisclosure defaultOpen>
          <ChatPanel
            orderId={order.id}
            buyerId={buyerId}
            sellerId={order.seller_id!}
            buyerName={transaction.buyer_name}
          />
        </ChatDisclosure>
      )}

      <SupportCard />
    </div>
  );
}

function ChatDisclosure({
  defaultOpen,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-(--color-border-low) bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)">
          Chat dengan Penjual
        </span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`size-5 shrink-0 text-(--color-text-secondary) transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Keep the panel mounted while collapsed so the chat connection and
          message history survive toggling; just hide it visually. */}
      <div className={open ? "border-t border-(--color-border-low)" : "hidden"}>
        {children}
      </div>
    </section>
  );
}

function LoadingShell() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-4 py-5">
      <div className="h-5 w-48 animate-pulse rounded bg-(--color-border-low)" />
      <div className="h-48 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
      <div className="h-56 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
      <div className="h-56 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
      <div className="h-16 animate-pulse rounded-2xl border border-(--color-border-low) bg-white" />
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
