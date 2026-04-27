import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[var(--black-2)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-[var(--muted-2)] sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <p>By using La Comunidad, you agree to the program terms.</p>
        <Link
          href="/terms"
          className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)] hover:text-[var(--white)]"
        >
          Terms and Conditions
        </Link>
      </div>
    </footer>
  );
}
