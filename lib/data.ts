import type { SupabaseClient } from "@supabase/supabase-js";

import { STORAGE_BUCKET } from "@/lib/constants";

export type ProfileRecord = {
  id: string;
  full_name: string;
  email: string;
  instagram_handle: string;
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
  user?: Pick<ProfileRecord, "id" | "full_name" | "email" | "instagram_handle"> | null;
};

type AdminFilters = {
  userId?: string;
  date?: string;
};

export async function getProfileForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRecord | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, instagram_handle, created_at")
    .eq("id", userId)
    .maybeSingle<ProfileRecord>();

  return data ?? null;
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
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, instagram_handle, created_at")
    .order("created_at", { ascending: true })
    .returns<ProfileRecord[]>();

  return data ?? [];
}

export async function getAdminCheckIns(
  supabase: SupabaseClient,
  filters: AdminFilters,
): Promise<AdminCheckInItem[]> {
  let query = supabase
    .from("check_ins")
    .select(
      "id, user_id, check_in_date, caption, photo_url, created_at, profiles!check_ins_user_id_fkey ( id, full_name, email, instagram_handle )",
    )
    .order("check_in_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.date) {
    query = query.eq("check_in_date", filters.date);
  }

  const { data } = await query.returns<
    (DashboardCheckInItem & {
      profiles:
        | Pick<ProfileRecord, "id" | "full_name" | "email" | "instagram_handle">
        | Pick<ProfileRecord, "id" | "full_name" | "email" | "instagram_handle">[]
        | null;
    })[]
  >();

  return (data ?? []).map((item) => ({
    ...item,
    user: Array.isArray(item.profiles) ? item.profiles[0] ?? null : item.profiles,
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
