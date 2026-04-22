"use client";

import { useActionState, useEffect, useMemo, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";

import { CheckInActionState, createCheckIn } from "@/app/dashboard/actions";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: CheckInActionState = {};

type CheckInFormProps = {
  existingDates: string[];
};

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CheckInForm({ existingDates }: CheckInFormProps) {
  const router = useRouter();
  const [state, action] = useActionState(createCheckIn, initialState);
  const [isRefreshing, startRefresh] = useTransition();
  const today = useSyncExternalStore(
    () => () => undefined,
    getLocalDateString,
    () => "",
  );

  useEffect(() => {
    if (state.success) {
      startRefresh(() => {
        router.refresh();
      });
    }
  }, [router, state.success]);

  const alreadyCheckedInToday = useMemo(() => {
    if (!today) {
      return false;
    }

    return existingDates.includes(today);
  }, [existingDates, today]);

  if (alreadyCheckedInToday) {
    return (
      <div className="rounded-lg border border-[var(--green)]/25 bg-[#0d2a1a] p-5">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-300">
          Complete
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">
          Today&apos;s check-in is already locked in.
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/72">
          Come back tomorrow for the next photo proof. Your timeline below already
          includes today&apos;s submission.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="local_date" value={today} />

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Photo proof
        </span>
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="block min-h-12 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 py-3 text-sm text-[var(--white)] outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[var(--yellow)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-black focus:border-[var(--yellow)]"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Caption (optional)
        </span>
        <textarea
          name="caption"
          placeholder="Morning miles before work. Felt strong."
          rows={4}
          className="w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 py-3 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
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
        label={isRefreshing ? "Refreshing dashboard..." : "Submit today’s check-in"}
        pendingLabel="Uploading proof..."
      />
    </form>
  );
}
