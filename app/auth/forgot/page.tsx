import Link from "next/link";

import { ForgotPasswordForm } from "@/app/auth/forgot/ForgotPasswordForm";
import { safeRedirectPath } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ForgotPasswordPageProps = {
  searchParams: {
    next?: string;
  };
};

export default function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  const nextPath = safeRedirectPath(searchParams.next);

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="font-heading text-3xl font-semibold leading-none text-green"
        >
          PlanItAhead
        </Link>
        <Link
          href="/plan"
          className="text-sm font-semibold text-green transition hover:text-amber-deep"
        >
          Plan a trip
        </Link>
      </div>

      <section className="mx-auto mt-16 grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
            Password reset
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            Get back into your plans.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
            Enter your email and we will send a secure reset link through the
            same email system used for account confirmations.
          </p>
        </div>

        <ForgotPasswordForm nextPath={nextPath} />
      </section>
    </main>
  );
}
