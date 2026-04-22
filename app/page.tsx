import Link from "next/link";
import { redirect } from "next/navigation";

import { getParticipantIdFromCookie } from "@/lib/session";

const stats = [
  ["30", "days to build proof"],
  ["1", "check-in per day"],
  ["100", "percent accountability"],
];

const tiers = [
  {
    badge: "Tier 01",
    name: "Rookie",
    items: ["Start the streak", "Submit daily photo proof", "Track progress in your portal"],
    goal: "Goal: show up daily",
  },
  {
    badge: "Tier 02",
    name: "Elite",
    featured: true,
    items: ["Protect the streak", "Stack consistent check-ins", "Build public momentum"],
    goal: "Goal: no missed days",
  },
  {
    badge: "Community",
    name: "Run Club",
    items: ["Bring the crew", "Create shared accountability", "Turn check-ins into culture"],
    goal: "Goal: move together",
  },
];

export default async function HomePage() {
  const participantId = await getParticipantIdFromCookie();
  if (participantId) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--black)] text-[var(--white)]">
      <div className="rayo-noise pointer-events-none fixed inset-0 z-0 opacity-40" />
      <div className="pointer-events-none absolute right-[-70px] top-16 z-0 font-display text-[260px] leading-none text-[#111] sm:text-[420px]">
        R
      </div>

      <nav className="relative z-10 flex items-center justify-between border-b border-[#1f1f1f] px-5 py-5 sm:px-12">
        <Link
          href="/"
          className="font-display text-4xl tracking-[0.12em] text-[var(--yellow)]"
        >
          RAYO
        </Link>
        <div className="flex gap-2">
          <Link
            href="/join"
            className="rounded-md border border-[#333] px-4 py-2 text-xs text-[var(--white-2)] transition hover:border-[var(--yellow)] hover:text-[var(--yellow)]"
          >
            Login
          </Link>
          <Link
            href="/join"
            className="rounded-md border border-[var(--yellow)] bg-[var(--yellow)] px-4 py-2 text-xs font-medium text-black transition hover:bg-[var(--yellow-dim)]"
          >
            Apply Now
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-5 py-20 sm:px-12 lg:py-28">
        <p className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--yellow)] before:block before:h-px before:w-8 before:bg-[var(--yellow)]">
          Rayo Ambassador Challenge
        </p>
        <h1 className="max-w-5xl font-display text-[82px] leading-[0.86] tracking-[0.03em] text-[var(--white)] sm:text-[130px]">
          Join La <span className="text-[var(--yellow)]">Comunidad</span>
        </h1>
        <p className="mt-7 max-w-xl text-[17px] leading-8 text-[var(--muted-2)]">
          A daily proof-of-work portal for athletes, creators, and run clubs who
          want to build momentum with Rayo. Join once, check in every day, upload
          the proof, and keep the streak alive.
        </p>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/join"
            className="rounded-lg bg-[var(--yellow)] px-8 py-3.5 text-sm font-medium text-black transition hover:-translate-y-0.5 hover:bg-[var(--yellow-dim)]"
          >
            Join the Challenge
          </Link>
          <Link
            href="#tiers"
            className="rounded-lg border border-[#333] px-8 py-3.5 text-sm font-medium text-[var(--white)] transition hover:border-[#555] hover:bg-[var(--black-3)]"
          >
            See the Structure
          </Link>
        </div>
      </section>

      <section className="relative z-10 grid border-y border-[#1f1f1f] sm:grid-cols-3">
        {stats.map(([num, desc]) => (
          <div
            key={desc}
            className="border-b border-[#1f1f1f] px-5 py-7 sm:border-b-0 sm:border-r sm:px-12 last:sm:border-r-0"
          >
            <p className="font-display text-5xl leading-none text-[var(--yellow)]">
              {num}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              {desc}
            </p>
          </div>
        ))}
      </section>

      <section id="tiers" className="relative z-10 px-5 py-20 sm:px-12">
        <div className="mb-12">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
            How it works
          </p>
          <h2 className="font-display text-6xl tracking-[0.03em] text-[var(--white)]">
            Build the habit
          </h2>
        </div>

        <div className="grid gap-0.5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={
                tier.featured
                  ? "bg-[var(--yellow)] p-8 text-black"
                  : "bg-[var(--black-2)] p-8 text-[var(--white)] transition hover:bg-[var(--black-3)]"
              }
            >
              <p
                className={
                  tier.featured
                    ? "font-mono text-[11px] uppercase tracking-[0.2em] text-black/50"
                    : "font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]"
                }
              >
                {tier.badge}
              </p>
              <h3 className="mt-2 font-display text-5xl tracking-[0.03em]">
                {tier.name}
              </h3>
              <ul className="mt-5 space-y-2 text-sm">
                {tier.items.map((item) => (
                  <li
                    key={item}
                    className={tier.featured ? "text-black/70" : "text-[var(--muted-2)]"}
                  >
                    <span className={tier.featured ? "text-black" : "text-[var(--yellow)]"}>
                      ✓
                    </span>{" "}
                    {item}
                  </li>
                ))}
              </ul>
              <p
                className={
                  tier.featured
                    ? "mt-7 inline-block rounded bg-black/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-black/60"
                    : "mt-7 inline-block rounded bg-white/5 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]"
                }
              >
                {tier.goal}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 grid bg-[#111] lg:grid-cols-2">
        <div className="bg-[var(--black-2)] px-5 py-16 sm:px-12">
          <h2 className="font-display text-6xl">Athletes</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--muted-2)]">
            Enter your details, show up daily, and use photo proof to turn training
            into visible consistency.
          </p>
          <Link
            href="/join"
            className="mt-8 inline-flex rounded-md bg-[var(--yellow)] px-7 py-3 text-sm font-medium text-black hover:bg-[var(--yellow-dim)]"
          >
            Start as Athlete
          </Link>
        </div>
        <div className="bg-[var(--yellow)] px-5 py-16 text-black sm:px-12">
          <h2 className="font-display text-6xl">Run Clubs</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-black/60">
            Bring your group into the ritual. Same portal, same proof, bigger
            accountability.
          </p>
          <Link
            href="/join"
            className="mt-8 inline-flex rounded-md bg-black px-7 py-3 text-sm font-medium text-[var(--white)] hover:bg-[#222]"
          >
            Bring the Crew
          </Link>
        </div>
      </section>
    </main>
  );
}
