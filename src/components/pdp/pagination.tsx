import type { MouseEvent } from "react";

import { Link } from "@/i18n/navigation";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icon";

type PaginationProps = {
  /** 1-based current page. */
  page: number;
  /** Total pages. */
  totalPages: number;
  /** Build the href for a given page (used for cmd-click / middle-click). */
  hrefFor: (page: number) => string;
  /** Optional client-side handler. When provided, primary click bypasses Link nav. */
  onSelect?: (page: number) => void;
};

const PAGE_SIZE_VISIBLE = 7;

function buildPageList(page: number, total: number): Array<number | "…"> {
  if (total <= PAGE_SIZE_VISIBLE) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | "…"> = [1];
  const start = Math.max(2, page - 2);
  const end = Math.min(total - 1, page + 2);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

const CELL = "flex size-11 items-center justify-center rounded-sm text-base";

export function Pagination({ page, totalPages, hrefFor, onSelect }: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = buildPageList(page, totalPages);
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const intercept = (target: number) =>
    onSelect
      ? (e: MouseEvent) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          onSelect(target);
        }
      : undefined;

  return (
    <nav aria-label="Pagination" className="flex w-full max-w-[440px] items-start justify-between">
      <PageLink
        href={hrefFor(prevPage)}
        disabled={page <= 1}
        ariaLabel="Previous page"
        className={CELL}
        onClick={intercept(prevPage)}
      >
        <ChevronLeftIcon className="size-6" />
      </PageLink>

      <div className="flex items-center">
        {items.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              className={`${CELL} font-bold text-(--color-text-subdued)`}
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              onClick={intercept(p)}
              className={`${CELL} ${
                p === page
                  ? "bg-(--color-cyan-50) font-bold text-white"
                  : "text-(--color-text-subdued) hover:text-(--color-text-title)"
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      <PageLink
        href={hrefFor(nextPage)}
        disabled={page >= totalPages}
        ariaLabel="Next page"
        className={CELL}
        onClick={intercept(nextPage)}
      >
        <ChevronRightIcon className="size-6" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  ariaLabel,
  className,
  onClick,
  children,
}: {
  href: string;
  disabled: boolean;
  ariaLabel: string;
  className: string;
  onClick?: (e: MouseEvent) => void;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-label={ariaLabel}
        aria-disabled="true"
        className={`${className} text-(--color-text-disabled)`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
