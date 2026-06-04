import { ArrowRight, CalendarDays } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type HomePageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function firstSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function callbackQuery(searchParams: HomePageProps["searchParams"]) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const firstValue = firstSearchParamValue(value);

    if (firstValue) {
      params.set(key, firstValue);
    }
  }

  return params.toString();
}

export default function HomePage({ searchParams }: HomePageProps) {
  if (searchParams.code) {
    const query = callbackQuery(searchParams);

    redirect(`/auth/callback${query ? `?${query}` : ""}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-white/45 px-4 py-2 text-sm font-medium text-amber-deep">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          National park planning, before you go
        </div>

        <h1 className="font-heading text-5xl font-semibold leading-none text-green sm:text-7xl">
          PlanItAhead
        </h1>

        <p className="mt-5 font-heading text-2xl font-medium text-ink sm:text-4xl">
          Know before you go.
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
          Pick a park and dates, then see when parking and entry are likely to
          feel easiest so the day starts with trail time instead of guesswork.
        </p>

        <div className="mt-8 flex justify-center">
          <Button href="/plan" className="group">
            Plan a trip
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Button>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
              Step 1
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold">
              Choose a park
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Start with a curated set of high-demand parks.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
              Step 2
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold">
              Pick dates
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Compare the days and hours that matter for your visit.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
              Step 3
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold">
              Arrive calm
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Save a simple plan with an arrive-by time.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
