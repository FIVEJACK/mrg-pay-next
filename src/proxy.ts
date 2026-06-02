import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { DEVICE_HEADER, detectDevice } from "./lib/device";

const handleI18nRouting = createMiddleware(routing);

/**
 * Proxy (Next.js 16's renamed Middleware).
 *
 * Two responsibilities, in order:
 *  1. Resolve the request's device class (mweb/dweb) from the User-Agent and set
 *     it on the *request* headers. next-intl copies `request.headers` onto the
 *     rewrite it issues, so the header reaches the rendered route and is
 *     readable from Server Components via `getDevice()`.
 *  2. Delegate locale routing to next-intl.
 *
 * We also mirror the value onto the response headers so client/CDN tooling can
 * see it and so caches can `Vary` on it if configured.
 */
export default function proxy(request: NextRequest) {
  const device = detectDevice(request.headers);
  request.headers.set(DEVICE_HEADER, device);

  const response = handleI18nRouting(request);
  response.headers.set(DEVICE_HEADER, device);
  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
