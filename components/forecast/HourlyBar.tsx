import { forecastConfig, type ForecastStatus } from "@/lib/forecast/config";
import { cn } from "@/lib/utils";

type HourlyBarProps = {
  isTypicalPattern?: boolean;
  statuses: ForecastStatus[];
};

const statusMeta: Record<
  ForecastStatus,
  {
    bar: string;
    height: string;
    label: string;
    swatch: string;
  }
> = {
  0: {
    bar: "bg-green",
    height: "2.25rem",
    label: "Easy",
    swatch: "bg-green"
  },
  1: {
    bar: "bg-amber",
    height: "4rem",
    label: "Filling",
    swatch: "bg-amber"
  },
  2: {
    bar: "bg-red",
    height: "6rem",
    label: "Full",
    swatch: "bg-red"
  }
};

function hourLabel(hour: number) {
  if (hour === 12) {
    return "12p";
  }

  if (hour > 12) {
    return `${hour - 12}p`;
  }

  return `${hour}a`;
}

export function HourlyBar({
  isTypicalPattern = false,
  statuses
}: HourlyBarProps) {
  return (
    <section className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
            Parking outlook
          </p>
          <h2 className="mt-1 font-heading text-3xl font-semibold text-ink">
            Hour by hour
          </h2>
          {isTypicalPattern ? (
            <p className="mt-2 text-sm font-semibold text-ink-soft">
              Typical pattern
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {([0, 1, 2] as ForecastStatus[]).map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink-soft"
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  statusMeta[status].swatch
                )}
              />
              {statusMeta[status].label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-[repeat(14,minmax(0,1fr))] items-end gap-1.5 overflow-hidden sm:gap-2">
        {forecastConfig.hourlySlots.map((hour, index) => {
          const status = statuses[index] ?? 0;

          return (
            <div
              key={hour}
              className="flex min-w-0 flex-col items-center gap-2"
            >
              <div className="flex h-28 items-end">
                <div
                  className={cn(
                    "w-3 rounded-full shadow-sm transition-[height,background-color,transform] duration-500 motion-reduce:transition-none sm:w-4",
                    statusMeta[status].bar
                  )}
                  style={{
                    height: statusMeta[status].height,
                    transitionTimingFunction:
                      "cubic-bezier(0.34, 1.56, 0.64, 1)"
                  }}
                  aria-label={`${hourLabel(hour)} ${statusMeta[status].label}`}
                />
              </div>
              <span className="h-4 text-[0.65rem] font-semibold text-muted sm:text-xs">
                {index % 2 === 0 ? hourLabel(hour) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
