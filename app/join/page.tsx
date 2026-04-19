import Link from "next/link";
import { redirect } from "next/navigation";

import { ParticipantForm } from "@/components/auth/participant-form";
import { getParticipantIdFromCookie } from "@/lib/session";

export default async function JoinPage() {
  const participantId = await getParticipantIdFromCookie();
  if (participantId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,111,0,0.22),_transparent_28%),linear-gradient(180deg,_#111111_0%,_#060606_100%)] px-5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.35em] text-[#f5b04c]"
          >
            Rayo Challenge
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8"
          >
            Back
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-[#f5b04c]">
              Join the movement
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              Create your challenge account once, then check in daily.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              This MVP skips formal auth. Participants identify themselves with
              the same three fields every time: full name, email, and Instagram
              handle. Once entered, we remember them on this device.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
                <p className="text-sm font-semibold text-white">What happens next</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  We save or update the participant record, store a simple local
                  cookie, and send them straight to the dashboard.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/30 p-4">
                <p className="text-sm font-semibold text-white">Stored profile fields</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Full name, email, Instagram handle, daily check-ins, photo proof,
                  caption, and streak-ready dates.
                </p>
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-6">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5b04c]">
                Join or return
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Enter the same details and continue
              </h2>
            </div>
            <ParticipantForm />
          </section>
        </section>
      </div>
    </main>
  );
}
