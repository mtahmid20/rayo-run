import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getParticipantIdFromCookie } from "@/lib/session";

export default async function LoginPage() {
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
              Miles. Fuel. Content.
            </p>
            <h1 className="font-display text-6xl leading-none tracking-[0.03em] sm:text-7xl">
              Welcome back
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted-2)]">
              Returning athletes and clubs can get back in fast with just email and Instagram.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              "Use the same email and IG handle from your application",
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
              Login
            </p>
            <h2 className="mt-3 font-display text-5xl tracking-[0.03em]">
              Enter the portal
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--muted-2)]">
              Keep it light. Use the same email and Instagram handle you used when
              joining the program.
            </p>
          </div>
          <LoginForm />
          <div className="mt-6 flex flex-col gap-3 text-center text-xs text-[var(--muted)]">
            <Link href="/join" className="hover:text-[var(--white)]">
              New here? Apply to the program
            </Link>
            <Link href="/" className="hover:text-[var(--white)]">
              Back to La Comunidad
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
