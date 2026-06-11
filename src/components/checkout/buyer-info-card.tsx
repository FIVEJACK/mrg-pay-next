"use client";

import { useState } from "react";

import { InfoIcon } from "@/components/icon";

type BuyerInfoCardProps = {
  email: string;
  onEmailChange: (value: string) => void;
  error?: string | null;
  recentEmails?: string[];  /** Previously-used emails (from successful checkouts) offered as suggestions. */

  bare?: boolean;
};

export function BuyerInfoCard({
  email,
  onEmailChange,
  error,
  recentEmails = [],
  bare = false,
}: BuyerInfoCardProps) {
  const [focused, setFocused] = useState(false);

  const query = email.trim().toLowerCase();
  // Offer recents that match what's typed so far, excluding an exact match
  // (no point suggesting the value already in the field).
  const suggestions = recentEmails.filter((e) => e !== query && e.includes(query));
  const showSuggestions = focused && suggestions.length > 0;

  return (
    <section
      className={`flex w-full flex-col gap-3 ${bare ? "bg-white px-4 py-5" : ""}`}
    >
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Informasi pembeli
      </h2>
      <div
        className={
          bare
            ? "flex flex-col gap-4"
            : "flex flex-col gap-4 rounded-2xl border border-(--color-border-low) bg-white p-6 lg:flex-row lg:items-start lg:gap-4"
        }
      >
        <label className="flex w-full flex-col gap-1 lg:max-w-[414.5px]">
          <span className="font-[family-name:var(--font-heading)] text-sm leading-5 text-(--color-text-secondary)">
            Email pembeli
          </span>
          <div className="relative">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              placeholder="Masukkan alamat email"
              aria-invalid={error ? true : undefined}
              className={`h-11 w-full rounded-2xl border bg-(--color-surface) px-3 text-base leading-6 text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none ${
                error
                  ? "border-(--color-promotion)"
                  : "border-(--color-border) focus:border-(--color-brand)"
              }`}
            />
            {showSuggestions && (
              <div className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.15)]">
                <div className="px-4 pt-3 pb-1">
                  <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
                    Email sebelumnya
                  </h3>
                </div>
                <ul className="py-1">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        // Prevent the input's blur from firing before the click.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onEmailChange(s);
                          setFocused(false);
                        }}
                        className="block w-full truncate px-4 py-3 text-left text-base text-(--color-text-body) transition-colors hover:bg-(--color-bg-subtle)"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {error && (
            <span role="alert" className="flex items-center gap-1 text-xs leading-4 text-(--color-promotion)">
              <InfoIcon className="size-4 shrink-0" />
              {error}
            </span>
          )}
        </label>
        <p className="flex-1 self-center font-[family-name:var(--font-heading)] text-sm leading-5 text-(--color-text-subdued) lg:pt-6">
          Hanya untuk kirim status transaksi.{" "}
          <span className="text-(--color-brand)">Lihat Kebijakan Privasi</span>
        </p>
      </div>
    </section>
  );
}
