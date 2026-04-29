"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE_NAME, hasAdminAccess, setAdminAccessCookie } from "@/lib/session";

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

export async function deleteCheckIn(checkInId: string) {
  const isUnlocked = await hasAdminAccess();

  if (!isUnlocked) {
    throw new Error("Admin access required.");
  }

  const supabase = createClient();

  const { data: checkIn, error: fetchError } = await supabase
    .from("check_ins")
    .select("id, photo_url")
    .eq("id", checkInId)
    .maybeSingle<{ id: string; photo_url: string }>();

  if (fetchError || !checkIn) {
    throw new Error(fetchError?.message || "Could not find that content item.");
  }

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([checkIn.photo_url]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("check_ins")
    .delete()
    .eq("id", checkInId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
