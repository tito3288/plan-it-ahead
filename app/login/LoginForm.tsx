"use client";

import { Mail } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";

import { sendMagicLinkAction, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

type LoginFormProps = {
  errorMessage: string | null;
  nextPath: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Sending..." : "Send me a link"}
    </Button>
  );
}

export function LoginForm({ errorMessage, nextPath }: LoginFormProps) {
  const initialState: LoginState = {
    message: errorMessage,
    redirectTo: null,
    status: errorMessage ? "error" : "idle",
    submittedEmail: null
  };
  const [state, formAction] = useFormState(sendMagicLinkAction, initialState);

  return (
    <div className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
      {state.status === "sent" ? (
        <div className="text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">
            Check your email
          </h2>
          <p className="mt-3 text-base leading-7 text-ink-soft">
            We sent a magic link to {state.submittedEmail}. Open it on this
            device to finish signing in.
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <input name="nextPath" type="hidden" value={nextPath} />
          <label className="block">
            <span className="text-sm font-semibold text-ink">Email</span>
            <input
              className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
              inputMode="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>

          <SubmitButton />

          {state.message ? (
            <p className="text-sm font-semibold text-red">{state.message}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}
