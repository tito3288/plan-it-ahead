"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  type DateRange,
  getNextDateRange,
  isDateInRange
} from "@/components/flow/calendarRange";
import { cn } from "@/lib/utils";
import { getWeatherCodeMeta } from "@/lib/weather/weatherCode";

type CalendarProps = {
  forecastWindowEnd: string;
  park: {
    name: string;
    requires_reservation: boolean;
    slug: string;
  };
  today: string;
  weatherRows: Array<{
    forecast_date: string;
    temp_high: number | null;
    weather_code: number | null;
  }>;
  weatherWindowEnd: string;
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  );
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
    year: "numeric"
  }).format(date);
}

function formatRangeDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  }).format(parseDate(date));
}

function dateLabel(range: DateRange) {
  if (!range.start) {
    return "Choose a start date";
  }

  if (!range.end || range.start === range.end) {
    return `${formatRangeDate(range.start)} — pick an end date`;
  }

  return `${formatRangeDate(range.start)} – ${formatRangeDate(range.end)}`;
}

function buildMonthGrid(month: Date) {
  const first = startOfMonth(month);
  const gridStart = addDays(first, -first.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function isWeekend(date: Date) {
  const day = date.getUTCDay();

  return day === 0 || day === 6;
}

export function Calendar({
  forecastWindowEnd,
  park,
  today,
  weatherRows,
  weatherWindowEnd
}: CalendarProps) {
  const router = useRouter();
  const todayDate = useMemo(() => parseDate(today), [today]);
  const forecastEndDate = useMemo(
    () => parseDate(forecastWindowEnd),
    [forecastWindowEnd]
  );
  const weatherByDate = useMemo(
    () => new Map(weatherRows.map((row) => [row.forecast_date, row])),
    [weatherRows]
  );
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(todayDate));
  const [range, setRange] = useState<DateRange>({
    end: null,
    start: null
  });
  const days = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const canGoBack = monthKey(visibleMonth) > monthKey(todayDate);

  function selectDate(date: Date) {
    const iso = toIsoDate(date);

    setRange((current) => getNextDateRange(current, iso, today));
  }

  function goToForecast() {
    if (!range.start) {
      return;
    }

    const params = new URLSearchParams({ start: range.start });

    if (range.end) {
      params.set("end", range.end);
    }

    router.push(`/plan/${park.slug}/forecast?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-white/70 p-4 shadow-soft backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
          disabled={!canGoBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/60 text-green transition hover:border-green disabled:pointer-events-none disabled:opacity-35"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2 className="font-heading text-2xl font-semibold text-ink">
          {formatMonth(visibleMonth)}
        </h2>

        <button
          type="button"
          onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/60 text-green transition hover:border-green"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-muted sm:gap-2">
        {dayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date) => {
          const iso = toIsoDate(date);
          const isOutsideMonth =
            date.getUTCMonth() !== visibleMonth.getUTCMonth();
          const isPast = iso < today;
          const isForecastWindow = iso >= today && date <= forecastEndDate;
          const isStart = range.start === iso;
          const isEnd = range.end === iso;
          const isSelected = isStart || isEnd;
          const isInRange = isDateInRange(range, iso);
          const weather = weatherByDate.get(iso);
          const weatherMeta = weather
            ? getWeatherCodeMeta(weather.weather_code)
            : null;
          const WeatherIcon = weatherMeta?.icon;
          const tempHigh = weather?.temp_high ?? null;

          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              onClick={() => selectDate(date)}
              className={cn(
                "relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl border text-sm font-semibold transition sm:min-h-12",
                isOutsideMonth && !isSelected && !isInRange && "text-muted/45",
                isPast
                  ? "text-muted/30 border-transparent"
                  : !isSelected &&
                      !isInRange &&
                      "border-border bg-white/45 text-ink hover:border-green hover:bg-green-soft",
                isForecastWindow &&
                  !isPast &&
                  "after:bg-green/35 after:absolute after:bottom-1 after:h-1 after:w-5 after:rounded-full",
                isInRange && "border-green-soft bg-green-soft text-green",
                isSelected &&
                  "border-green bg-green text-white after:bg-white/60 hover:bg-green"
              )}
            >
              {WeatherIcon && !isPast ? (
                <span
                  className={cn(
                    "absolute left-1 top-1 inline-flex max-w-[calc(100%-0.5rem)] items-center gap-0.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[0.58rem] font-bold leading-none text-green shadow-sm sm:left-1.5 sm:top-1.5 sm:text-[0.65rem]",
                    (isStart || isEnd) && "bg-white/95 text-green"
                  )}
                  aria-label={`${weatherMeta.label}${
                    tempHigh === null
                      ? ""
                      : `, ${Math.round(tempHigh)} degrees`
                  }`}
                >
                  <WeatherIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {tempHigh !== null ? (
                    <span className="hidden sm:inline">
                      {Math.round(tempHigh)}°
                    </span>
                  ) : null}
                </span>
              ) : null}
              <span>{date.getUTCDate()}</span>
              {park.requires_reservation && isWeekend(date) && !isPast ? (
                <span
                  className={cn(
                    "absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber",
                    (isStart || isEnd) && "bg-amber-soft"
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-white/55 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Your dates</p>
          <p className="mt-1 text-sm text-ink-soft">{dateLabel(range)}</p>
        </div>
        <Button onClick={goToForecast} disabled={!range.start}>
          See my forecast
        </Button>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
        <p>
          <span className="bg-green/35 mr-2 inline-block h-1.5 w-5 rounded-full align-middle" />
          Detailed weather through {formatRangeDate(weatherWindowEnd)};
          seasonal estimates through {formatRangeDate(forecastWindowEnd)}.
        </p>
        {park.requires_reservation ? (
          <p>
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber align-middle" />
            Reservation recommended on dotted days.
          </p>
        ) : (
          <p>Dates beyond the forecast window may show limited detail.</p>
        )}
      </div>
    </div>
  );
}
