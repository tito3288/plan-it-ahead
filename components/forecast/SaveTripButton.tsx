"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import {
  saveTripAction,
  type SaveTripState
} from "@/app/plan/[slug]/forecast/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SaveTripButtonProps = {
  endDate: string;
  forecastPath: string;
  initialSaved: boolean;
  isSignedIn: boolean;
  loginHref: string;
  parkId: string;
  startDate: string;
  title: string;
};

const initialState: SaveTripState = {
  message: null,
  status: "idle",
  tripId: null
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={disabled || pending} type="submit">
      {disabled ? "Saved" : pending ? "Saving..." : "Save this trip"}
    </Button>
  );
}

export function SaveTripButton({
  endDate,
  forecastPath,
  initialSaved,
  isSignedIn,
  loginHref,
  parkId,
  startDate,
  title
}: SaveTripButtonProps) {
  const startingState: SaveTripState = {
    ...initialState,
    message: initialSaved ? "Saved. View it in My Trips." : null,
    status: initialSaved ? "saved" : "idle"
  };
  const [state, formAction] = useFormState(saveTripAction, startingState);
  const isSaved = state.status === "saved";

  if (!isSignedIn) {
    return <Button href={loginHref}>Save this trip</Button>;
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        <input name="parkId" type="hidden" value={parkId} />
        <input name="startDate" type="hidden" value={startDate} />
        <input name="endDate" type="hidden" value={endDate} />
        <input name="title" type="hidden" value={title} />
        <input name="forecastPath" type="hidden" value={forecastPath} />
        <SubmitButton disabled={isSaved} />
      </form>

      {state.message ? (
        <p
          className={cn(
            "text-sm font-semibold",
            isSaved ? "text-green" : "text-red"
          )}
        >
          {state.message}{" "}
          {isSaved ? (
            <Link href="/trips" className="underline underline-offset-4">
              View in My Trips
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
