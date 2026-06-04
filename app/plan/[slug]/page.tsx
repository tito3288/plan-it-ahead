import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandHeader } from "@/components/flow/BrandHeader";
import { Calendar } from "@/components/flow/Calendar";
import { getParkBySlug } from "@/lib/queries/parks";

export const dynamic = "force-dynamic";

type ParkCalendarPageProps = {
  params: {
    slug: string;
  };
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function todayUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export default async function ParkCalendarPage({
  params
}: ParkCalendarPageProps) {
  const park = await getParkBySlug(params.slug);

  if (!park) {
    notFound();
  }

  const today = todayUtc();
  const todayIso = toIsoDate(today);
  const forecastWindowEnd = toIsoDate(addDays(today, 13));

  return (
    <main className="min-h-screen pb-12">
      <BrandHeader step={2} />

      <section className="mx-auto w-full max-w-5xl px-5 pt-5 sm:px-8">
        <Link
          href="/plan"
          className="text-sm font-semibold text-green transition hover:text-amber-deep"
        >
          Back to parks
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-amber-deep">
          Step 2 of 3 · {park.name}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          When are you visiting?
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
          Pick a date range. The next two weeks have the strongest forecast
          detail.
        </p>

        <div className="mt-8">
          <Calendar
            forecastWindowEnd={forecastWindowEnd}
            park={{
              name: park.name,
              requires_reservation: park.requires_reservation,
              slug: park.slug
            }}
            today={todayIso}
          />
        </div>
      </section>
    </main>
  );
}
