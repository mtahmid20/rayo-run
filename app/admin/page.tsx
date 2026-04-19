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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,111,0,0.12),_transparent_24%),linear-gradient(180deg,_#111111_0%,_#050505_100%)] px-5 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#f5b04c]">
            Admin access
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Enter the shared admin key
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/68">
            This keeps the admin dashboard lightly protected without requiring
            full user authentication.
          </p>
          <div className="mt-6">
            <AdminAccessForm />
          </div>
        </div>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,111,0,0.12),_transparent_24%),linear-gradient(180deg,_#111111_0%,_#050505_100%)] px-5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#f5b04c]">
              Admin dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Challenge operations
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Review users, photo proof, filters, and streaks in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-white/80 transition hover:bg-white/8"
            >
              User dashboard
            </Link>
            <SignOutButton mode="admin" />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/45">
              Participants
            </p>
            <p className="mt-4 text-4xl font-semibold text-white">{userLookup.length}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/45">
              Check-ins
            </p>
            <p className="mt-4 text-4xl font-semibold text-white">{checkIns.length}</p>
          </div>
          <div className="rounded-[1.75rem] border border-[#ff6f00]/25 bg-[#1a1207] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f5b04c]">
              Active filters
            </p>
            <p className="mt-4 text-base text-white">
              {filters.user || filters.date
                ? `User: ${filters.user || "any"} | Date: ${filters.date || "any"}`
                : "Showing all users and all dates"}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-5">
          <div className="mb-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5b04c]">
              Filters
            </p>
          </div>
          <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <label className="space-y-2 text-sm text-white/72">
              <span>Filter by user</span>
              <select
                name="user"
                defaultValue={filters.user ?? ""}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-white outline-none ring-0 transition focus:border-[#ff6f00]"
              >
                <option value="">All users</option>
                {userLookup.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email || profile.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-white/72">
              <span>Filter by date</span>
              <input
                type="date"
                name="date"
                defaultValue={filters.date ?? ""}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-white outline-none ring-0 transition focus:border-[#ff6f00]"
              />
            </label>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6f00] px-5 text-sm font-semibold text-black transition hover:bg-[#ff8d33]"
              >
                Apply
              </button>
              <Link
                href="/admin"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-5 text-sm text-white/78 transition hover:bg-white/8"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-5">
            <div className="mb-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5b04c]">
                User streaks
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Snapshot by participant
              </h2>
            </div>

            <div className="space-y-3">
              {userLookup.map((profile) => {
                const userDates = streaks.get(profile.id) ?? [];
                return (
                  <div
                    key={profile.id}
                    className="rounded-[1.4rem] border border-white/8 bg-black/25 p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {profile.full_name || "Unnamed athlete"}
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      {profile.email || "No email"}{" "}
                      {profile.instagram_handle
                        ? `| @${profile.instagram_handle}`
                        : ""}
                    </p>
                    <p className="mt-3 text-sm text-white/75">
                      Current streak:{" "}
                      <span className="font-semibold text-white">
                        {calculateCurrentStreak(userDates)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      Total check-ins: {userDates.length}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-5">
            <div className="mb-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5b04c]">
                Check-ins
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Proof uploads and metadata
              </h2>
            </div>

            {checkIns.length ? (
              <div className="space-y-4">
                {checkIns.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-black/30 p-4 md:grid-cols-[150px_1fr]"
                  >
                    <div className="overflow-hidden rounded-[1.2rem] border border-white/8 bg-white/5">
                      {item.signedPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.signedPhotoUrl}
                          alt={`Proof from ${item.user?.full_name ?? item.user?.email ?? "athlete"}`}
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center text-sm text-white/50">
                          Photo unavailable
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.user?.full_name || "Unnamed athlete"}
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        {item.user?.email || "No email"}{" "}
                        {item.user?.instagram_handle
                          ? `| @${item.user.instagram_handle}`
                          : ""}
                      </p>
                      <p className="mt-3 font-mono text-xs uppercase tracking-[0.28em] text-[#f5b04c]">
                        {formatCheckInDate(item.check_in_date)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/72">
                        {item.caption || "No caption provided."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/20 p-6 text-sm leading-6 text-white/62">
                No records match the current filters.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
