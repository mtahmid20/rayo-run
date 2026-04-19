"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { clearParticipantCookie, setParticipantCookie } from "@/lib/session";

export type ParticipantActionState = {
  error?: string;
  success?: string;
};

function sanitizeHandle(handle: string) {
  return handle.trim().replace(/^@+/, "");
}

export async function saveParticipantIdentity(
  _prevState: ParticipantActionState,
  formData: FormData,
): Promise<ParticipantActionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const instagramHandle = sanitizeHandle(
    String(formData.get("instagram_handle") ?? ""),
  );

  if (!fullName || !email || !instagramHandle) {
    return { error: "Please complete every field before continuing." };
  }

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
        full_name: fullName,
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

  await setParticipantCookie(profile.id);
  redirect("/dashboard");
}

export async function clearParticipantIdentity() {
  await clearParticipantCookie();
  redirect("/join");
}
