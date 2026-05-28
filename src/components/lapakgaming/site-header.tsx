import { Link } from "@/i18n/navigation";
import { SearchIcon } from "@/components/icon";

import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border-low)] bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6 lg:px-[92px]">
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
          <BrandLogo />
          <span className="hidden text-sm text-[var(--color-text-subdued)] sm:inline">
            | Termurah & Dijamin Aman
          </span>
        </Link>

        <form className="ml-auto flex w-full max-w-md items-center" role="search">
          <label className="flex h-10 w-full items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-3">
            <SearchIcon className="size-5 text-[var(--color-text-subdued)]" />
            <input
              type="search"
              name="q"
              placeholder="Cari game…"
              className="w-full bg-transparent text-sm text-[var(--color-text-body)] placeholder:text-[var(--color-text-subdued)] outline-none"
            />
          </label>
        </form>
      </div>
    </header>
  );
}
