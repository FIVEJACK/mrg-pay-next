"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type PopoverProps = {
  /** Render the trigger button. `open` is whether the popover is currently shown. */
  renderTrigger: (props: {
    open: boolean;
    onClick: () => void;
    ref: React.Ref<HTMLButtonElement>;
  }) => ReactNode;
  /** Render the popover content. Called only while open; called with `close()`. */
  renderContent: (props: { close: () => void }) => ReactNode;
  /** Optional className for the floating panel wrapper. */
  panelClassName?: string;
};

const VIEWPORT_PADDING = 16;

type Position = { top: number; left: number };

export function Popover({ renderTrigger, renderContent, panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [maxHeight, setMaxHeight] = useState<number | undefined>();
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Decide placement (flip above when trigger is too close to the bottom) and
  // clamp max-height so the panel always fits in the viewport. Uses fixed
  // positioning so the panel escapes any horizontally-scrolling ancestors.
  useLayoutEffect(() => {
    if (!open) return;
    function recalc() {
      const trig = triggerRef.current;
      if (!trig) return;
      const rect = trig.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING - 8;
      const spaceAbove = rect.top - VIEWPORT_PADDING - 8;
      const openBelow = spaceBelow >= 280 || spaceBelow >= spaceAbove;
      setPlacement(openBelow ? "bottom" : "top");
      setMaxHeight(Math.max(160, openBelow ? spaceBelow : spaceAbove));
      setPosition({
        top: openBelow ? rect.bottom + 8 : rect.top - 8,
        left: rect.left,
      });
    }
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open]);

  const panelStyle: CSSProperties = {
    position: "fixed",
    top: position?.top,
    left: position?.left,
    transform: placement === "top" ? "translateY(-100%)" : undefined,
    maxHeight,
    visibility: position ? "visible" : "hidden",
  };

  return (
    <>
      {renderTrigger({
        open,
        ref: triggerRef,
        onClick: () => {
          // Reset cached position so the panel hides until layout effect runs.
          setPosition(null);
          setOpen((v) => !v);
        },
      })}
      {open && (
        <div
          ref={panelRef}
          style={panelStyle}
          className={`animate-fade-in-scale z-50 flex flex-col ${panelClassName ?? ""}`}
        >
          {renderContent({ close: () => setOpen(false) })}
        </div>
      )}
    </>
  );
}
