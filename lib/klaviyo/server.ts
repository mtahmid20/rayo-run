const KLAVIYO_REVISION = "2026-04-15";

type KlaviyoProfilePayload = {
  email: string;
  fullName: string;
  instagramHandle: string;
  properties?: Record<string, string | number | boolean | null>;
};

function getKlaviyoPrivateKey() {
  return process.env.KLAVIYO_PRIVATE_API_KEY ?? null;
}

function getKlaviyoListId() {
  return process.env.KLAVIYO_LIST_ID ?? null;
}

async function klaviyoFetch(path: string, init: RequestInit) {
  const privateKey = getKlaviyoPrivateKey();

  if (!privateKey) {
    return null;
  }

  const response = await fetch(`https://a.klaviyo.com${path}`, {
    ...init,
    headers: {
      Authorization: `Klaviyo-API-Key ${privateKey}`,
      revision: KLAVIYO_REVISION,
      "Content-Type": "application/vnd.api+json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Klaviyo request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function upsertKlaviyoProfile({
  email,
  fullName,
  instagramHandle,
  properties = {},
}: KlaviyoProfilePayload) {
  const response = await klaviyoFetch("/api/profile-import", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email,
          first_name: fullName,
          properties: {
            full_name: fullName,
            instagram_handle: instagramHandle,
            ...properties,
          },
        },
      },
    }),
  });

  return response?.data?.id ?? null;
}

export async function addProfileToKlaviyoList(profileId: string | null) {
  const listId = getKlaviyoListId();

  if (!profileId || !listId) {
    return;
  }

  await klaviyoFetch(`/api/lists/${listId}/relationships/profiles`, {
    method: "POST",
    body: JSON.stringify({
      data: [
        {
          type: "profile",
          id: profileId,
        },
      ],
    }),
  });
}

export async function syncKlaviyoSignup(payload: KlaviyoProfilePayload) {
  const profileId = await upsertKlaviyoProfile({
    ...payload,
    properties: {
      signup_source: "rayo_challenge",
      signup_completed: true,
      ...(payload.properties ?? {}),
    },
  });

  await addProfileToKlaviyoList(profileId);
}

export async function syncKlaviyoCheckIn(payload: KlaviyoProfilePayload) {
  await upsertKlaviyoProfile(payload);
}
