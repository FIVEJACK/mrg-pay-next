/**
 * Device (viewport-class) detection shared between the proxy and the server.
 *
 * The browser viewport is a client-only concept, so at *request* time the best
 * proxy we have is the User-Agent plus the `Sec-CH-UA-Mobile` client hint. The
 * proxy resolves a `DeviceType` once per request and forwards it on the
 * {@link DEVICE_HEADER} request header; server code reads it back via
 * `getDevice()` (see `device.server.ts`).
 *
 * Keep this module free of `next/headers`, `server-only`, and any Node APIs so
 * it stays importable from the Edge proxy runtime.
 */

export type DeviceType = "mobile" | "desktop";

export const DEVICE_HEADER = "x-device-type";

/** Default when the request gives us nothing to go on. Desktop is the safer
 * fallback: it never hides functionality behind a mobile-only affordance. */
export const DEFAULT_DEVICE: DeviceType = "desktop";

/** Narrow an arbitrary string to a {@link DeviceType}, falling back to default. */
export function parseDevice(value: string | null | undefined): DeviceType {
  return value === "mobile" || value === "desktop" ? value : DEFAULT_DEVICE;
}

// Phones and small handhelds. Android tablets (Android without "Mobile") and
// iPads (which on iPadOS report a desktop UA) intentionally fall through to
// "desktop" — the wide layouts suit their viewport better.
const MOBILE_UA =
  /iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|BB10|Opera Mini|IEMobile|Mobile Safari/i;

/**
 * Resolve a {@link DeviceType} from request headers.
 *
 * Prefers the `Sec-CH-UA-Mobile` client hint (`?1` = mobile) when present, then
 * falls back to a User-Agent sniff.
 */
export function detectDevice(headers: Headers): DeviceType {
  const chMobile = headers.get("sec-ch-ua-mobile");
  if (chMobile === "?1") return "mobile";
  if (chMobile === "?0") return "desktop";

  const ua = headers.get("user-agent") ?? "";
  return MOBILE_UA.test(ua) ? "mobile" : "desktop";
}
