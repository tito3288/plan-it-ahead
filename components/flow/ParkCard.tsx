import Image from "next/image";
import { Ticket } from "lucide-react";

import type { Park } from "@/lib/queries/parks";

type ParkCardProps = {
  park: Park;
};

// Image filenames don't all match slugs, so map the exceptions.
const parkImageOverrides: Record<string, string> = {
  "mount-rainier": "/mount-rainer.jpg",
  shenandoah: "/Shenandoah.jpg",
};

function parkImage(slug: string) {
  return parkImageOverrides[slug] ?? `/${slug}.jpg`;
}

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
    <a
      href={`/plan/${park.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-white/70 shadow-soft backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:border-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
    >
      <div
        className="relative min-h-44 overflow-hidden"
        style={{ background: park.gradient }}
      >
        <Image
          src={parkImage(park.slug)}
          alt={park.full_name ?? park.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

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
    </a>
  );
}
