"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import {
  requestPasswordResetAction,
  type ForgotPasswordState
} from "@/app/auth/forgot/actions";
import { Button } from "@/components/ui/button";

type ForgotPasswordFormProps = {
  nextPath: string;
};

const initialState: ForgotPasswordState = {
  message: null,
  status: "idle",
  submittedEmail: null
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Sending..." : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm({ nextPath }: ForgotPasswordFormProps) {
  const [state, formAction] = useFormState(
    requestPasswordResetAction,
    initialState
  );

  if (state.status === "sent") {
    return (
      <div className="rounded-[18px] border border-border bg-white/70 p-5 text-center shadow-soft backdrop-blur-sm sm:p-6">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">
          Check your email
        </h2>
        <p className="mt-3 text-base leading-7 text-ink-soft">
          We sent a reset link
          {state.submittedEmail ? (
            <>
              {" "}
              to{" "}
              <span className="font-semibold text-ink">
                {state.submittedEmail}
              </span>
            </>
          ) : null}
          . Open it to choose a new password.
        </p>
        <Button className="mt-5" href="/login" variant="secondary">
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6"
    >
      <input name="nextPath" type="hidden" value={nextPath} />
      <label className="block">
        <span className="text-sm font-semibold text-ink">Email</span>
        <input
          autoComplete="email"
          className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
          inputMode="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </label>

      <div className="mt-5">
        <SubmitButton />
      </div>

      {state.message ? (
        <p className="mt-4 text-sm font-semibold text-red">{state.message}</p>
      ) : null}

      <Link
        href={`/login?next=${encodeURIComponent(nextPath)}`}
        className="mt-5 inline-block text-sm font-semibold text-green transition hover:text-amber-deep"
      >
        Back to sign in
      </Link>
    </form>
  );
}
