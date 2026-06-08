"use client";

import { useEffect } from "react";

import { trackEvent, type EventName, type EventProperties } from "@/lib/amplitude";

type VisitPageTrackerProps = {
  eventName: EventName;
  /** Extra context to attach to the page-view event (ids, slugs, etc.). */
  properties?: EventProperties;
};

/**
 * Fires a single Amplitude event when the page it's mounted on first renders.
 * Drop it anywhere inside a (server or client) page to record a visit:
 *
 * ```tsx
 * <VisitPageTracker eventName={EVENT.VISIT_CHECKOUT_PAGE} />
 * ```
 *
 * It renders nothing. The event is sent once per mount; re-running effects in
 * React Strict Mode (dev only) may fire it twice — that's expected locally and
 * does not happen in production.
 */
export function VisitPageTracker({ eventName, properties }: VisitPageTrackerProps) {
  useEffect(() => {
    trackEvent(eventName, properties);
    // Intentionally fire only on mount; `properties` is treated as a snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  return null;
}

export default VisitPageTracker;
