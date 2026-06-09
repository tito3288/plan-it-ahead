"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, FileText, Plus, Trash2 } from "lucide-react";

import {
  buildDateRange,
  dateRangeLabel,
  formatItineraryDayDate
} from "@/app/trips/date";
import { formatItineraryTitle } from "@/app/trips/itinerary-title";
import type {
  ItineraryItemWithSavedTrip,
  ItineraryWithItems
} from "@/lib/queries/itineraries";
import type { SavedTripWithPark } from "@/lib/queries/parks";

type ItineraryDetailProps = {
  addNoteAction: (formData: FormData) => void | Promise<void>;
  deleteItineraryAction: (formData: FormData) => void | Promise<void>;
  deleteItemAction: (formData: FormData) => void | Promise<void>;
  itinerary: ItineraryWithItems;
};

function forecastHref(trip: SavedTripWithPark) {
  const params = new URLSearchParams({
    start: trip.start_date
  });

  if (trip.end_date) {
    params.set("end", trip.end_date);
  }

  return `/plan/${trip.park.slug}/forecast?${params.toString()}`;
}

function itemsForDate(items: ItineraryItemWithSavedTrip[], date: string) {
  return items.filter((item) => item.item_date === date);
}

export function ItineraryDetail({
  addNoteAction,
  deleteItineraryAction,
  deleteItemAction,
  itinerary
}: ItineraryDetailProps) {
  const dates = buildDateRange(itinerary.start_date, itinerary.end_date);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
            Itinerary
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            {formatItineraryTitle(itinerary.title)}
          </h1>
          <p className="mt-4 text-lg leading-8 text-ink-soft">
            {dateRangeLabel(itinerary.start_date, itinerary.end_date)}
          </p>
          {itinerary.notes ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-soft">
              {itinerary.notes}
            </p>
          ) : null}
        </div>

        <form
          action={deleteItineraryAction}
          onSubmit={(event) => {
            if (!window.confirm("Delete this itinerary?")) {
              event.preventDefault();
            }
          }}
        >
          <input name="itineraryId" type="hidden" value={itinerary.id} />
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted transition hover:bg-red-soft hover:text-red"
            type="submit"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete Itinerary
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-5">
        {dates.map((date) => {
          const dayItems = itemsForDate(itinerary.items, date);
          const hasNote = dayItems.some((item) => item.item_type === "note");

          return (
            <section
              key={date}
              className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-soft text-green">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
                    Day plan
                  </p>
                  <h2 className="font-heading text-3xl font-semibold text-ink">
                    {formatItineraryDayDate(date)}
                  </h2>
                </div>
              </div>

              {dayItems.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {dayItems.map((item) => (
                    <ItineraryItemCard
                      deleteAction={deleteItemAction}
                      item={item}
                      itineraryId={itinerary.id}
                      key={item.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-ink-soft">
                  Nothing planned for this day yet.
                </p>
              )}

              <div className="mt-5">
                <AddNoteForm
                  action={addNoteAction}
                  hasExistingNote={hasNote}
                  itemDate={date}
                  itineraryId={itinerary.id}
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AddNoteForm({
  action,
  hasExistingNote,
  itemDate,
  itineraryId
}: {
  action: (formData: FormData) => void | Promise<void>;
  hasExistingNote: boolean;
  itemDate: string;
  itineraryId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isExpanded, setIsExpanded] = useState(!hasExistingNote);

  useEffect(() => {
    if (!hasExistingNote) {
      setIsExpanded(true);
    }
  }, [hasExistingNote]);

  if (!isExpanded) {
    return (
      <button
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white/60 px-4 text-sm font-semibold text-green transition hover:border-green hover:bg-green-soft"
        onClick={() => setIsExpanded(true)}
        type="button"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add note
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
        setIsExpanded(false);
      }}
      className="rounded-[14px] border border-border bg-white/55 p-4"
      ref={formRef}
    >
      <input name="itineraryId" type="hidden" value={itineraryId} />
      <input name="itemDate" type="hidden" value={itemDate} />
      <label>
        <span className="text-sm font-semibold text-ink">Add note</span>
        <input
          className="mt-2 min-h-11 w-full rounded-[12px] border border-border bg-white/80 px-3 text-sm text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green-soft"
          name="title"
          placeholder="Morning hike, lunch stop, or backup plan"
          required
        />
      </label>
      <textarea
        className="mt-2 min-h-20 w-full rounded-[12px] border border-border bg-white/80 px-3 py-2 text-sm leading-6 text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green-soft"
        name="notes"
        placeholder="Times, trailhead notes, parking reminders, or reservation details"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-10 items-center rounded-full bg-green px-4 text-sm font-semibold text-white transition hover:bg-[#284f32]"
          type="submit"
        >
          Add note
        </button>
        {hasExistingNote ? (
          <button
            className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold text-muted transition hover:bg-green-soft hover:text-green"
            onClick={() => {
              formRef.current?.reset();
              setIsExpanded(false);
            }}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function NoteDetails({ notes }: { notes: string }) {
  const noteLines = notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (noteLines.length <= 1) {
    return <p className="mt-1 text-sm leading-6 text-ink-soft">{notes}</p>;
  }

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
      {noteLines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
}

function ItineraryItemCard({
  deleteAction,
  item,
  itineraryId
}: {
  deleteAction: (formData: FormData) => void | Promise<void>;
  item: ItineraryItemWithSavedTrip;
  itineraryId: string;
}) {
  if (item.item_type === "saved_trip" && item.savedTrip) {
    return (
      <article className="rounded-[14px] border border-border bg-white/65 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-deep">
              Saved park plan
            </p>
            <h3 className="mt-1 font-heading text-2xl font-semibold text-ink">
              {item.savedTrip.title ?? item.savedTrip.park.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              {item.savedTrip.park.full_name} ·{" "}
              {dateRangeLabel(
                item.savedTrip.start_date,
                item.savedTrip.end_date
              )}
            </p>
          </div>

          <ItemActions
            deleteAction={deleteAction}
            itemId={item.id}
            itineraryId={itineraryId}
            viewHref={forecastHref(item.savedTrip)}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[14px] border border-border bg-white/65 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber-deep">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-deep">
              Note
            </p>
            <h3 className="mt-1 font-heading text-2xl font-semibold text-ink">
              {item.title}
            </h3>
            {item.notes ? <NoteDetails notes={item.notes} /> : null}
          </div>
        </div>

        <ItemActions
          deleteAction={deleteAction}
          itemId={item.id}
          itineraryId={itineraryId}
        />
      </div>
    </article>
  );
}

function ItemActions({
  deleteAction,
  itemId,
  itineraryId,
  viewHref
}: {
  deleteAction: (formData: FormData) => void | Promise<void>;
  itemId: string;
  itineraryId: string;
  viewHref?: string;
}) {
  return (
    <div className="flex items-center gap-2 self-start sm:justify-end">
      {viewHref ? (
        <Link
          href={viewHref}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-green px-4 text-sm font-semibold text-white transition hover:bg-[#284f32]"
        >
          View forecast
        </Link>
      ) : null}
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm("Delete this item?")) {
            event.preventDefault();
          }
        }}
      >
        <input name="itemId" type="hidden" value={itemId} />
        <input name="itineraryId" type="hidden" value={itineraryId} />
        <button
          aria-label="Delete item"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-red-soft hover:text-red"
          title="Delete item"
          type="submit"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
