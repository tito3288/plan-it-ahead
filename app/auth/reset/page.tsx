import Link from "next/link";

import { ResetPasswordForm } from "@/app/auth/reset/ResetPasswordForm";
import { safeRedirectPath } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ResetPasswordPageProps = {
  searchParams: {
    code?: string;
    next?: string;
  };
};

export default function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const nextPath = safeRedirectPath(searchParams.next ?? "/trips");

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
            New password
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            Choose a fresh password.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
            Use at least eight characters. After your password updates, your
            session continues with the same Supabase cookies as the rest of the
            app.
          </p>
        </div>

        <ResetPasswordForm code={searchParams.code ?? null} nextPath={nextPath} />
      </section>
    </main>
  );
}
