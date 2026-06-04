import { AlertTriangle, Info } from "lucide-react";

import type { ForecastAlert, ForecastPark } from "@/components/forecast/types";

type AlertsBannerProps = {
  alerts: ForecastAlert[];
  park: ForecastPark;
};

export function AlertsBanner({ alerts, park }: AlertsBannerProps) {
  if (!park.requires_reservation && alerts.length === 0) {
    return null;
  }

  const visibleAlerts = alerts.slice(0, 2);

  return (
    <aside className="border-amber/25 rounded-[18px] border bg-amber-soft p-4 text-amber-deep shadow-soft sm:p-5">
      <div className="flex gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/55">
          {alerts.length > 0 ? (
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Info className="h-5 w-5" aria-hidden="true" />
          )}
        </span>

        <div className="space-y-3">
          {park.requires_reservation ? (
            <div>
              <p className="font-semibold text-ink">Reservation reminder</p>
              <p className="mt-1 text-sm leading-6 text-ink-soft">
                {park.reservation_note ??
                  "Timed-entry or day-use reservations may be required."}
              </p>
            </div>
          ) : null}

          {visibleAlerts.map((alert) => (
            <div key={alert.id}>
              <p className="font-semibold text-ink">{alert.title}</p>
              {alert.description ? (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-soft">
                  {alert.description}
                </p>
              ) : null}
              {alert.url ? (
                <a
                  href={alert.url}
                  className="mt-1 inline-block text-sm font-semibold text-green transition hover:text-amber-deep"
                  rel="noreferrer"
                  target="_blank"
                >
                  View park alert
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
