import {
  BedDouble,
  Building2,
  ExternalLink,
  Tent,
  type LucideIcon
} from "lucide-react";

import type { ForecastStayOption } from "@/components/forecast/types";
import { cn } from "@/lib/utils";

type WhereToStayNearbyProps = {
  stayOptions: ForecastStayOption[];
};

const kindMeta: Record<
  ForecastStayOption["kind"],
  {
    icon: LucideIcon;
    label: string;
  }
> = {
  campground_area: {
    icon: Tent,
    label: "Campground area"
  },
  gateway_town: {
    icon: Building2,
    label: "Gateway town"
  },
  in_park_lodging: {
    icon: BedDouble,
    label: "In-park lodging"
  }
};

export function WhereToStayNearby({ stayOptions }: WhereToStayNearbyProps) {
  if (stayOptions.length === 0) {
    return null;
  }

  return (
    <section>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
          Where to stay nearby
        </p>
        <h2 className="mt-1 font-heading text-3xl font-semibold text-ink">
          Bases that fit this park day
        </h2>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {stayOptions.map((stayOption, index) => {
          const meta = kindMeta[stayOption.kind];
          const Icon = meta.icon;
          const isLastOddCard =
            stayOptions.length % 2 === 1 && index === stayOptions.length - 1;

          return (
            <article
              key={stayOption.id}
              className={cn(
                "rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm",
                isLastOddCard && "lg:col-span-2"
              )}
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber-deep">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {meta.label}
                    </span>
                    <span className="rounded-full bg-green-soft px-2.5 py-1 text-xs font-semibold text-green">
                      {stayOption.best_for_label}
                    </span>
                  </div>

                  <h3 className="mt-2 font-heading text-2xl font-semibold leading-tight text-ink">
                    {stayOption.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-green">
                    {stayOption.area}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">
                    {stayOption.drive_note}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {stayOption.planning_note}
                  </p>

                  {stayOption.source_url ? (
                    <a
                      href={stayOption.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green transition hover:text-amber-deep"
                    >
                      Official info
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
