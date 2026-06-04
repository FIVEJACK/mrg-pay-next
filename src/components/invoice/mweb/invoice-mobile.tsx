"use client";

import { useInvoice, type InvoiceViewProps } from "@/components/invoice/use-invoice";

import { InvoiceBreadcrumb } from "@/components/invoice/invoice-breadcrumb";
import { OrderDetailCard } from "@/components/invoice/order-detail-card";
import { PaymentDetailCard } from "@/components/invoice/payment-detail-card";
import { SupportCard } from "@/components/invoice/support-card";
import { TransactionStatusCard } from "@/components/invoice/transaction-status-card";

import { ChatSection } from "./chat-section";
export function InvoiceMobile(props: InvoiceViewProps) {
  const { transaction, userIdLabel, loading, error, state, order, buyerId } =
    useInvoice(props);

  if (loading) return <LoadingShell />;
  if (error || !transaction || !state) {
    return <ErrorShell message={error ?? "Transaksi tidak ditemukan."} />;
  }

  const showChat = state === "on_process" && order != null && order.seller_id != null;

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-2">
      <div className="px-4 py-3">
        <InvoiceBreadcrumb
          transactionNumber={transaction.transaction_number ?? `#${transaction.id}`}
        />
      </div>

      <TransactionStatusCard bare state={state} transaction={transaction} />

      {showChat && (
        <ChatSection
          orderId={order.id}
          buyerId={buyerId}
          sellerId={order.seller_id!}
          buyerName={transaction.buyer_name}
        />
      )}

      <OrderDetailCard bare transaction={transaction} userIdLabel={userIdLabel} />
      <PaymentDetailCard bare transaction={transaction} />
      <SupportCard bare />
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-2">
      <div className="px-4 py-3">
        <div className="h-5 w-48 animate-pulse rounded bg-(--color-border-low)" />
      </div>
      <div className="h-52 animate-pulse bg-white" />
      <div className="h-56 animate-pulse bg-white" />
      <div className="h-52 animate-pulse bg-white" />
      <div className="h-40 animate-pulse bg-white" />
      <div className="h-16 animate-pulse bg-white" />
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
