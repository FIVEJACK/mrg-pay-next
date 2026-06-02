import "server-only";

import { headers } from "next/headers";

import { DEVICE_HEADER, detectDevice, parseDevice, type DeviceType } from "./device";

/**
 * Read the request's resolved {@link DeviceType} inside a Server Component,
 * Route Handler, or Server Action.
 *
 * The proxy sets {@link DEVICE_HEADER} on every matched request, so normally we
 * just read it back. We re-detect from the live headers as a fallback for
 * requests that bypass the proxy (its `matcher` excludes `/api`, static files,
 * etc.) so this never throws or guesses blindly.
 */
export async function getDevice(): Promise<DeviceType> {
  const h = await headers();
  const fromProxy = h.get(DEVICE_HEADER);
  if (fromProxy) return parseDevice(fromProxy);
  return detectDevice(h);
}

/** Convenience predicate for `getDevice() === "mobile"`. */
export async function isMobile(): Promise<boolean> {
  return (await getDevice()) === "mobile";
}
