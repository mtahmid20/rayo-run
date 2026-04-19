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
    return "No check-ins yet";
  }

  return formatCheckInDate(checkIns[0].check_in_date);
}

export default async function DashboardPage() {
  const participantId = await getParticipantIdFromCookie();

  if (!participantId) {
    redirect("/join");
  }

  const supabase = await createClient();

  const [profile, rawCheckIns] = await Promise.all([
    getProfileForUser(supabase, participantId),
    getUserCheckIns(supabase, participantId),
  ]);

  if (!profile) {
    redirect("/join");
  }

  const checkIns = await enrichCheckInsWithSignedUrls(supabase, rawCheckIns);
  const currentStreak = calculateCurrentStreak(checkIns.map((item) => item.check_in_date));
  const existingDates = checkIns.map((item) => item.check_in_date);
  const publicApiKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY ?? null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,111,0,0.16),_transparent_24%),linear-gradient(180deg,_#0f0f0f_0%,_#050505_100%)] px-5 py-6 sm:px-6 lg:px-8">
      <DashboardIdentify
        publicApiKey={publicApiKey}
        email={profile.email}
        fullName={profile.full_name}
        instagramHandle={profile.instagram_handle}
        currentStreak={currentStreak}
        totalCheckIns={checkIns.length}
        lastCheckInDate={checkIns[0]?.check_in_date ?? null}
      />

      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#f5b04c]">
              Athlete dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {profile.full_name}
            </h1>
            <p className="mt-2 text-sm text-white/65">
              @{profile.instagram_handle} | {profile.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-4 text-sm font-medium text-white/80 transition hover:bg-white/8"
            >
              Landing page
            </Link>
            <SignOutButton />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/45">
              Current streak
            </p>
            <p className="mt-4 text-4xl font-semibold text-white">{currentStreak}</p>
            <p className="mt-2 text-sm text-white/60">Consecutive days completed</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/45">
              Total check-ins
            </p>
            <p className="mt-4 text-4xl font-semibold text-white">{checkIns.length}</p>
            <p className="mt-2 text-sm text-white/60">Every proof upload stored</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/45">
              Last check-in
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {getLastCheckInLabel(checkIns)}
            </p>
            <p className="mt-2 text-sm text-white/60">Based on your recorded local date</p>
          </div>
          <div className="rounded-[1.75rem] border border-[#ff6f00]/25 bg-[#1a1207] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f5b04c]">
              Daily action
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">Upload today&apos;s proof</p>
            <p className="mt-2 text-sm text-white/68">
              One submission per user per local calendar day.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-5">
            <div className="mb-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5b04c]">
                Today&apos;s check-in
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Post proof and keep the streak alive
              </h2>
            </div>
            <CheckInForm existingDates={existingDates} />
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5b04c]">
                  Recent history
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your latest check-ins
                </h2>
              </div>
            </div>

            {checkIns.length ? (
              <div className="space-y-4">
                {checkIns.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-black/30 p-4 sm:grid-cols-[140px_1fr]"
                  >
                    <div className="overflow-hidden rounded-[1.2rem] border border-white/8 bg-white/5">
                      {item.signedPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.signedPhotoUrl}
                          alt={`Check-in from ${item.check_in_date}`}
                          className="h-32 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-32 items-center justify-center text-sm text-white/50">
                          Photo unavailable
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f5b04c]">
                        {formatCheckInDate(item.check_in_date)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/70">
                        {item.caption || "No caption added for this day."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/20 p-6 text-sm leading-6 text-white/62">
                No check-ins yet. Once the first proof photo is uploaded, your timeline
                and streak will show up here.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
