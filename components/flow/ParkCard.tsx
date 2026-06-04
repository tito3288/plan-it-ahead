import { Ticket } from "lucide-react";
import Link from "next/link";

import type { Park } from "@/lib/queries/parks";

type ParkCardProps = {
  park: Park;
};

function dataNote(dataTier: number) {
  if (dataTier === 1) {
    return "Structured reservation data";
  }

  if (dataTier === 2) {
    return "Official data signals";
  }

  return "Prediction-ready baseline";
}

export function ParkCard({ park }: ParkCardProps) {
  return (
    <Link
      href={`/plan/${park.slug}`}
      prefetch={false}
      className="group overflow-hidden rounded-2xl border border-border bg-white/70 shadow-soft backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:border-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
    >
      <div
        className="relative min-h-44 overflow-hidden"
        style={{ background: park.gradient }}
      >
        <svg
          className="absolute inset-x-0 bottom-0 h-28 w-full text-white/35"
          viewBox="0 0 600 180"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 145L85 78L142 118L228 42L315 125L388 66L468 126L600 58V180H0Z"
            fill="currentColor"
          />
          <path
            d="M0 162L72 120L138 146L210 96L300 154L386 112L470 150L600 108V180H0Z"
            fill="rgba(255,255,255,0.28)"
          />
        </svg>

        {park.requires_reservation ? (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1.5 text-xs font-semibold text-amber-deep shadow-soft">
            <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
            Reservation
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h2 className="font-heading text-2xl font-semibold text-ink transition group-hover:text-green">
          {park.name}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          {park.state} · {park.reservation_note ?? dataNote(park.data_tier)}
        </p>
        {park.blurb ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
            {park.blurb}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
