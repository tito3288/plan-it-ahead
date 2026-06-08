import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  addNoteToItineraryAction,
  deleteItineraryAction,
  deleteItineraryItemAction
} from "@/app/trips/itineraries/actions";
import { ItineraryDetail } from "@/app/trips/itineraries/[id]/ItineraryDetail";
import { getCurrentUser } from "@/lib/auth/session";
import { getItineraryWithItems } from "@/lib/queries/itineraries";

export const dynamic = "force-dynamic";

type ItineraryPageProps = {
  params: {
    id: string;
  };
};

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/trips/itineraries/${params.id}`)}`
    );
  }

  const itinerary = await getItineraryWithItems(params.id, user.id);

  if (!itinerary) {
    notFound();
  }

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
        <Link
          href="/trips"
          className="text-sm font-semibold text-green transition hover:text-amber-deep"
        >
          Back to My Trips
        </Link>
      </div>

      <section className="mx-auto mt-12 w-full max-w-6xl">
        <ItineraryDetail
          addNoteAction={addNoteToItineraryAction}
          deleteItineraryAction={deleteItineraryAction}
          deleteItemAction={deleteItineraryItemAction}
          itinerary={itinerary}
        />
      </section>
    </main>
  );
}
