"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  renderTrigger: (props: {
    open: boolean;
    onClick: () => void;
    ref: React.Ref<HTMLButtonElement>;
  }) => ReactNode;
  renderContent: (props: { close: () => void }) => ReactNode;
};

export function BottomSheet({ renderTrigger, renderContent }: BottomSheetProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {renderTrigger({
        open,
        ref: triggerRef,
        onClick: () => setOpen((v) => !v),
      })}
      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 animate-fade-in"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)" }}
              onClick={close}
              aria-hidden="true"
            />
            {/* Sheet panel — grid gives the content row an explicit height so h-full resolves inside */}
            <div className="animate-sheet-up relative grid h-[600px] max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)] rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
              {/* Drag handle */}
              <div className="flex justify-center py-3" aria-hidden="true">
                <div className="h-1 w-10 rounded-full bg-(--color-border)" />
              </div>
              {/* Content — grid cell has explicit height, so h-full in child resolves correctly */}
              <div className="overflow-hidden">
                {renderContent({ close })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
