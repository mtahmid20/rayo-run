"use client";

import { useActionState } from "react";

import { AdminAccessState, unlockAdminDashboard } from "@/app/admin/actions";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: AdminAccessState = {};

export function AdminAccessForm() {
  const [state, action] = useActionState(unlockAdminDashboard, initialState);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Admin access key
        </span>
        <input
          type="password"
          name="access_key"
          placeholder="Enter La Comunidad admin key"
          className="min-h-12 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
          required
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label="Enter admin portal" pendingLabel="Checking key..." />
    </form>
  );
}
