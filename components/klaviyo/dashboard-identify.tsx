"use client";

import { useEffect } from "react";

type DashboardIdentifyProps = {
  publicApiKey: string | null;
  email: string;
  fullName: string;
  instagramHandle: string;
  currentStreak: number;
  totalCheckIns: number;
  lastCheckInDate: string | null;
};

export function DashboardIdentify({
  publicApiKey,
  email,
  fullName,
  instagramHandle,
  currentStreak,
  totalCheckIns,
  lastCheckInDate,
}: DashboardIdentifyProps) {
  useEffect(() => {
    if (!publicApiKey) {
      return;
    }

    const controller = new AbortController();

    void fetch(`https://a.klaviyo.com/client/profiles/?company_id=${publicApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        revision: "2026-04-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email,
            first_name: fullName,
            properties: {
              full_name: fullName,
              instagram_handle: instagramHandle,
              current_streak: currentStreak,
              total_check_ins: totalCheckIns,
              last_check_in_date: lastCheckInDate,
              signup_source: "rayo_challenge",
            },
          },
        },
      }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // Klaviyo client sync should never block the dashboard experience.
    });

    return () => {
      controller.abort();
    };
  }, [
    currentStreak,
    email,
    fullName,
    instagramHandle,
    lastCheckInDate,
    publicApiKey,
    totalCheckIns,
  ]);

  return null;
}
