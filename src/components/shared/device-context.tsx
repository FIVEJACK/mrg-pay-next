"use client";

import { createContext, useContext } from "react";

import { DEFAULT_DEVICE, type DeviceType } from "@/lib/device";

const DeviceContext = createContext<DeviceType>(DEFAULT_DEVICE);

/**
 * Makes the request-resolved device class available to Client Components.
 *
 * Mounted once near the root (see `[locale]/layout.tsx`) with the value from
 * `getDevice()`. Because the decision is made on the server and serialized into
 * the tree, there is no client-side measurement and therefore no hydration
 * flash. Use this for JS-level branching (event handlers, conditional client
 * widgets); use CSS/Tailwind breakpoints for purely visual responsiveness.
 */
export function DeviceProvider({
  device,
  children,
}: {
  device: DeviceType;
  children: React.ReactNode;
}) {
  return <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>;
}

/** Read the request-resolved device class inside a Client Component. */
export function useDevice(): DeviceType {
  return useContext(DeviceContext);
}

/** Convenience hook: `true` when the request resolved to a mobile viewport. */
export function useIsMobile(): boolean {
  return useContext(DeviceContext) === "mobile";
}
