import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandHeader } from "@/components/flow/BrandHeader";
import { Button } from "@/components/ui/button";
import { getParkBySlug } from "@/lib/queries/parks";

export const dynamic = "force-dynamic";

type ForecastStubPageProps = {
  params: {
    slug: string;
  };
  searchParams: {
    end?: string;
    start?: string;
  };
};

function parseDateLabel(date: string | undefined) {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default async function ForecastStubPage({
  params,
  searchParams
}: ForecastStubPageProps) {
  const park = await getParkBySlug(params.slug);

  if (!park) {
    notFound();
  }

  const startLabel = parseDateLabel(searchParams.start);
  const endLabel = parseDateLabel(searchParams.end);
  const dateLabel = startLabel
    ? endLabel && endLabel !== startLabel
      ? `${startLabel} – ${endLabel}`
      : startLabel
    : "No dates selected";

  return (
    <main className="min-h-screen pb-12">
      <BrandHeader step={3} />

      <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 pt-16 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
          Step 3 of 3
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          Forecast for {park.name}
        </h1>
        <p className="mt-5 text-xl leading-8 text-ink-soft">
          {dateLabel} — built in Phase 6.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          The real forecast screen will show hourly crowd status, lot arrive-by
          guidance, alerts, and a simple daily plan.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/plan">Choose another park</Button>
          <Button href={`/plan/${park.slug}`} variant="secondary">
            Edit dates
          </Button>
        </div>
        <Link
          href="/"
          className="mt-8 text-sm font-semibold text-green transition hover:text-amber-deep"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
