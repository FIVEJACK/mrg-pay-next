import type { ReactNode } from "react";

import { IconSidebar } from "./icon-sidebar";
import { SiteHeader } from "./site-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-1">
        <IconSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
