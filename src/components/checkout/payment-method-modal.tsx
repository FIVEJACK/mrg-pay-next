"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { XIcon } from "@/components/icon";
import { formatPriceIDR } from "@/lib/format";
import { calculatePaymentFee, checkPaymentMethodLimit } from "@/lib/partner-api";
import type { PaymentGroup, PaymentLimitViolation, PaymentMethod } from "@/lib/partner-api";

type PaymentMethodModalProps = {
  open: boolean;
  onClose: () => void;
  groups: PaymentGroup[];
  amount: number;
  /** The currently-confirmed selection (outside the modal). */
  selectedId: number | null;
  /** Called with the user's confirmed pick when they press Simpan. */
  onConfirm: (id: number) => void;
};

export function PaymentMethodModal({
  open,
  onClose,
  groups,
  amount,
  selectedId,
  onConfirm,
}: PaymentMethodModalProps) {
  const [draftId, setDraftId] = useState<number | null>(selectedId);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset draft + active tab when the modal opens.
  useEffect(() => {
    if (!open) return;
    setDraftId(selectedId);
  }, [open, selectedId]);

  // ESC closes.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const activeGroups = useMemo(
    () =>
      groups
        .filter((g) => g.is_active === 1)
        .map((g) => ({
          ...g,
          payment_method_list: g.payment_method_list.filter((m) => m.is_active === 1),
        }))
        .filter((g) => g.payment_method_list.length > 0),
    [groups],
  );

  // Default the active tab to the first non-empty group when the modal opens.
  useEffect(() => {
    if (!open) return;
    if (activeGroupId == null && activeGroups[0]) {
      setActiveGroupId(activeGroups[0].id);
    }
  }, [open, activeGroups, activeGroupId]);

  // Track which group is currently in view so the active tab follows the scroll.
  useEffect(() => {
    if (!open) return;
    const root = scrollRef.current;
    if (!root) return;
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>("[data-group-id]"),
    );
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const id = Number(visible.target.getAttribute("data-group-id"));
          if (Number.isFinite(id)) setActiveGroupId(id);
        }
      },
      { root, rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [open, activeGroups]);

  const draftMethod = useMemo<PaymentMethod | null>(() => {
    if (draftId == null) return null;
    for (const g of activeGroups) {
      const hit = g.payment_method_list.find((m) => m.id === draftId);
      if (hit) return hit;
    }
    return null;
  }, [activeGroups, draftId]);

  if (!open || typeof window === "undefined") return null;

  function scrollToGroup(id: number) {
    setActiveGroupId(id);
    const root = scrollRef.current;
    const target = root?.querySelector<HTMLElement>(`[data-group-id="${id}"]`);
    if (!root || !target) return;
    // Use getBoundingClientRect so the math is correct regardless of whether
    // the section's offsetParent happens to be the scroll container.
    const delta = target.getBoundingClientRect().top - root.getBoundingClientRect().top;
    root.scrollTo({ top: root.scrollTop + delta, behavior: "smooth" });
  }

  function handleSave() {
    if (draftId == null) return;
    onConfirm(draftId);
    onClose();
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onClick={(e) => {
        // Click on the backdrop (this wrapper) closes; clicks bubbling up from
        // the panel are ignored.
        if (e.target === e.currentTarget) onClose();
      }}
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        ref={panelRef}
        className="animate-fade-in-scale relative flex max-h-[90vh] w-full max-w-[800px] flex-col rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-(--color-border-low) px-6 py-5">
          <h2
            id="payment-modal-title"
            className="font-[family-name:var(--font-heading)] text-xl font-bold text-(--color-text-title)"
          >
            Pilih Metode Pembayaran
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="text-(--color-text-subdued) transition hover:text-(--color-text-body)"
          >
            <XIcon className="size-6" />
          </button>
        </div>

        <div className="border-b border-(--color-border-low) px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {activeGroups.map((g) => {
              const active = activeGroupId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => scrollToGroup(g.id)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm transition ${
                    active
                      ? "border-2 border-(--color-brand) bg-(--color-surface-focus) font-semibold text-(--color-brand)"
                      : "border border-(--color-border-low) bg-white text-(--color-text-body) hover:border-(--color-border)"
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          {activeGroups.map((g) => (
            <section key={g.id} data-group-id={g.id} className="mb-6 last:mb-2">
              <h3 className="mb-3 font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
                {g.name}
              </h3>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {g.payment_method_list.map((m) => {
                  const violation = checkPaymentMethodLimit(m, amount);
                  return (
                    <ModalPaymentCard
                      key={m.id}
                      method={m}
                      fee={calculatePaymentFee(m, amount)}
                      selected={m.id === draftId}
                      violation={violation}
                      onSelect={() => setDraftId(m.id)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-(--color-border-low) px-6 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-4 text-(--color-text-subdued)">Metode Pembayaran</p>
            {draftMethod ? (
              <p className="truncate font-[family-name:var(--font-heading)] text-base font-bold leading-6 text-(--color-text-title)">
                {draftMethod.name}{" "}
                <span className="font-normal text-(--color-text-subdued)">
                  ({formatPriceIDR(calculatePaymentFee(draftMethod, amount))})
                </span>
              </p>
            ) : (
              <p className="text-base leading-6 text-(--color-text-subdued)">Belum dipilih</p>
            )}
          </div>
          <button
            type="button"
            disabled={draftId == null}
            onClick={handleSave}
            className="rounded-2xl bg-(--color-brand) px-6 py-2.5 text-sm font-bold text-white transition hover:bg-(--color-brand-hover) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ModalPaymentCard({
  method,
  fee,
  selected,
  violation,
  onSelect,
}: {
  method: PaymentMethod;
  fee: number;
  selected: boolean;
  violation: PaymentLimitViolation | null;
  onSelect: () => void;
}) {
  const disabled = violation != null;
  const limitLabel = disabled
    ? violation!.type === "below_min"
      ? `Min ${formatPriceIDR(violation!.limit)}`
      : `Maks ${formatPriceIDR(violation!.limit)}`
    : null;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      title={limitLabel ?? undefined}
      onClick={onSelect}
      className={`flex h-[68px] min-w-0 items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
        disabled
          ? "cursor-not-allowed border border-(--color-border-low) bg-(--color-bg-subtle) opacity-50"
          : selected
            ? "border-2 border-(--color-brand) bg-(--color-surface-focus)"
            : "border border-(--color-border-low) bg-white hover:border-(--color-border)"
      }`}
    >
      {method.icon_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={method.icon_url}
          alt=""
          className="h-8 w-14 shrink-0 object-contain"
          loading="lazy"
        />
      ) : (
        <span className="flex h-8 w-14 shrink-0 items-center justify-center rounded-sm bg-(--color-bg-subtle) text-[11px] font-bold leading-none text-(--color-text-secondary)">
          {method.name.slice(0, 4).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm text-(--color-text-body)">
        {method.name}
      </span>
      <span className="shrink-0 text-sm text-(--color-text-body)">
        {limitLabel ?? (fee > 0 ? formatPriceIDR(fee) : "Gratis")}
      </span>
    </button>
  );
}

