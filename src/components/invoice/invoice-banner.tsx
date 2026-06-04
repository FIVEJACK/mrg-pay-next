"use client";

import { useState } from "react";

import { LinkIcon, WarningIcon } from "@/components/icon";

export function InvoiceBanner() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be blocked (e.g. insecure context); fail silently.
    }
  }

  return (
    <div className="sticky top-16 z-10 bg-[#F26B1E] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-4 px-6 py-3 lg:px-12">
        <p className="flex items-center gap-2 text-sm leading-5">
          <WarningIcon className="size-5 shrink-0" />
          <span>
            <strong className="font-semibold">Jangan tutup</strong> halaman ini selama
            transaksi berlangsung.
          </span>
        </p>
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-full border border-white px-3 py-1 text-xs font-semibold transition hover:bg-white/10"
        >
          <LinkIcon className="size-4" />
          {copied ? "Tersalin" : "Salin link"}
        </button>
      </div>
    </div>
  );
}
