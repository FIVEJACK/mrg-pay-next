import { MrgImage } from "@/components/shared/mrg-image";

import { computeDiscountPct, formatPriceIDR, formatSoldCount } from "@/lib/format";
import type { Product } from "@/lib/partner-api";
import { pickProductCoverImage } from "@/lib/partner-api";

type ProductCardProps = {
  product: Product;
  selected?: boolean;
  mobile?: boolean;
  onClick?: () => void;
};

export function ProductCard({ product, selected, mobile, onClick }: ProductCardProps) {
  const cover = pickProductCoverImage(product);
  // competitor_price = normal/reference price; price = (potentially discounted) selling price.
  const normalPrice = product.competitor_price ?? null;
  const discount = computeDiscountPct(product.seller_price, normalPrice);
  const soldCount = product.order_record?.successful_order_count ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition duration-200 ease-out outline-none will-change-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,17,168,0.10)] ${
        selected
          ? "border-2 border-(--color-brand) shadow-[0_0_0_2px_var(--color-brand)]"
          : "border-(--color-border) hover:border-(--color-brand)"
      }`}
    >
      <div className="relative aspect-[210/118] w-full overflow-hidden bg-(--color-surface-secondary)">
        {cover ? (
          <MrgImage
            src={cover}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 220px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            loading="eager"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-(--color-text-subdued)">
            No image
          </div>
        )}
      </div>
      <div className="flex h-[110px] flex-col gap-1 px-3 py-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-(--color-text-title)">
          {product.name}
        </h3>
        <p className="text-sm text-(--color-text-subdued)"> Face to Face </p>

        <div className="mt-auto flex flex-col gap-0.5 pt-2">
          {mobile ? (
            <>
              {normalPrice && discount !== null && (
                <span className="text-xs text-(--color-text-subdued) line-through">
                  {formatPriceIDR(normalPrice)}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-base font-bold text-(--color-promotion)">
                  {formatPriceIDR(product.seller_price)}
                </span>
                {discount !== null && (
                  <span className="rounded-sm bg-(--color-promotion) px-1 py-0.5 text-[11px] leading-[14px] text-white">
                    {discount}%
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-base font-bold text-(--color-promotion)">
                {formatPriceIDR(product.seller_price)}
              </span>
              {normalPrice && discount !== null && (
                <span className="text-xs text-(--color-text-subdued) line-through">
                  {formatPriceIDR(normalPrice)}
                </span>
              )}
              {discount !== null && (
                <span className="rounded-sm bg-(--color-promotion) px-1 py-0.5 text-[11px] leading-[14px] text-white">
                  {discount}%
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-(--color-text-subdued)">{formatSoldCount(soldCount)}</p>
        </div>
      </div>
    </button>
  );
}
