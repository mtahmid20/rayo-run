import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckInForm } from "@/components/dashboard/check-in-form";
import { DashboardIdentify } from "@/components/klaviyo/dashboard-identify";
import { SignOutButton } from "@/components/shared/sign-out-button";
import {
  DashboardCheckInItem,
  enrichCheckInsWithSignedUrls,
  getProfileForUser,
  getUserCheckIns,
} from "@/lib/data";
import { formatCheckInDate } from "@/lib/format";
import { getParticipantIdFromCookie } from "@/lib/session";
import { calculateCurrentStreak } from "@/lib/streaks";
import { createClient } from "@/lib/supabase/server";

function getLastCheckInLabel(checkIns: DashboardCheckInItem[]) {
  if (!checkIns.length) {
    return "No reps yet";
  }

  return formatCheckInDate(checkIns[0].check_in_date);
}

export default async function DashboardPage() {
  const participantId = await getParticipantIdFromCookie();

  if (!participantId) {
    redirect("/login");
  }

  const supabase = await createClient();

  const [profile, rawCheckIns] = await Promise.all([
    getProfileForUser(supabase, participantId),
    getUserCheckIns(supabase, participantId),
  ]);

  if (!profile) {
    redirect("/login");
  }

  const checkIns = await enrichCheckInsWithSignedUrls(supabase, rawCheckIns);
  const currentStreak = calculateCurrentStreak(checkIns.map((item) => item.check_in_date));
  const existingDates = checkIns.map((item) => item.check_in_date);
  const publicApiKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY ?? null;
  const firstName = profile.full_name.split(" ")[0] || profile.full_name;

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <DashboardIdentify
        publicApiKey={publicApiKey}
        email={profile.email}
        fullName={profile.full_name}
        instagramHandle={profile.instagram_handle}
        currentStreak={currentStreak}
        totalCheckIns={checkIns.length}
        lastCheckInDate={checkIns[0]?.check_in_date ?? null}
      />

      <nav className="flex items-center justify-between border-b border-[#1f1f1f] bg-[var(--black-2)] px-5 py-4 sm:px-9">
        <Link
          href="/"
          className="font-display text-3xl tracking-[0.1em] text-[var(--yellow)]"
        >
          RAYO
        </Link>
        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-[var(--muted-2)] sm:block">
            @{profile.instagram_handle} <span className="text-[var(--white)]">| {profile.full_name}</span>
          </p>
          <SignOutButton />
        </div>
      </nav>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-9 sm:px-9">
        <div className="mb-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--yellow)]">
            La Comunidad Portal
          </p>
          <h1 className="font-display text-6xl leading-none tracking-[0.03em] sm:text-7xl">
            Welcome back, <span className="text-[var(--yellow)]">{firstName}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Miles. Fuel. Rep. Keep showing up and log this month&apos;s content!
          </p>
        </div>

        <div className="mb-7 inline-flex items-center gap-2 rounded-md bg-[var(--yellow)] px-4 py-2 text-sm font-medium text-black">
          <span className="font-display text-xl leading-none">La Comunidad</span>
          <span>| Ambassador check-in portal</span>
        </div>

        <section className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Current month submissions", currentStreak, "content pieces logged", true],
            ["Total reps", checkIns.length, "proof uploads", false],
            ["Last rep", getLastCheckInLabel(checkIns), "latest logged day", false],
          ].map(([label, value, sub, yellow]) => (
            <div
              key={label.toString()}
              className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-5"
            >
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {label}
              </p>
              <p
                className={`font-display text-5xl leading-none ${
                  yellow ? "text-[var(--yellow)]" : "text-[var(--white)]"
                }`}
              >
                {value}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">{sub}</p>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-medium">Road to the next tier</p>
          </div>
          <div className="h-2 overflow-hidden rounded bg-[var(--black-4)]">
            <div
              className="h-full rounded bg-[var(--yellow)] transition-all"
              style={{ width: `${Math.min(100, Math.round((currentStreak / 30) * 100))}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
            <span>{currentStreak} / 30</span>
            <span>30</span>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-6">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
              Proof
            </p>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Upload this month&apos;s content and leave a note if you want to give the
              rep some context.
            </p>
            <CheckInForm existingDates={existingDates} />
          </div>

          <div className="rounded-lg border border-[#1f1f1f] bg-[var(--black-2)] p-6">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
              Recent
            </p>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Your latest uploads and captions.
            </p>

            {checkIns.length ? (
              <div className="space-y-3">
                {checkIns.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-3 rounded-md bg-[var(--black-3)] p-3 sm:grid-cols-[110px_1fr]"
                  >
                    <div className="overflow-hidden rounded-md bg-[var(--black-4)]">
                      {item.signedPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.signedPhotoUrl}
                          alt={`Check-in from ${item.check_in_date}`}
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-xs text-[var(--muted)]">
                          No photo
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--yellow)]">
                        {formatCheckInDate(item.check_in_date)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted-2)]">
                        {item.caption || "No caption added for this rep yet."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-[#333] p-8 text-center text-sm text-[var(--muted)]">
                No reps yet. Upload today&apos;s proof to start your feed.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
