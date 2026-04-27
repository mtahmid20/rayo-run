import Link from "next/link";

import { AdminAccessForm } from "@/components/admin/admin-access-form";
import { SignOutButton } from "@/components/shared/sign-out-button";
import {
  AdminCheckInItem,
  ProfileRecord,
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
    section?: string;
    date?: string;
    type?: string;
  }>;
};

const adminSections = [
  { id: "overview", label: "Overview", description: "Big picture on La Comunidad" },
  { id: "accounts", label: "Accounts", description: "Athletes, clubs, and activity" },
  { id: "images", label: "Images", description: "Proof uploads and captions" },
];

type ParticipantTypeFilter = "all" | "athlete" | "club";
type ParticipantType = "athlete" | "club";

function inferParticipantType(profile: Pick<ProfileRecord, "participant_type" | "full_name"> | null | undefined): ParticipantType {
  if (profile?.participant_type === "athlete" || profile?.participant_type === "club") {
    return profile.participant_type;
  }

  const name = profile?.full_name.toLowerCase() ?? "";

  if (
    name.includes("club") ||
    name.includes("crew") ||
    name.includes("running club") ||
    name.includes("run club")
  ) {
    return "club";
  }

  return "athlete";
}

function getParticipantTypeClasses(type: ParticipantType) {
  return type === "club"
    ? "border border-black/10 bg-black/10 text-black sm:border-[#333] sm:bg-[var(--black-4)] sm:text-[var(--yellow)]"
    : "border border-[var(--yellow)]/25 bg-[var(--yellow)]/10 text-[var(--yellow)]";
}

function getStreaksByUser(checkIns: AdminCheckInItem[]) {
  const grouped = new Map<string, string[]>();

  for (const item of checkIns) {
    const dates = grouped.get(item.user_id) ?? [];
    dates.push(item.check_in_date);
    grouped.set(item.user_id, dates);
  }

  return grouped;
}

function getCheckInCountsByUser(checkIns: AdminCheckInItem[]) {
  const grouped = new Map<string, number>();

  for (const item of checkIns) {
    grouped.set(item.user_id, (grouped.get(item.user_id) ?? 0) + 1);
  }

  return grouped;
}

function getLatestDatesByUser(checkIns: AdminCheckInItem[]) {
  const grouped = new Map<string, string>();

  for (const item of checkIns) {
    if (!grouped.has(item.user_id)) {
      grouped.set(item.user_id, item.check_in_date);
    }
  }

  return grouped;
}

function getSectionLink(section: string, type?: string, date?: string) {
  const params = new URLSearchParams();
  params.set("section", section);

  if (type && type !== "all") {
    params.set("type", type);
  }

  if (date) {
    params.set("date", date);
  }

  return `/admin?${params.toString()}`;
}

function filterProfilesByType(profiles: ProfileRecord[], type: ParticipantTypeFilter) {
  if (type === "all") {
    return profiles;
  }

  return profiles.filter((profile) => inferParticipantType(profile) === type);
}

function filterCheckInsByType(checkIns: AdminCheckInItem[], type: ParticipantTypeFilter) {
  if (type === "all") {
    return checkIns;
  }

  return checkIns.filter((item) => inferParticipantType(item.user) === type);
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const filters = await searchParams;
  const activeSection = adminSections.some((section) => section.id === filters.section)
    ? filters.section!
    : "overview";
  const activeType: ParticipantTypeFilter =
    filters.type === "athlete" || filters.type === "club" ? filters.type : "all";
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
            La Comunidad Admin
          </p>
          <h1 className="mt-10 font-display text-5xl leading-none">
            Enter the backroom
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-2)]">
            Use the shared key to review ambassadors, reps, images, and streak
            movement across the program.
          </p>
          <div className="mt-7">
            <AdminAccessForm />
          </div>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const [allProfiles, rawCheckIns] = await Promise.all([
    getAdminUserLookup(supabase),
    getAdminCheckIns(supabase, {
      date: filters.date,
    }),
  ]);

  const athleteCount = allProfiles.filter((profile) => inferParticipantType(profile) === "athlete").length;
  const clubCount = allProfiles.filter((profile) => inferParticipantType(profile) === "club").length;
  const visibleProfiles = filterProfilesByType(allProfiles, activeType);
  const visibleProfileIds = new Set(visibleProfiles.map((profile) => profile.id));
  const typeFilteredCheckIns = filterCheckInsByType(rawCheckIns, activeType).filter((item) =>
    visibleProfileIds.has(item.user_id),
  );

  const checkIns = await enrichCheckInsWithSignedUrls(supabase, typeFilteredCheckIns);
  const streaks = getStreaksByUser(typeFilteredCheckIns);
  const checkInCounts = getCheckInCountsByUser(typeFilteredCheckIns);
  const latestDates = getLatestDatesByUser(typeFilteredCheckIns);

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-[#1f1f1f] bg-[var(--black-2)] p-6 lg:flex">
          <p className="font-display text-4xl tracking-[0.1em] text-[var(--yellow)]">
            RAYO
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            La Comunidad Admin
          </p>

          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {adminSections.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <Link
                  key={section.id}
                  href={getSectionLink(section.id, activeType, filters.date)}
                  className={
                    isActive
                      ? "rounded-md bg-[var(--yellow)] px-3 py-3 text-sm font-medium text-black"
                      : "rounded-md px-3 py-3 text-sm text-[var(--muted-2)] transition hover:bg-[var(--black-3)] hover:text-[var(--white)]"
                  }
                >
                  <p>{section.label}</p>
                  <p className={isActive ? "mt-1 text-[11px] text-black/60" : "mt-1 text-[11px] text-[var(--muted)]"}>
                    {section.description}
                  </p>
                </Link>
              );
            })}
          </nav>

          <SignOutButton mode="admin" />
        </aside>

        <section className="flex-1 p-5 sm:p-9">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
                Miles. Fuel. Rep.
              </p>
              <h1 className="font-display text-6xl leading-none">La Comunidad Admin</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Review athletes, clubs, proof uploads, and streak movement across
                the ambassador program in one place.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="rounded-md border border-[#333] px-4 py-2 text-xs text-[var(--muted-2)] hover:border-[#555] hover:text-[var(--white)]"
              >
                Member portal
              </Link>
              <div className="lg:hidden">
                <SignOutButton mode="admin" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
            {adminSections.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <Link
                  key={section.id}
                  href={getSectionLink(section.id, activeType, filters.date)}
                  className={
                    isActive
                      ? "rounded-md bg-[var(--yellow)] px-4 py-2 text-xs font-medium text-black"
                      : "rounded-md border border-[#333] px-4 py-2 text-xs text-[var(--muted-2)]"
                  }
                >
                  {section.label}
                </Link>
              );
            })}
          </div>

          <section className="mb-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Total athletes", athleteCount],
              ["Total clubs", clubCount],
              ["Total accounts", allProfiles.length],
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
                    index < 2 ? "text-[var(--yellow)]" : "text-[var(--white)]"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="mb-6 rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                Filters
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Filter the admin view by participant type or check-in date.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
              <input type="hidden" name="section" value={activeSection} />

              <label className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Filter by type
                </span>
                <select
                  name="type"
                  defaultValue={activeType}
                  className="min-h-11 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-3 text-sm text-[var(--white)] outline-none focus:border-[var(--yellow)]"
                >
                  <option value="all">All</option>
                  <option value="athlete">Athletes</option>
                  <option value="club">Clubs</option>
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
                  href={getSectionLink(activeSection)}
                  className="inline-flex min-h-11 items-center rounded-md border border-[#333] px-5 text-sm text-[var(--muted-2)] hover:text-[var(--white)]"
                >
                  Reset
                </Link>
              </div>
            </form>
          </section>

          {activeSection === "overview" ? (
            <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
                <div className="mb-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                    Top streaks
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Fast view of the most consistent athletes and clubs.
                  </p>
                </div>

                <div className="space-y-3">
                  {visibleProfiles.slice(0, 8).map((profile) => {
                    const userDates = streaks.get(profile.id) ?? [];
                    const participantType = inferParticipantType(profile);

                    return (
                      <article key={profile.id} className="rounded-md bg-[var(--black-3)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-[var(--white)]">{profile.full_name}</p>
                              <span
                                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${getParticipantTypeClasses(participantType)}`}
                              >
                                {participantType}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {profile.email} | @{profile.instagram_handle}
                            </p>
                          </div>
                          <p className="font-display text-4xl leading-none text-[var(--yellow)]">
                            {calculateCurrentStreak(userDates)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
                <div className="mb-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                    Recent reps
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Latest proof uploads across the currently visible records.
                  </p>
                </div>

                {checkIns.length ? (
                  <div className="space-y-3">
                    {checkIns.slice(0, 6).map((item) => {
                      const participantType = inferParticipantType(item.user);

                      return (
                        <article
                          key={item.id}
                          className="grid gap-4 rounded-md bg-[var(--black-3)] p-4 md:grid-cols-[130px_1fr]"
                        >
                          <div className="overflow-hidden rounded-md bg-[var(--black-4)]">
                            {item.signedPhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.signedPhotoUrl}
                                alt={`Proof from ${item.user?.full_name ?? item.user?.email ?? "participant"}`}
                                className="h-32 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-32 items-center justify-center text-xs text-[var(--muted)]">
                                No photo
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-[var(--white)]">
                                {item.user?.full_name || "Unnamed participant"}
                              </p>
                              <span
                                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${getParticipantTypeClasses(participantType)}`}
                              >
                                {participantType}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {item.user?.email || "No email"}
                              {item.user?.instagram_handle
                                ? ` | @${item.user.instagram_handle}`
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-[#333] p-8 text-center text-sm text-[var(--muted)]">
                    No reps match the current filters.
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {activeSection === "accounts" ? (
            <section className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
              <div className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                  Accounts
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Athlete and club roster with visible type tags, streaks, and latest activity.
                </p>
              </div>

              <div className="space-y-3">
                {visibleProfiles.map((profile) => {
                  const userDates = streaks.get(profile.id) ?? [];
                  const participantType = inferParticipantType(profile);

                  return (
                    <article
                      key={profile.id}
                      className="grid gap-4 rounded-md bg-[var(--black-3)] p-4 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.8fr]"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[var(--white)]">{profile.full_name}</p>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${getParticipantTypeClasses(participantType)}`}
                          >
                            {participantType}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {profile.email} | @{profile.instagram_handle}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                          Current streak
                        </p>
                        <p className="mt-1 text-lg text-[var(--yellow)]">
                          {calculateCurrentStreak(userDates)}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                          Total reps
                        </p>
                        <p className="mt-1 text-lg text-[var(--white)]">
                          {checkInCounts.get(profile.id) ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                          Last active
                        </p>
                        <p className="mt-1 text-sm text-[var(--white)]">
                          {latestDates.get(profile.id)
                            ? formatCheckInDate(latestDates.get(profile.id)!)
                            : "No reps yet"}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {activeSection === "images" ? (
            <section className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5">
              <div className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                  Images
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Proof uploads, captions, and clear athlete or club tags on every card.
                </p>
              </div>

              {checkIns.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {checkIns.map((item) => {
                    const participantType = inferParticipantType(item.user);

                    return (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-md bg-[var(--black-3)]"
                      >
                        <div className="aspect-[4/3] bg-[var(--black-4)]">
                          {item.signedPhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.signedPhotoUrl}
                              alt={`Proof from ${item.user?.full_name ?? item.user?.email ?? "participant"}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                              No photo
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-[var(--white)]">
                              {item.user?.full_name || "Unnamed participant"}
                            </p>
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${getParticipantTypeClasses(participantType)}`}
                            >
                              {participantType}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {formatCheckInDate(item.check_in_date)}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-[var(--muted-2)]">
                            {item.caption || "No caption provided."}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-[#333] p-8 text-center text-sm text-[var(--muted)]">
                  No reps match the current filters.
                </div>
              )}
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
