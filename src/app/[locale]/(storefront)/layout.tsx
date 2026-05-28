import type { ReactNode } from "react";

import { AppShell } from "@/components/lapakgaming/app-shell";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
