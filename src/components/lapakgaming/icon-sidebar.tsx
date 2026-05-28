"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { HomeIcon, LoginIcon, ReceiptIcon } from "@/components/icon";

type NavItem = {
  label: string;
  href: string;
  Icon: typeof HomeIcon;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/", Icon: HomeIcon },
  { label: "Transaksi", href: "/transaksi", Icon: ReceiptIcon },
  { label: "Masuk", href: "/login", Icon: LoginIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function IconSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[72px] shrink-0 border-r border-[var(--color-border-low)] bg-white py-6 lg:flex lg:flex-col">
      <nav aria-label="Primary" className="flex flex-col items-center gap-6">
        {NAV.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
                active
                  ? "text-[var(--color-text-title)]"
                  : "text-[var(--color-text-subdued)] hover:text-[var(--color-text-title)]"
              }`}
            >
              <span
                className={`flex size-9 items-center justify-center rounded-lg ${
                  active ? "bg-[var(--color-surface-secondary)]" : ""
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span>{label}</span>
              {active && <span className="mt-0.5 h-0.5 w-6 rounded-full bg-[var(--color-brand)]" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
