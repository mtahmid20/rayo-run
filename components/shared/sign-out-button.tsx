"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { clearAdminAccess } from "@/app/admin/actions";
import { clearParticipantIdentity } from "@/app/join/actions";

type SignOutButtonProps = {
  mode?: "participant" | "admin";
};

export function SignOutButton({ mode = "participant" }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          if (mode === "admin") {
            await clearAdminAccess();
            router.push("/admin");
            router.refresh();
            return;
          }

          await clearParticipantIdentity();
        });
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isPending}
    >
      {isPending
        ? mode === "admin"
          ? "Leaving admin..."
          : "Clearing profile..."
        : mode === "admin"
          ? "Leave admin"
          : "Use different details"}
    </button>
  );
}
