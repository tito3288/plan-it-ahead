import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandHeaderProps = {
  step: 1 | 2 | 3;
};

const steps = ["Park", "Dates", "Forecast"] as const;

export function BrandHeader({ step }: BrandHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <Link
        href="/"
        className="font-heading text-3xl font-semibold leading-none text-green"
      >
        PlanItAhead
      </Link>

      <nav aria-label="Trip planning progress">
        <ol className="grid grid-cols-3 gap-2 rounded-full border border-border bg-white/45 p-1.5 backdrop-blur-sm">
          {steps.map((label, index) => {
            const stepNumber = (index + 1) as 1 | 2 | 3;
            const isActive = stepNumber === step;
            const isComplete = stepNumber < step;

            return (
              <li
                key={label}
                className={cn(
                  "flex min-w-0 items-center justify-center rounded-full px-3 py-2 text-xs font-semibold text-muted transition sm:min-w-28 sm:text-sm",
                  isActive && "bg-green text-white",
                  isComplete && !isActive && "bg-green-soft text-green"
                )}
              >
                <span className="mr-1.5 hidden sm:inline">{stepNumber}</span>
                <span className="truncate">{label}</span>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
