import type { ReactNode } from "react";

import { SiteHeader } from "@/components/lapakgaming/site-header";

/**
 * Mobile (mweb) app shell.
 *
 * Drops the persistent `IconSidebar` — on a phone the left rail wastes scarce
 * horizontal space, so navigation should move into the header (hamburger /
 * bottom nav). This is a starting point: build the mobile nav and wire it here.
 */
export function AppShellMobile({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
