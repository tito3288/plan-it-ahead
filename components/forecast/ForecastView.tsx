"use client";

import { CloudSun } from "lucide-react";
import { useMemo, useState } from "react";

import { AlertsBanner } from "@/components/forecast/AlertsBanner";
import { ConfidenceChip } from "@/components/forecast/ConfidenceChip";
import { DailyPlan } from "@/components/forecast/DailyPlan";
import { HourlyBar } from "@/components/forecast/HourlyBar";
import { LotCard } from "@/components/forecast/LotCard";
import type {
  ForecastAlert,
  ForecastDay,
  ForecastPark,
  ForecastSaveTrip
} from "@/components/forecast/types";
import { SaveTripButton } from "@/components/forecast/SaveTripButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ForecastViewProps = {
  alerts: ForecastAlert[];
  dateRangeLabel: string;
  days: ForecastDay[];
  park: ForecastPark;
  saveTrip: ForecastSaveTrip;
};

function formatTabDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short"
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatPlanDay(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "long"
  }).format(new Date(`${date}T00:00:00Z`));
}

function sourceNote(source: string) {
  if (source === "live") {
    return "Live-informed estimate";
  }

  if (source === "mixed") {
    return "Prediction using park rules and planning data";
  }

  return "Prediction using planning data";
}

export function ForecastView({
  alerts,
  dateRangeLabel,
  days,
  park,
  saveTrip
}: ForecastViewProps) {
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");
  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? days[0],
    [days, selectedDate]
  );
  const forecast = selectedDay?.forecast ?? null;
  const selectedLabel = selectedDay ? formatPlanDay(selectedDay.date) : "";

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
          Your forecast
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          {park.full_name}
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">{dateRangeLabel}</p>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const isActive = day.date === selectedDay?.date;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={cn(
                "min-w-32 rounded-full border px-4 py-3 text-left text-sm font-semibold transition",
                isActive
                  ? "border-green bg-green text-white"
                  : "border-border bg-white/60 text-green hover:border-green hover:bg-green-soft"
              )}
            >
              {formatTabDate(day.date)}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-5">
        <AlertsBanner alerts={alerts} park={park} />

        {forecast ? (
          <>
            <div className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-deep">
                    <CloudSun className="h-5 w-5" aria-hidden="true" />
                    {forecast.weather_summary ?? "Forecast estimate"}
                  </div>
                  <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                    {forecast.headline ?? "A steady planning day"}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
                    {sourceNote(forecast.source)}. Treat these as planning
                    guidance, not guaranteed live lot status.
                  </p>
                </div>

                <ConfidenceChip
                  confidence={forecast.confidence}
                  source={forecast.source}
                />
              </div>
            </div>

            <HourlyBar statuses={forecast.hourly_status} />

            <div className="grid gap-4 lg:grid-cols-2">
              {forecast.lot_predictions.map((prediction) => (
                <LotCard key={prediction.lot_id} prediction={prediction} />
              ))}
            </div>

            <DailyPlan dayLabel={selectedLabel} steps={forecast.daily_plan} />
          </>
        ) : (
          <div className="rounded-[18px] border border-border bg-white/70 p-6 shadow-soft backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
              Forecast not ready
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-ink">
              We do not have a detailed forecast for this date yet.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
              As a general guide, arrive early on weekends and holidays, check
              current park alerts, and keep one backup stop in your plan.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <SaveTripButton
          endDate={saveTrip.endDate}
          forecastPath={saveTrip.forecastPath}
          initialSaved={saveTrip.initialSaved}
          isSignedIn={saveTrip.isSignedIn}
          loginHref={saveTrip.loginHref}
          parkId={park.id}
          startDate={saveTrip.startDate}
          title={saveTrip.title}
        />
        <Button href="/plan" variant="secondary">
          Choose another park
        </Button>
        <Button href={`/plan/${park.slug}`} variant="secondary">
          Edit dates
        </Button>
      </div>
    </section>
  );
}
