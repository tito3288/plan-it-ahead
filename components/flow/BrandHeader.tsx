import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type BrandHeaderProps = {
  step: 1 | 2 | 3;
};

const steps = ["Park", "Dates", "Forecast"] as const;

export async function BrandHeader({ step }: BrandHeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-heading text-3xl font-semibold leading-none text-green"
        >
          PlanItAhead
        </Link>

        <div className="flex items-center gap-3 text-sm font-semibold lg:hidden">
          {user ? (
            <>
              <Link
                href="/trips"
                className="text-green transition hover:text-amber-deep"
              >
                My Trips
              </Link>
              <Link
                href="/auth/signout"
                className="text-muted transition hover:text-amber-deep"
              >
                Sign out
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-green transition hover:text-amber-deep"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
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

        <div className="hidden items-center gap-3 text-sm font-semibold lg:flex">
          {user ? (
            <>
              <Link
                href="/trips"
                className="text-green transition hover:text-amber-deep"
              >
                My Trips
              </Link>
              <Link
                href="/auth/signout"
                className="text-muted transition hover:text-amber-deep"
              >
                Sign out
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-green transition hover:text-amber-deep"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
