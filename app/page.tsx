import Link from "next/link";
import { redirect } from "next/navigation";

import { getParticipantIdFromCookie } from "@/lib/session";

const tiers = [
  {
    badge: "Athletes - Tier 1",
    name: "Tier 1",
    items: [
      "20% follower discount code",
      "10% commission on all code sales",
      "1-2 UGC posts/month required",
      "Buy a box to activate",
    ],
  },
  {
    badge: "Athletes - Tier 2",
    name: "Tier 2",
    featured: true,
    items: [
      "30% off all personal purchases",
      "20% commission on all code sales",
      "Keep 20% follower discount",
      "2x UGC posts/month required",
    ],
  },
  {
    badge: "Run Clubs",
    name: "Clubs",
    items: [
      "Free samples for club",
      "20% club discount code",
      "20% commission as store credit",
    ],
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
            href="/login"
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

      <section className="relative z-10 grid gap-14 px-5 py-20 sm:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-[var(--yellow)]">
            La Comunidad
          </p>
          <h1 className="max-w-5xl font-display text-[82px] leading-[0.86] tracking-[0.03em] text-[var(--white)] sm:text-[130px]">
            Miles.
            <br />
            <span>Fuel</span>
            <br />
            <span className="text-[var(--yellow)]">REP.</span>
          </h1>
          <p className="mt-7 max-w-xl text-[17px] leading-8 text-[var(--muted-2)]">
            Join Rayo&apos;s ambassador program. Earn commissions, get product,
            and help bring flavor back to the sport.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="rounded-lg bg-[var(--yellow)] px-8 py-3.5 text-sm font-medium text-black transition hover:-translate-y-0.5 hover:bg-[var(--yellow-dim)]"
            >
              Join the Program
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-6 sm:p-8">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
            What is La Comunidad?
          </p>
          <div className="space-y-4 text-sm leading-7 text-[var(--muted-2)]">
            <p>La Comunidad is exactly that, a community.</p>
            <p>
              Where runners, cyclists, everyday athletes chasing something
              bigger and enjoying the miles while we&apos;re at it.
            </p>
            <p>
              We care about how we fuel, how it tastes, how we move, and how we
              show up for ourselves and our people. We all fell in love with
              these sports for one reason or another and sometimes that gets
              lost.
            </p>
            <p>
              Although they&apos;re all different sports, we want to share more of
              the feeling of joy when you&apos;re out there.
            </p>
            <p className="text-[var(--white)]">
              We run together. We ride together. We fuel together.
            </p>
            <p>
              Join our growing community of athletes making it happen every day.
            </p>
            <p className="text-[var(--white)]">
              Siempre juntos.
              <br />
              Fuel the joy.
            </p>
          </div>
        </div>
      </section>

      <section id="tiers" className="relative z-10 px-5 py-20 sm:px-12">
        <div className="mb-12">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
            How it works
          </p>
          <h2 className="font-display text-6xl tracking-[0.03em] text-[var(--white)]">
            Fuel the joy
          </h2>
        </div>

        <div className="grid gap-0.5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={
                tier.featured
                  ? "bg-[var(--yellow)] p-8 text-black"
                  : "group bg-[var(--black-2)] p-8 text-[var(--white)] transition hover:bg-[var(--yellow)] hover:text-black"
              }
            >
              <p
                className={
                  tier.featured
                    ? "font-mono text-[11px] uppercase tracking-[0.2em] text-black/50"
                    : "font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] transition group-hover:text-black/50"
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
                    className={
                      tier.featured
                        ? "text-black/70"
                        : "text-[var(--muted-2)] transition group-hover:text-black/70"
                    }
                  >
                    <span
                      className={
                        tier.featured
                          ? "text-black"
                          : "text-[var(--yellow)] transition group-hover:text-black"
                      }
                    >
                      ✓
                    </span>{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 grid bg-[#111] lg:grid-cols-2">
        <div className="bg-[var(--black-2)] px-5 py-16 sm:px-12">
          <h2 className="font-display text-6xl">Athletes</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted-2)]">
            For runners, cyclists, everyday endurance athletes chasing something
            bigger and enjoying the miles while we&apos;re at it. We care about how
            we fuel, how it tastes, how we move, and how we show up for
            ourselves and our people. Earn commissions, get product, and level
            up as you grow.
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
          <p className="mt-4 max-w-xl text-sm leading-7 text-black/70">
            Build for crews that show up together. Get sample gels for your
            whole club, a custom discount code, and rep Rayo at every
            activation.
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
