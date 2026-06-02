import { Fragment } from "react";

import {
  CheckCircleRounded,
  CheckRounded,
  TimerRoundedIcon,
} from "@/components/icon";

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
    <div className="flex w-full flex-col items-center gap-1 py-2">
      <div className="flex w-full items-center px-1">
        {STEPS.map((step, i) => {
          const completed = i < activeIndex;
          const isActive = i === activeIndex;
          const Icon = completed
            ? CheckRounded
            : isActive
              ? TimerRoundedIcon
              : CheckCircleRounded;
          const circleBg = completed
            ? "bg-(--color-success)"
            : isActive
              ? "bg-(--color-in-progress)"
              : "bg-(--color-pending)";
          return (
            <Fragment key={step.key}>
              <span className="flex w-[42px] shrink-0 justify-center">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-white ${circleBg}`}
                >
                  <Icon className="size-4" />
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`h-1 min-w-px flex-1 rounded-full ${
                    i < activeIndex
                      ? "bg-(--color-success)"
                      : "bg-(--color-border-low)"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
      <div className="flex w-full justify-between px-1 font-heading text-[10px] leading-[10px] font-medium">
        {STEPS.map((step, i) => (
          <span
            key={step.key}
            className={`w-[42px] text-center ${
              i <= activeIndex
                ? "text-(--color-text-title)"
                : "text-(--color-text-subdued)"
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
