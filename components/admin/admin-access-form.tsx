"use client";

import { useActionState } from "react";

import { AdminAccessState, unlockAdminDashboard } from "@/app/admin/actions";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: AdminAccessState = {};

export function AdminAccessForm() {
  const [state, action] = useActionState(unlockAdminDashboard, initialState);

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2 text-sm text-white/72">
        <span>Admin access key</span>
        <input
          type="password"
          name="access_key"
          placeholder="Enter shared admin key"
          className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-white outline-none transition focus:border-[#ff6f00]"
          required
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label="Open admin dashboard" pendingLabel="Checking key..." />
    </form>
  );
}
