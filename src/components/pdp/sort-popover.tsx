"use client";

export type SortOption<T extends string = string> = {
  value: T;
  label: string;
};

type SortPopoverProps<T extends string> = {
  title?: string;
  options: SortOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export function SortPopover<T extends string>({
  title = "Urutkan",
  options,
  value,
  onSelect,
  onClose,
}: SortPopoverProps<T>) {
  return (
    <div
      role="dialog"
      aria-label={title}
      className="w-[280px] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.15)]"
    >
      <div className="px-4 pb-1 pt-3">
        <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-(--color-text-title)">
          {title}
        </h3>
      </div>

      <ul role="listbox" aria-label={title} className="py-1">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <li key={opt.value} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-base transition-colors hover:bg-(--color-bg-subtle) ${
                  selected
                    ? "font-semibold text-(--color-brand)"
                    : "text-(--color-text-body)"
                }`}
              >
                <span>{opt.label}</span>
                {selected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 shrink-0 text-(--color-brand)"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
