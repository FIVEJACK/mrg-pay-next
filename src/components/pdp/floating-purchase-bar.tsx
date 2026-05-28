"use client";

import { formatPriceIDR } from "@/lib/format";

type FloatingPurchaseBarProps = {
  price: number;
  itemInfoName?: string | null;
  serverName?: string | null;
  onBuy: () => void;
};

export function FloatingPurchaseBar({
  price,
  itemInfoName,
  serverName,
  onBuy,
}: FloatingPurchaseBarProps) {
  const label = [itemInfoName, serverName].filter(Boolean).join(", ");

  return (
    <div
      role="region"
      aria-label="Purchase summary"
      className="animate-slide-up fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border-low) bg-white"
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-6 py-4 lg:px-[116px]">
        <div className="min-w-0 flex-1 text-center">
          <p className="text-xl font-bold text-(--color-promotion)">{formatPriceIDR(price)}</p>
          {label && (
            <p className="truncate text-sm text-(--color-text-body)">{label}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onBuy}
          className="h-10 shrink-0 rounded-full bg-(--color-brand) px-8 text-sm font-bold text-white transition hover:opacity-90"
        >
          Beli sekarang
        </button>
      </div>
    </div>
  );
}
