import { BrandHeader } from "@/components/flow/BrandHeader";
import { ParkCard } from "@/components/flow/ParkCard";
import { firstName, getCurrentUserProfile } from "@/lib/auth/session";
import { getActiveParks } from "@/lib/queries/parks";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const [parks, profile] = await Promise.all([
    getActiveParks(),
    getCurrentUserProfile()
  ]);
  const name = firstName(profile?.display_name);

  return (
    <main className="min-h-screen pb-12">
      <BrandHeader step={1} />

      <section className="mx-auto w-full max-w-6xl px-5 pt-5 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
          Step 1 of 3
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          {name ? `Hi ${name}, where are you headed?` : "Where are you headed?"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
          Choose one of the launch parks with trustworthy planning signals.
        </p>

        {parks.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {parks.map((park) => (
              <ParkCard key={park.id} park={park} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-border bg-white/70 p-6 text-ink-soft shadow-soft">
            No parks are available yet.
          </div>
        )}
      </section>
    </main>
  );
}
