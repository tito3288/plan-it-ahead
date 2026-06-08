import {
  ExternalLink,
  Landmark,
  MapPin,
  Mountain,
  type LucideIcon
} from "lucide-react";

import type { ForecastHighlight } from "@/components/forecast/types";
import { cn } from "@/lib/utils";

type PopularStopsProps = {
  highlights: ForecastHighlight[];
};

const kindMeta: Record<
  ForecastHighlight["kind"],
  {
    icon: LucideIcon;
    label: string;
  }
> = {
  hike: {
    icon: Mountain,
    label: "Hike"
  },
  landmark: {
    icon: Landmark,
    label: "Landmark"
  },
  viewpoint: {
    icon: MapPin,
    label: "Viewpoint"
  }
};

const timingStyles: Record<ForecastHighlight["timing_label"], string> = {
  "Anytime stop": "bg-green-soft text-green",
  "Do early": "bg-red-soft text-red",
  "Good backup": "bg-amber-soft text-amber-deep",
  "Reservation-aware": "bg-white text-green"
};

export function PopularStops({ highlights }: PopularStopsProps) {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
            Popular stops
          </p>
          <h2 className="mt-1 font-heading text-3xl font-semibold text-ink">
            Hikes and landmarks to plan around
          </h2>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {highlights.map((highlight) => {
          const meta = kindMeta[highlight.kind];
          const Icon = meta.icon;

          return (
            <article
              key={highlight.id}
              className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-soft text-green">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {meta.label}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        timingStyles[highlight.timing_label]
                      )}
                    >
                      {highlight.timing_label}
                    </span>
                  </div>

                  <h3 className="mt-2 font-heading text-2xl font-semibold leading-tight text-ink">
                    {highlight.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-green">
                    {highlight.area}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">
                    {highlight.planning_note}
                  </p>

                  {highlight.source_url ? (
                    <a
                      href={highlight.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green transition hover:text-amber-deep"
                    >
                      Official NPS
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
