import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: string; target?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 font-[family-name:var(--font-heading)] text-sm"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} target={item.target} className="text-[var(--color-brand)] hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[var(--color-text-secondary)]" : "text-[var(--color-brand)]"}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-[var(--color-text-secondary)]">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
