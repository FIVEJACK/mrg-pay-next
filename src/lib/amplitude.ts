/**
 * Amplitude analytics helper.
 *
 * Thin wrapper around `@amplitude/analytics-browser` that keeps event names in a
 * single registry and makes every call a safe no-op on the server or when no API
 * key is configured. Components and hooks should import {@link trackEvent} and
 * {@link EVENT} from here rather than touching the SDK directly, so the surface
 * we track stays discoverable and typo-proof.
 *
 * Initialization happens once in `src/instrumentation-client.ts`, which Next.js
 * runs after the document loads but before hydration.
 */

import * as amplitude from "@amplitude/analytics-browser";
import { config } from "@/config/config";

/**
 * Registry of every event we send to Amplitude. Add new events here first so
 * the name is shared across call sites and shows up in autocomplete. Values are
 * the literal strings Amplitude receives — keep them human-readable and stable.
 */
export const EVENT = {
  VISIT_PRODUCT_CATALOGUE: "Visit Product Catalogue",
  VISIT_PRODUCT_DETAIL: "Visit Product Detail",
  VISIT_CHECKOUT_PAGE: "Visit Checkout Page",
  CREATE_TRANSACTION: "Create Transaction",
} as const;

export type EventName = (typeof EVENT)[keyof typeof EVENT];
export type EventProperties = Record<string, unknown>;

let initialized = false;

/** True only in the browser once {@link initAmplitude} has run with a real key. */
function isReady(): boolean {
  return initialized && typeof window !== "undefined";
}

/**
 * Initialize the Amplitude SDK. Safe to call more than once (subsequent calls
 * are ignored) and a no-op when there is no API key — local/dev environments
 * without a key simply don't send anything.
 */
export function initAmplitude(): void {
  if (initialized || typeof window === "undefined") return;

  const apiKey = config.amplitude.apiKey;
  if (!apiKey) return;

  amplitude.init(apiKey, {
    autocapture: {
      pageViews: false,
      webVitals: false,
      elementInteractions: false,
      pageUrlEnrichment: false,
    },
    remoteConfig: { fetchRemoteConfig: false },
  });
  initialized = true;
}

/**
 * Send an event to Amplitude. No-ops on the server or before init, so callers
 * never need to guard. Failures are swallowed: analytics must never break the
 * user-facing flow.
 */
export function trackEvent(name: EventName, properties?: EventProperties): void {
  if (!isReady()) return;
  try {
    amplitude.track(name, properties);
  } catch {
    /* analytics is best-effort — never surface to the user */
  }
}

/**
 * Force-send any queued events immediately. Await this before navigating away
 * (e.g. a redirect after checkout) so events tracked just beforehand aren't
 * dropped when the page unloads. No-ops and never throws when not ready.
 */
export async function flushAmplitude(): Promise<void> {
  if (!isReady()) return;
  try {
    await amplitude.flush().promise;
  } catch {
    /* best-effort */
  }
}

/** Associate subsequent events with a user id (e.g. after a known email). */
export function identifyUser(userId: string): void {
  if (!isReady() || !userId) return;
  try {
    amplitude.setUserId(userId);
  } catch {
    /* best-effort */
  }
}
