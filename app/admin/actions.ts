"use server";

import { redirect } from "next/navigation";

import { ADMIN_COOKIE_NAME, setAdminAccessCookie } from "@/lib/session";

export type AdminAccessState = {
  error?: string;
};

export async function unlockAdminDashboard(
  _prevState: AdminAccessState,
  formData: FormData,
): Promise<AdminAccessState> {
  const submittedKey = String(formData.get("access_key") ?? "").trim();
  const configuredKey = process.env.ADMIN_ACCESS_KEY?.trim();

  if (!configuredKey) {
    return { error: "Set ADMIN_ACCESS_KEY in your environment before using admin mode." };
  }

  if (!submittedKey || submittedKey !== configuredKey) {
    return { error: "That admin key is incorrect." };
  }

  await setAdminAccessCookie(true);
  redirect("/admin");
}

export async function clearAdminAccess() {
  await setAdminAccessCookie(false);
  return ADMIN_COOKIE_NAME;
}
