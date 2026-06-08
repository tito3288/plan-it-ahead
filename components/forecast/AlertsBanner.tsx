"use client";

import { AlertTriangle, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { ForecastAlert, ForecastPark } from "@/components/forecast/types";
import { cn } from "@/lib/utils";

type AlertsBannerProps = {
  alerts: ForecastAlert[];
  park: ForecastPark;
};

export function AlertsBanner({ alerts, park }: AlertsBannerProps) {
  const [expandedAlertIds, setExpandedAlertIds] = useState<Set<string>>(
    () => new Set()
  );
  const visibleAlerts = alerts.slice(0, 2);

  if (!park.requires_reservation && alerts.length === 0) {
    return null;
  }

  function toggleAlert(alertId: string) {
    setExpandedAlertIds((current) => {
      const next = new Set(current);

      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }

      return next;
    });
  }

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
            <AlertItem
              alert={alert}
              expanded={expandedAlertIds.has(alert.id)}
              key={alert.id}
              onToggle={() => toggleAlert(alert.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function AlertItem({
  alert,
  expanded,
  onToggle
}: {
  alert: ForecastAlert;
  expanded: boolean;
  onToggle: () => void;
}) {
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const description = descriptionRef.current;

    if (!description || expanded) {
      return;
    }

    function updateCanExpand() {
      if (!description) {
        return;
      }

      setCanExpand(description.scrollHeight > description.clientHeight + 1);
    }

    updateCanExpand();

    const resizeObserver = new ResizeObserver(updateCanExpand);
    resizeObserver.observe(description);

    return () => {
      resizeObserver.disconnect();
    };
  }, [alert.description, expanded]);

  return (
    <div>
      <p className="font-semibold text-ink">{alert.title}</p>
      {alert.description ? (
        <>
          <p
            className={cn(
              "mt-1 text-sm leading-6 text-ink-soft",
              !expanded && "line-clamp-2"
            )}
            ref={descriptionRef}
          >
            {alert.description}
          </p>
        </>
      ) : null}
      {canExpand || alert.url ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {canExpand ? (
            <button
              aria-expanded={expanded}
              className="text-sm font-semibold text-green transition hover:text-amber-deep"
              onClick={onToggle}
              type="button"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          ) : null}
          {alert.url ? (
            <a
              href={alert.url}
              className="text-sm font-semibold text-green transition hover:text-amber-deep"
              rel="noreferrer"
              target="_blank"
            >
              View park alert
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
