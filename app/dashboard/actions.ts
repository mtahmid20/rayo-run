"use server";

import { revalidatePath } from "next/cache";

import { STORAGE_BUCKET } from "@/lib/constants";
import { getProfileForUser, getUserCheckIns } from "@/lib/data";
import { syncKlaviyoCheckIn } from "@/lib/klaviyo/server";
import { getParticipantIdFromCookie } from "@/lib/session";
import { calculateCurrentStreak } from "@/lib/streaks";
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
  const contentFile = formData.get("content_file");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return { error: "We could not determine today’s local date. Refresh and try again." };
  }

  if (!(contentFile instanceof File) || contentFile.size === 0) {
    return { error: "A photo or video file is required for each content submission." };
  }

  const { data: existingCheckIn } = await supabase
    .from("check_ins")
    .select("id")
    .eq("user_id", participantId)
    .eq("check_in_date", localDate)
    .maybeSingle();

  if (existingCheckIn) {
    return { error: "Today’s submission is already saved." };
  }

  const extension =
    contentFile.name.includes(".")
      ? contentFile.name.split(".").pop()?.toLowerCase()
      : "jpg";
  const safeFileName = sanitizeFileName(contentFile.name || `upload.${extension}`);
  const storagePath = `${participantId}/${localDate}/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, contentFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: contentFile.type || undefined,
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

  try {
    const [profile, updatedCheckIns] = await Promise.all([
      getProfileForUser(supabase, participantId),
      getUserCheckIns(supabase, participantId),
    ]);

    if (profile) {
      const streak = calculateCurrentStreak(
        updatedCheckIns.map((item) => item.check_in_date),
      );

      await syncKlaviyoCheckIn({
        email: profile.email,
        fullName: profile.full_name,
        instagramHandle: profile.instagram_handle,
        properties: {
          participant_id: participantId,
          current_streak: streak,
          total_check_ins: updatedCheckIns.length,
          last_check_in_date: localDate,
          latest_check_in_caption: caption || null,
        },
      });
    }
  } catch (error) {
    console.error("Klaviyo check-in sync failed", error);
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: "Content saved successfully." };
}
