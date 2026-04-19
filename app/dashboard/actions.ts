"use server";

import { revalidatePath } from "next/cache";

import { STORAGE_BUCKET } from "@/lib/constants";
import { getParticipantIdFromCookie } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type CheckInActionState = {
  error?: string;
  success?: string;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase();
}

export async function createCheckIn(
  _prevState: CheckInActionState,
  formData: FormData,
): Promise<CheckInActionState> {
  const supabase = await createClient();
  const participantId = await getParticipantIdFromCookie();

  if (!participantId) {
    return { error: "Participant details not found. Enter your details again." };
  }

  const localDate = String(formData.get("local_date") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const photo = formData.get("photo");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return { error: "We could not determine today’s local date. Refresh and try again." };
  }

  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "A proof photo is required for each daily check-in." };
  }

  const { data: existingCheckIn } = await supabase
    .from("check_ins")
    .select("id")
    .eq("user_id", participantId)
    .eq("check_in_date", localDate)
    .maybeSingle();

  if (existingCheckIn) {
    return { error: "Today’s check-in is already complete." };
  }

  const extension =
    photo.name.includes(".") ? photo.name.split(".").pop()?.toLowerCase() : "jpg";
  const safeFileName = sanitizeFileName(photo.name || `proof.${extension}`);
  const storagePath = `${participantId}/${localDate}/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, photo, {
      cacheControl: "3600",
      upsert: false,
      contentType: photo.type || undefined,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("check_ins").insert({
    user_id: participantId,
    check_in_date: localDate,
    caption: caption || null,
    photo_url: storagePath,
  });

  if (insertError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return { error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: "Check-in complete. Your streak is updated." };
}
