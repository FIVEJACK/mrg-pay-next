"use client";

import { formatPriceIDR } from "@/lib/format";

type MobilePurchaseBarProps = {
  price: number;
  itemInfoName?: string | null;
  onBuy: () => void;
};

export function MobilePurchaseBar({ price, itemInfoName, onBuy }: MobilePurchaseBarProps) {
  return (
    <div
      role="region"
      aria-label="Purchase summary"
      className="animate-slide-up fixed inset-x-0 bottom-0 z-20 flex items-center gap-4 border-t border-(--color-border-low) bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-(--color-promotion)">{formatPriceIDR(price)}</p>
        {itemInfoName && (
          <p className="truncate text-xs text-(--color-text-subdued)">{itemInfoName}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onBuy}
        className="h-11 shrink-0 rounded-full bg-(--color-brand) px-8 text-sm font-bold text-white transition hover:opacity-90"
      >
        Beli sekarang
      </button>
    </div>
  );
}
