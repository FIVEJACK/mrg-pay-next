"use client";

import { useEffect } from "react";

import { postHeightChange } from "@/components/pdp/product-list-messaging";

/**
 * Watches the document's content height inside the product iframe and reports
 * it to the parent window whenever it changes. Renders nothing.
 */
export function IframeHeightReporter() {
  useEffect(() => {
    const root = document.documentElement;
    let last = -1;

    function report() {
      const height = root.scrollHeight;
      if (height === last) return;
      last = height;
      postHeightChange(height);
    }

    const ro = new ResizeObserver(report);
    ro.observe(document.body);
    report();

    return () => ro.disconnect();
  }, []);

  return null;
}
