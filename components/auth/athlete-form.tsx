"use client";

import { useActionState } from "react";

import { ParticipantActionState, saveAthleteIdentity } from "@/app/join/actions";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: ParticipantActionState = {};

export function AthleteForm() {
  const [state, action] = useActionState(saveAthleteIdentity, initialState);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Name
        </span>
        <input
          type="text"
          name="athlete_name"
          placeholder="Your full name"
          className="min-h-12 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Email
        </span>
        <input
          type="email"
          name="email"
          placeholder="Your email"
          className="min-h-12 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Sport
        </span>
        <input
          type="text"
          name="sport"
          placeholder="Running, cycling, triathlon..."
          className="min-h-12 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          IG handle
        </span>
        <input
          type="text"
          name="instagram_handle"
          placeholder="@yourhandle"
          className="min-h-12 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Why do you want to be an ambassador?
        </span>
        <textarea
          name="why_ambassador"
          placeholder="Tell us why Rayo fits your community, content, and energy."
          rows={5}
          className="w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 py-3 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
          required
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label="Apply as Athlete" pendingLabel="Saving your application..." />
    </form>
  );
}
