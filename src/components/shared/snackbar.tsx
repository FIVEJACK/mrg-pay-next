"use client";

type SnackbarProps = {
  /** Message to show. When null/empty the snackbar renders nothing. */
  message: string | null;
  onClose: () => void;
  actionLabel?: string;
  /** Vertical position override (e.g. to clear a fixed bottom bar). */
  className?: string;
};

export function Snackbar({
  message,
  onClose,
  actionLabel = "Tutup",
  className = "bottom-12",
}: SnackbarProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`animate-slide-up fixed left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[640px] -translate-x-1/2 items-center gap-6 rounded-md bg-(--color-surface-inverse) px-6 py-3 shadow-[0px_4px_4px_rgba(34,34,34,0.04),0px_4px_6px_rgba(34,34,34,0.14),0px_3px_1.5px_rgba(34,34,34,0.04)] ${className}`}
    >
      <p className="min-w-0 flex-1 text-base leading-6 text-(--color-text-inverse)">
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 font-bold text-base leading-6 text-(--color-text-link-inverse)"
      >
        {actionLabel}
      </button>
    </div>
  );
}
