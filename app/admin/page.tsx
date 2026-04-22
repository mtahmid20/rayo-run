import Link from "next/link";

import { AdminAccessForm } from "@/components/admin/admin-access-form";
import { SignOutButton } from "@/components/shared/sign-out-button";
import {
  AdminCheckInItem,
  enrichCheckInsWithSignedUrls,
  getAdminCheckIns,
  getAdminUserLookup,
} from "@/lib/data";
import { formatCheckInDate } from "@/lib/format";
import { hasAdminAccess } from "@/lib/session";
import { calculateCurrentStreak } from "@/lib/streaks";
import { createClient } from "@/lib/supabase/server";

type AdminPageProps = {
  searchParams: Promise<{
    user?: string;
    date?: string;
  }>;
};

function getStreaksByUser(checkIns: AdminCheckInItem[]) {
  const grouped = new Map<string, string[]>();

  for (const item of checkIns) {
    const dates = grouped.get(item.user_id) ?? [];
    dates.push(item.check_in_date);
    grouped.set(item.user_id, dates);
  }

  return grouped;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const filters = await searchParams;
  const isUnlocked = await hasAdminAccess();

  if (!isUnlocked) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--black)] px-5 py-10">
        <div className="rayo-noise pointer-events-none fixed inset-0 opacity-40" />
        <section className="relative z-10 w-full max-w-md rounded-2xl border border-[#222] bg-[var(--black-2)] p-10">
          <p className="font-display text-4xl tracking-[0.12em] text-[var(--yellow)]">
            RAYO
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Admin portal
          </p>
          <h1 className="mt-10 font-display text-5xl leading-none">
            Enter admin
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-2)]">
            Use the shared key to review members, submissions, and streaks.
          </p>
          <div className="mt-7">
            <AdminAccessForm />
          </div>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const [userLookup, rawCheckIns] = await Promise.all([
    getAdminUserLookup(supabase),
    getAdminCheckIns(supabase, {
      userId: filters.user,
      date: filters.date,
    }),
  ]);

  const checkIns = await enrichCheckInsWithSignedUrls(supabase, rawCheckIns);
  const streaks = getStreaksByUser(rawCheckIns);

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 flex-col border-r border-[#1f1f1f] bg-[var(--black-2)] p-6 lg:flex">
          <p className="font-display text-4xl tracking-[0.1em] text-[var(--yellow)]">
            RAYO
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Admin
          </p>
          <div className="mt-10 flex flex-1 flex-col gap-1">
            {["Overview", "Applicants", "UGC Review"].map((item, index) => (
              <div
                key={item}
                className={
                  index === 0
                    ? "rounded-md bg-[var(--yellow)] px-3 py-2 text-sm font-medium text-black"
                    : "rounded-md px-3 py-2 text-sm text-[var(--muted-2)]"
                }
              >
                {item}
              </div>
            ))}
          </div>
          <SignOutButton mode="admin" />
        </aside>

        <section className="flex-1 p-5 sm:p-9">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-6xl leading-none">Challenge Ops</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Review participants, proof uploads, filters, and streaks.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="rounded-md border border-[#333] px-4 py-2 text-xs text-[var(--muted-2)] hover:border-[#555] hover:text-[var(--white)]"
              >
                User portal
              </Link>
              <div className="lg:hidden">
                <SignOutButton mode="admin" />
              </div>
            </div>
          </div>

          <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Total Members", userLookup.length],
              ["Total Check-ins", checkIns.length],
              ["Filtered Date", filters.date || "All"],
              ["Filtered User", filters.user ? "Active" : "All"],
            ].map(([label, value], index) => (
              <div
                key={label.toString()}
                className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  {label}
                </p>
                <p
                  className={`mt-2 font-display text-5xl leading-none ${
                    index === 0 ? "text-[var(--yellow)]" : "text-[var(--white)]"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="mb-6 rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
            <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
              <label className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Filter by user
                </span>
                <select
                  name="user"
                  defaultValue={filters.user ?? ""}
                  className="min-h-11 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-3 text-sm text-[var(--white)] outline-none focus:border-[var(--yellow)]"
                >
                  <option value="">All users</option>
                  {userLookup.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name || profile.email || profile.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Filter by date
                </span>
                <input
                  type="date"
                  name="date"
                  defaultValue={filters.date ?? ""}
                  className="min-h-11 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-3 text-sm text-[var(--white)] outline-none focus:border-[var(--yellow)]"
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="min-h-11 rounded-md bg-[var(--yellow)] px-5 text-sm font-medium text-black hover:bg-[var(--yellow-dim)]"
                >
                  Apply
                </button>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 items-center rounded-md border border-[#333] px-5 text-sm text-[var(--muted-2)] hover:text-[var(--white)]"
                >
                  Reset
                </Link>
              </div>
            </form>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                Member streaks
              </p>
              <div className="space-y-3">
                {userLookup.map((profile) => {
                  const userDates = streaks.get(profile.id) ?? [];
                  return (
                    <article key={profile.id} className="rounded-md bg-[var(--black-3)] p-4">
                      <p className="font-medium text-[var(--white)]">{profile.full_name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {profile.email} | @{profile.instagram_handle}
                      </p>
                      <p className="mt-3 text-sm text-[var(--muted-2)]">
                        Current streak:{" "}
                        <span className="font-medium text-[var(--yellow)]">
                          {calculateCurrentStreak(userDates)}
                        </span>
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                Proof uploads
              </p>
              {checkIns.length ? (
                <div className="space-y-3">
                  {checkIns.map((item) => (
                    <article
                      key={item.id}
                      className="grid gap-4 rounded-md bg-[var(--black-3)] p-4 md:grid-cols-[130px_1fr]"
                    >
                      <div className="overflow-hidden rounded-md bg-[var(--black-4)]">
                        {item.signedPhotoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.signedPhotoUrl}
                            alt={`Proof from ${item.user?.full_name ?? item.user?.email ?? "athlete"}`}
                            className="h-32 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-32 items-center justify-center text-xs text-[var(--muted)]">
                            No photo
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--white)]">
                          {item.user?.full_name || "Unnamed athlete"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {item.user?.email || "No email"}{" "}
                          {item.user?.instagram_handle
                            ? `| @${item.user.instagram_handle}`
                            : ""}
                        </p>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--yellow)]">
                          {formatCheckInDate(item.check_in_date)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted-2)]">
                          {item.caption || "No caption provided."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-[#333] p-8 text-center text-sm text-[var(--muted)]">
                  No records match the current filters.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
