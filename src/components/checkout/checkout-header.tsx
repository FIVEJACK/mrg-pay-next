import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/lapakgaming/brand-logo";

import { ShieldFilledIcon } from "@/components/icon";

export function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-(--color-border-low) bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-6 lg:px-12">
        <Link href="/" aria-label="Lapakgaming home">
          <BrandLogo />
        </Link>
        <span aria-hidden="true" className="h-3 w-px bg-(--color-border-low)" />
        <span className="flex items-center gap-1.5">
          <ShieldFilledIcon className="size-5" />
          <span className="font-[family-name:var(--font-heading)] text-sm font-semibold text-(--color-text-title)">
            Secure Checkout
          </span>
        </span>
      </div>
    </header>
  );
}
