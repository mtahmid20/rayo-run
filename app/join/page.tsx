import Link from "next/link";
import { redirect } from "next/navigation";

import { RegistrationSwitcher } from "@/components/auth/registration-switcher";
import { getParticipantIdFromCookie } from "@/lib/session";

export default async function JoinPage() {
  const participantId = await getParticipantIdFromCookie();
  if (participantId) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--black)] px-5 py-10 text-[var(--white)]">
      <div className="rayo-noise pointer-events-none fixed inset-0 opacity-40" />
      <div className="pointer-events-none absolute -right-10 top-12 font-display text-[260px] leading-none text-[#111] sm:text-[380px]">
        C
      </div>

      <section className="relative z-10 grid w-full max-w-6xl gap-0.5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border border-[#222] bg-[var(--black-2)] p-8 sm:p-12">
          <Link
            href="/"
            className="font-display text-4xl tracking-[0.12em] text-[var(--yellow)]"
          >
            RAYO
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            La Comunidad
          </p>

          <div className="mt-14">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
              Miles. Fuel. Rep.
            </p>
            <h1 className="font-display text-6xl leading-none tracking-[0.03em] sm:text-7xl">
              Join the crew
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted-2)]">
              Join Rayo&apos;s ambassador program. Earn commissions, get product,
              and help bring flavor back to the sport.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              "Use the same email and Instagram handle every time",
              "Drop in your monthly content!",
            ].map((item) => (
              <div
                key={item}
                className="border-l-2 border-[var(--yellow)] bg-[var(--black-3)] px-4 py-3 text-sm text-[var(--muted-2)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#222] bg-[var(--black-2)] p-8 sm:p-12">
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
              Application
            </p>
            <h2 className="mt-3 font-display text-5xl tracking-[0.03em]">
              Enter La Comunidad
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--muted-2)]">
              Choose the path that fits you. Athletes and clubs each get their
              own application, and we&apos;ll use your email plus Instagram handle
              when you come back to log in later.
            </p>
          </div>
          <RegistrationSwitcher />
          <Link
            href="/"
            className="mt-6 block text-center text-xs text-[var(--muted)] hover:text-[var(--white)]"
          >
            Back to La Comunidad
          </Link>
        </div>
      </section>
    </main>
  );
}
