"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  errorMessage: string | null;
  nextPath: string;
  siteUrl: string;
};

type SubmitStatus = "idle" | "sent" | "error";

export function LoginForm({ errorMessage, nextPath, siteUrl }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(errorMessage);
  const [status, setStatus] = useState<SubmitStatus>(
    errorMessage ? "error" : "idle"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const supabase = createClient();
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
      nextPath
    )}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    setIsSubmitting(false);

    if (error) {
      setStatus("error");
      setMessage("We could not send that link. Check the email and try again.");
      return;
    }

    setStatus("sent");
    setMessage("Check your email for a secure sign-in link.");
  }

  return (
    <div className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
      {status === "sent" ? (
        <div className="text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">
            Check your email
          </h2>
          <p className="mt-3 text-base leading-7 text-ink-soft">
            We sent a magic link to {email}. Open it on this device to finish
            signing in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Email</span>
            <input
              className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Sending..." : "Send me a link"}
          </Button>

          {message ? (
            <p className="text-sm font-semibold text-red">{message}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}
