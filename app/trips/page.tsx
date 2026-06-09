import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteTripAction } from "@/app/trips/actions";
import { createItineraryFromSavedTripAction } from "@/app/trips/itineraries/actions";
import { TripsList } from "@/app/trips/TripsList";
import { Button } from "@/components/ui/button";
import {
  firstName,
  getCurrentUser,
  getCurrentUserProfile
} from "@/lib/auth/session";
import { getItineraryLinksForSavedTrips } from "@/lib/queries/itineraries";
import { getSavedTripsWithParks } from "@/lib/queries/parks";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/trips")}`);
  }

  const [trips, profile] = await Promise.all([
    getSavedTripsWithParks(user.id),
    getCurrentUserProfile()
  ]);
  const name = firstName(profile?.display_name);
  const itineraryLinks = await getItineraryLinksForSavedTrips({
    savedTripIds: trips.map((trip) => trip.id),
    userId: user.id
  });
  const itineraryIdBySavedTripId = Object.fromEntries(
    itineraryLinks.map((link) => [link.savedTripId, link.itineraryId])
  );

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/plan-It-ahead.png"
            alt="PlanItAhead"
            width={1992}
            height={504}
            priority
            className="h-10 w-auto sm:h-14"
          />
        </Link>
        <div className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold">
          <Link
            href="/plan"
            className="inline-flex min-h-10 items-center text-green transition hover:text-amber-deep"
          >
            Plan a trip
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex min-h-10 items-center text-muted transition hover:text-amber-deep"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="mx-auto mt-12 w-full max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
          My Trips
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          Your saved plans
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
          {name
            ? "Your saved park days are ready when you are."
            : "Turn saved forecasts into simple day-by-day itineraries."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/plan" variant="secondary">
            Plan a park day
          </Button>
        </div>

        <div className="mt-8">
          <section>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
                Saved park plans
              </p>
              <h2 className="mt-1 font-heading text-3xl font-semibold text-ink">
                Forecasts you saved
              </h2>
            </div>

            <div className="mt-4">
              {trips.length > 0 ? (
                <TripsList
                  createItineraryAction={createItineraryFromSavedTripAction}
                  deleteAction={deleteTripAction}
                  itineraryIdBySavedTripId={itineraryIdBySavedTripId}
                  trips={trips}
                />
              ) : (
                <div className="rounded-[18px] border border-border bg-white/70 p-6 shadow-soft backdrop-blur-sm">
                  <h3 className="font-heading text-2xl font-semibold text-ink">
                    No saved park plans yet
                  </h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-ink-soft">
                    Pick a park, choose dates, and save the forecast when it
                    looks useful.
                  </p>
                  <Button className="mt-5" href="/plan">
                    Plan one
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
