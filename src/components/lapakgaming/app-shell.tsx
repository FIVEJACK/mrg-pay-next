import type { ReactNode } from "react";

import { getDevice } from "@/lib/device.server";

import { AppShellDesktop } from "./dweb/app-shell-desktop";
import { AppShellMobile } from "./mweb/app-shell-mobile";

/**
 * Server entry for the storefront shell. Resolves the request's device class and
 * renders the dweb or mweb shell around the routed page.
 */
export async function AppShell({ children }: { children: ReactNode }) {
  const device = await getDevice();
  return device === "mobile" ? (
    <AppShellMobile>{children}</AppShellMobile>
  ) : (
    <AppShellDesktop>{children}</AppShellDesktop>
  );
}
