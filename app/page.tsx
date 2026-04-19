import Link from "next/link";
import { redirect } from "next/navigation";

import { getParticipantIdFromCookie } from "@/lib/session";

const steps = [
  {
    eyebrow: "01",
    title: "Join once",
    body: "Create or refresh your participant record with your name, email, and Instagram handle.",
  },
  {
    eyebrow: "02",
    title: "Check in daily",
    body: "Come back each day, upload your proof photo, and add an optional caption.",
  },
  {
    eyebrow: "03",
    title: "Build the streak",
    body: "Your dashboard tracks current momentum, last check-in date, and the full challenge timeline.",
  },
];

const highlights = [
  "One check-in per local calendar day",
  "Simple participant dashboard",
  "Admin overview with filters",
  "Supabase Postgres and storage",
];

export default async function HomePage() {
  const participantId = await getParticipantIdFromCookie();
  if (participantId) {
    redirect("/dashboard");
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,111,0,0.22),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(255,214,10,0.12),_transparent_20%),linear-gradient(180deg,_#151515_0%,_#050505_55%,_#050505_100%)]" />
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#f5b04c]">
              Rayo Energy
            </p>
            <p className="mt-1 text-sm text-white/70">Daily fitness challenge</p>
          </div>
          <Link
            href="/join"
            className="rounded-full bg-[#ff6f00] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#ff8d33]"
          >
            Join Now
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-[#f5b04c]/30 bg-[#f5b04c]/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.3em] text-[#f5d08f]">
              Not just energy. Momentum.
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Show up daily. Prove the work. Protect the streak.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Rayo Challenge gives athletes a fast, mobile-first way to enter
                their details, check in every day, upload proof, and stay
                accountable with a clean streak dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6f00] px-6 text-base font-semibold text-black transition hover:bg-[#ff8d33]"
              >
                Join the Challenge
              </Link>
              <Link
                href="/join"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Daily check-in
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-sm text-white/78 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0d]/90 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/8 bg-[#111111] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5b04c]">
                    How it works
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    Simple enough to use every day
                  </p>
                </div>
                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.25em] text-emerald-300">
                  MVP Ready
                </div>
              </div>

              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-white/8 bg-black/30 p-4"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f5b04c]">
                      {step.eyebrow}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">{step.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/68">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
