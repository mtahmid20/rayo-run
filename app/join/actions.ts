"use server";

import { redirect } from "next/navigation";

import { syncKlaviyoSignup } from "@/lib/klaviyo/server";
import { createClient } from "@/lib/supabase/server";
import { clearParticipantCookie, setParticipantCookie } from "@/lib/session";

export type ParticipantActionState = {
  error?: string;
  success?: string;
};

function sanitizeHandle(handle: string) {
  return handle.trim().replace(/^@+/, "");
}

export async function loginParticipant(
  _prevState: ParticipantActionState,
  formData: FormData,
): Promise<ParticipantActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const instagramHandle = sanitizeHandle(
    String(formData.get("instagram_handle") ?? ""),
  );

  if (!email || !instagramHandle) {
    return { error: "Please enter your email and Instagram handle." };
  }

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, instagram_handle")
    .eq("email", email)
    .maybeSingle<{ id: string; instagram_handle: string }>();

  if (error) {
    return { error: error.message };
  }

  if (!profile) {
    return { error: "We couldn't find a club with those details." };
  }

  if (sanitizeHandle(profile.instagram_handle) !== instagramHandle) {
    return { error: "That email and Instagram handle don't match our records." };
  }

  await setParticipantCookie(profile.id);
  redirect("/dashboard");
}

export async function saveParticipantIdentity(
  _prevState: ParticipantActionState,
  formData: FormData,
): Promise<ParticipantActionState> {
  const clubName = String(formData.get("club_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const averageAttendees = String(formData.get("average_attendees") ?? "").trim();
  const meetingDays = String(formData.get("meeting_days") ?? "").trim();
  const meetingLocation = String(formData.get("meeting_location") ?? "").trim();
  const instagramHandle = sanitizeHandle(
    String(formData.get("instagram_handle") ?? ""),
  );

  if (
    !clubName ||
    !email ||
    !averageAttendees ||
    !meetingDays ||
    !meetingLocation ||
    !instagramHandle
  ) {
    return { error: "Please complete every field before continuing." };
  }

  const averageAttendeesNumber = Number(averageAttendees);

  const supabase = await createClient();
  const { data: existingProfile, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle<{ id: string }>();

  if (lookupError) {
    return { error: lookupError.message };
  }

  const { data: profile, error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: existingProfile?.id,
        full_name: clubName,
        email,
        instagram_handle: instagramHandle,
      },
      {
        onConflict: "email",
      },
    )
    .select("id")
    .single<{ id: string }>();

  if (upsertError || !profile) {
    return { error: upsertError?.message ?? "Unable to save participant details." };
  }

  try {
    await syncKlaviyoSignup({
      email,
      fullName: clubName,
      instagramHandle,
      properties: {
        participant_id: profile.id,
        club_name: clubName,
        avg_number_of_attendees: Number.isFinite(averageAttendeesNumber)
          ? averageAttendeesNumber
          : averageAttendees,
        meeting_days: meetingDays,
        meeting_location: meetingLocation,
      },
    });
  } catch (error) {
    console.error("Klaviyo signup sync failed", error);
  }

  await setParticipantCookie(profile.id);
  redirect("/dashboard");
}

export async function clearParticipantIdentity() {
  await clearParticipantCookie();
  redirect("/login");
}
