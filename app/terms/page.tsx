import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--black)] px-5 py-10 text-[var(--white)]">
      <div className="rayo-noise pointer-events-none fixed inset-0 opacity-40" />

      <section className="relative z-10 mx-auto max-w-4xl border border-[#222] bg-[var(--black-2)] p-8 sm:p-12">
        <Link
          href="/"
          className="font-display text-4xl tracking-[0.12em] text-[var(--yellow)]"
        >
          RAYO
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          La Comunidad
        </p>

        <div className="mt-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
            Terms and Conditions
          </p>
          <h1 className="mt-3 font-display text-6xl leading-none tracking-[0.03em] sm:text-7xl">
            Program terms
          </h1>
        </div>

        <div className="mt-8 space-y-5 text-sm leading-8 text-[var(--muted-2)]">
          <p>
            You are granting Rayo Energy the rights to use your name, image,
            and likeness to promote Rayo Energy.
          </p>
          <p>
            You are responsible for obtaining all rights for any photos or
            content used by you or provided by you to Rayo Energy as part of
            your participation in the La Comunidad Ambassador Program.
          </p>
          <p>
            You will comply with all applicable laws, rules, regulations, and
            policies.
          </p>
          <p>
            You agree to utilize Rayo Energy&apos;s Ambassador Portal to upload
            content for participating in brand related activities.
          </p>
          <p>
            By agreeing to the above, you indicate these terms have been
            reviewed and accepted.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/join"
            className="rounded-md bg-[var(--yellow)] px-6 py-3 text-sm font-medium text-black hover:bg-[var(--yellow-dim)]"
          >
            Back to registration
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[#333] px-6 py-3 text-sm text-[var(--muted-2)] hover:border-[#555] hover:text-[var(--white)]"
          >
            Back to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
