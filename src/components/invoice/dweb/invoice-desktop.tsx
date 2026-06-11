"use client";

import { useInvoice, type InvoiceViewProps } from "@/components/invoice/use-invoice";

import { ChatPanel } from "@/components/invoice/chat-panel";
import { OrderDetailCard } from "@/components/invoice/order-detail-card";
import { PaymentDetailCard } from "@/components/invoice/payment-detail-card";
import { SupportCard } from "@/components/invoice/support-card";
import { TransactionStatusCard } from "@/components/invoice/transaction-status-card";

export type { InvoiceViewProps };

export function InvoiceDesktop(props: InvoiceViewProps) {
  const { transaction, loading, error, state, order, buyerId } = useInvoice(props);

  if (loading) return <LoadingShell />;
  if (error || !transaction || !state) {
    return <ErrorShell message={error ?? "Transaksi tidak ditemukan."} />;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:px-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_506px] lg:gap-x-8">
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
          <OrderDetailCard transaction={transaction} />
          <PaymentDetailCard transaction={transaction} />
          <SupportCard />
        </aside>
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 lg:px-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_506px] lg:gap-x-8">
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
