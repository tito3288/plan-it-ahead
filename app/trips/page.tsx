import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteTripAction } from "@/app/trips/actions";
import { TripsList } from "@/app/trips/TripsList";
import { Button } from "@/components/ui/button";
import {
  firstName,
  getCurrentUser,
  getCurrentUserProfile
} from "@/lib/auth/session";
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

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="font-heading text-3xl font-semibold leading-none text-green"
        >
          PlanItAhead
        </Link>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link
            href="/plan"
            className="text-green transition hover:text-amber-deep"
          >
            Plan a trip
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-muted transition hover:text-amber-deep"
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
          {name ? `${name}'s trail-ready plans` : "Saved plans"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
          {name
            ? "Your saved park days are ready when you are."
            : "Revisit forecast windows you have saved for upcoming park days."}
        </p>

        <div className="mt-8">
          {trips.length > 0 ? (
            <TripsList deleteAction={deleteTripAction} trips={trips} />
          ) : (
            <div className="rounded-[18px] border border-border bg-white/70 p-6 shadow-soft backdrop-blur-sm">
              <h2 className="font-heading text-3xl font-semibold text-ink">
                No saved trips yet
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-ink-soft">
                Pick a park, choose dates, and save the forecast when it looks
                useful.
              </p>
              <Button className="mt-5" href="/plan">
                Plan one
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
