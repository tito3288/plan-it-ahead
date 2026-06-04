import { Car } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ForecastLotPrediction } from "@/components/forecast/types";

type LotCardProps = {
  prediction: ForecastLotPrediction;
};

const levelStyles = {
  0: {
    chip: "bg-green-soft text-green",
    text: "text-green"
  },
  1: {
    chip: "bg-amber-soft text-amber-deep",
    text: "text-amber-deep"
  },
  2: {
    chip: "bg-red-soft text-red",
    text: "text-red"
  }
};

export function LotCard({ prediction }: LotCardProps) {
  const styles = levelStyles[prediction.level];

  return (
    <article className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span
            className={cn(
              "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              styles.chip
            )}
          >
            <Car className="h-5 w-5" aria-hidden="true" />
          </span>

          <div>
            <h3 className="font-heading text-2xl font-semibold leading-tight text-ink">
              {prediction.lot_name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {prediction.note ?? "Use this area when it best fits your route."}
            </p>
          </div>
        </div>

        <div className="min-w-32 sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Arrive by
          </p>
          <p
            className={cn(
              "mt-1 font-heading text-3xl font-semibold",
              styles.text
            )}
          >
            {prediction.arrive_by}
          </p>
        </div>
      </div>
    </article>
  );
}
