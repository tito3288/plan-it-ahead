"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

import type { SavedTripWithPark } from "@/lib/queries/parks";

type TripsListProps = {
  createItineraryAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  itineraryIdBySavedTripId: Record<string, string>;
  trips: SavedTripWithPark[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}

function dateLabel(trip: SavedTripWithPark) {
  if (!trip.end_date || trip.end_date === trip.start_date) {
    return formatDate(trip.start_date);
  }

  return `${formatDate(trip.start_date)} – ${formatDate(trip.end_date)}`;
}

function forecastHref(trip: SavedTripWithPark) {
  const params = new URLSearchParams({
    start: trip.start_date
  });

  if (trip.end_date) {
    params.set("end", trip.end_date);
  }

  return `/plan/${trip.park.slug}/forecast?${params.toString()}`;
}

export function TripsList({
  createItineraryAction,
  deleteAction,
  itineraryIdBySavedTripId,
  trips
}: TripsListProps) {
  return (
    <div className="grid gap-4">
      {trips.map((trip) => {
        const itineraryId = itineraryIdBySavedTripId[trip.id];

        return (
          <article
            key={trip.id}
            className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
                  {dateLabel(trip)}
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold text-ink">
                  {trip.title ?? trip.park.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  {trip.park.full_name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Link
                  href={forecastHref(trip)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-green px-5 text-sm font-semibold text-white transition hover:bg-[#284f32]"
                >
                  View forecast
                </Link>

                {itineraryId ? (
                  <Link
                    href={`/trips/itineraries/${itineraryId}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-cream px-5 text-sm font-semibold text-green transition hover:border-amber hover:text-amber-deep"
                  >
                    View Itinerary
                  </Link>
                ) : (
                  <form action={createItineraryAction}>
                    <input name="savedTripId" type="hidden" value={trip.id} />
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-cream px-5 text-sm font-semibold text-green transition hover:border-amber hover:text-amber-deep"
                      type="submit"
                    >
                      Create Itinerary
                    </button>
                  </form>
                )}

                <form
                  action={deleteAction}
                  onSubmit={(event) => {
                    if (!window.confirm("Delete this saved trip?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input name="tripId" type="hidden" value={trip.id} />
                  <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted transition hover:bg-red-soft hover:text-red"
                    type="submit"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
