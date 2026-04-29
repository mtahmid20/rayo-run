"use client";

import { useTransition } from "react";

import { deleteCheckIn } from "@/app/admin/actions";

type DeleteContentButtonProps = {
  checkInId: string;
};

export function DeleteContentButton({ checkInId }: DeleteContentButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        const confirmed = window.confirm("Delete this file and remove it from the database?");

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          await deleteCheckIn(checkInId);
        });
      }}
      disabled={isPending}
      className="inline-flex rounded-md border border-red-500/20 px-3 py-2 text-xs text-red-200 transition hover:border-red-500/40 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
