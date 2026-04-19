import { cookies } from "next/headers";

export const PARTICIPANT_COOKIE_NAME = "rayo_participant_id";
export const ADMIN_COOKIE_NAME = "rayo_admin_access";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getParticipantIdFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(PARTICIPANT_COOKIE_NAME)?.value ?? null;
}

export async function setParticipantCookie(participantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(PARTICIPANT_COOKIE_NAME, participantId, cookieOptions);
}

export async function clearParticipantCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(PARTICIPANT_COOKIE_NAME);
}

export async function hasAdminAccess() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === "granted";
}

export async function setAdminAccessCookie(isGranted: boolean) {
  const cookieStore = await cookies();

  if (!isGranted) {
    cookieStore.delete(ADMIN_COOKIE_NAME);
    return;
  }

  cookieStore.set(ADMIN_COOKIE_NAME, "granted", cookieOptions);
}
