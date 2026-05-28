import { CheckIcon, DotIcon } from "@/components/icon";

export type StepKey = "bayar" | "diproses" | "selesai";

type Step = { key: StepKey; label: string };

const STEPS: Step[] = [
  { key: "bayar", label: "Bayar" },
  { key: "diproses", label: "Diproses" },
  { key: "selesai", label: "Selesai" },
];

type StepProgressProps = {
  /** The step currently in progress. Earlier steps render as completed. */
  active: StepKey;
};

export function StepProgress({ active }: StepProgressProps) {
  const activeIndex = STEPS.findIndex((s) => s.key === active);
  return (
    <ol className="flex w-full items-center">
      {STEPS.map((step, i) => {
        const completed = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              {completed ? (
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckIcon className="size-5" />
                </span>
              ) : isActive ? (
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-(--color-brand) bg-(--color-surface-focus) text-(--color-brand)">
                  <DotIcon className="size-3" />
                </span>
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-(--color-border) bg-white text-(--color-text-subdued)">
                  <CheckIcon className="size-5" />
                </span>
              )}
              <span
                className={`font-[family-name:var(--font-heading)] text-xs ${
                  isActive
                    ? "font-bold text-(--color-text-title)"
                    : completed
                      ? "text-(--color-text-body)"
                      : "text-(--color-text-subdued)"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`-mt-6 mx-2 h-1 flex-1 rounded-full ${
                  i < activeIndex ? "bg-emerald-500" : "bg-(--color-border-low)"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

