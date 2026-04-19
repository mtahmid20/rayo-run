"use client";

import { useActionState } from "react";

import { ParticipantActionState, saveParticipantIdentity } from "@/app/join/actions";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: ParticipantActionState = {};

export function SignupForm() {
  const [state, action] = useActionState(saveParticipantIdentity, initialState);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2 text-sm text-white/72">
        <span>Full name</span>
        <input
          type="text"
          name="full_name"
          placeholder="Alex Runner"
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-white outline-none transition focus:border-[#ff6f00]"
          required
        />
      </label>

      <label className="block space-y-2 text-sm text-white/72">
        <span>Email</span>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-white outline-none transition focus:border-[#ff6f00]"
          required
        />
      </label>

      <label className="block space-y-2 text-sm text-white/72">
        <span>Instagram handle</span>
        <input
          type="text"
          name="instagram_handle"
          placeholder="@rayoathlete"
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-white outline-none transition focus:border-[#ff6f00]"
          required
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {state.success}
        </p>
      ) : null}

      <SubmitButton
        label="Save details and continue"
        pendingLabel="Saving details..."
      />
    </form>
  );
}
