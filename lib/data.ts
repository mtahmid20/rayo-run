import type { SupabaseClient } from "@supabase/supabase-js";

import { STORAGE_BUCKET } from "@/lib/constants";

export type ProfileRecord = {
  id: string;
  full_name: string;
  email: string;
  instagram_handle: string;
  participant_type?: "athlete" | "club" | null;
  created_at?: string;
};

export type DashboardCheckInItem = {
  id: string;
  user_id: string;
  check_in_date: string;
  caption: string | null;
  photo_url: string;
  created_at: string;
  signedPhotoUrl?: string | null;
};

export type AdminCheckInItem = DashboardCheckInItem & {
  user?: Pick<
    ProfileRecord,
    "id" | "full_name" | "email" | "instagram_handle" | "participant_type"
  > | null;
};

type AdminFilters = {
  date?: string;
};

function hasMissingParticipantTypeColumn(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("participant_type") && message.includes("column");
}

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRecord | null> {
  const primaryQuery = await supabase
    .from("profiles")
    .select("id, full_name, email, instagram_handle, participant_type, created_at")
    .eq("id", userId)
    .maybeSingle<ProfileRecord>();

  if (!primaryQuery.error) {
    return primaryQuery.data ?? null;
  }

  if (!hasMissingParticipantTypeColumn(primaryQuery.error)) {
    return null;
  }

  const fallbackQuery = await supabase
    .from("profiles")
    .select("id, full_name, email, instagram_handle, created_at")
    .eq("id", userId)
    .maybeSingle<Omit<ProfileRecord, "participant_type">>();

  if (!fallbackQuery.data) {
    return null;
  }

  return {
    ...fallbackQuery.data,
    participant_type: null,
  };
}

export async function getUserCheckIns(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardCheckInItem[]> {
  const { data } = await supabase
    .from("check_ins")
    .select("id, user_id, check_in_date, caption, photo_url, created_at")
    .eq("user_id", userId)
    .order("check_in_date", { ascending: false })
    .returns<DashboardCheckInItem[]>();

  return data ?? [];
}

export async function getAdminUserLookup(
  supabase: SupabaseClient,
): Promise<ProfileRecord[]> {
  const primaryQuery = await supabase
    .from("profiles")
    .select("id, full_name, email, instagram_handle, participant_type, created_at")
    .order("created_at", { ascending: true })
    .returns<ProfileRecord[]>();

  if (!primaryQuery.error) {
    return primaryQuery.data ?? [];
  }

  if (!hasMissingParticipantTypeColumn(primaryQuery.error)) {
    return [];
  }

  const fallbackQuery = await supabase
    .from("profiles")
    .select("id, full_name, email, instagram_handle, created_at")
    .order("created_at", { ascending: true })
    .returns<Omit<ProfileRecord, "participant_type">[]>();

  return (fallbackQuery.data ?? []).map((profile) => ({
    ...profile,
    participant_type: null,
  }));
}

export async function getAdminCheckIns(
  supabase: SupabaseClient,
  filters: AdminFilters,
): Promise<AdminCheckInItem[]> {
  let query = supabase
    .from("check_ins")
    .select(
      "id, user_id, check_in_date, caption, photo_url, created_at, profiles!check_ins_user_id_fkey ( id, full_name, email, instagram_handle, participant_type )",
    )
    .order("check_in_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.date) {
    query = query.eq("check_in_date", filters.date);
  }

  const primaryQuery = await query.returns<
    (DashboardCheckInItem & {
      profiles:
        | Pick<
            ProfileRecord,
            "id" | "full_name" | "email" | "instagram_handle" | "participant_type"
          >
        | Pick<
            ProfileRecord,
            "id" | "full_name" | "email" | "instagram_handle" | "participant_type"
          >[]
        | null;
    })[]
  >();

  if (!primaryQuery.error) {
    return (primaryQuery.data ?? []).map((item) => ({
      ...item,
      user: Array.isArray(item.profiles) ? item.profiles[0] ?? null : item.profiles,
    }));
  }

  if (!hasMissingParticipantTypeColumn(primaryQuery.error)) {
    return [];
  }

  let fallbackQuery = supabase
    .from("check_ins")
    .select(
      "id, user_id, check_in_date, caption, photo_url, created_at, profiles!check_ins_user_id_fkey ( id, full_name, email, instagram_handle )",
    )
    .order("check_in_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.date) {
    fallbackQuery = fallbackQuery.eq("check_in_date", filters.date);
  }

  const { data } = await fallbackQuery.returns<
    (DashboardCheckInItem & {
      profiles:
        | Pick<ProfileRecord, "id" | "full_name" | "email" | "instagram_handle">
        | Pick<ProfileRecord, "id" | "full_name" | "email" | "instagram_handle">[]
        | null;
    })[]
  >();

  return (data ?? []).map((item) => ({
    ...item,
    user: Array.isArray(item.profiles)
      ? item.profiles[0]
        ? { ...item.profiles[0], participant_type: null }
        : null
      : item.profiles
        ? { ...item.profiles, participant_type: null }
        : null,
  }));
}

export async function enrichCheckInsWithSignedUrls<
  T extends {
    photo_url: string;
  },
>(supabase: SupabaseClient, checkIns: T[]): Promise<(T & { signedPhotoUrl: string | null })[]> {
  return Promise.all(
    checkIns.map(async (item) => {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(item.photo_url, 60 * 60);

      return {
        ...item,
        signedPhotoUrl: data?.signedUrl ?? null,
      };
    }),
  );
}
