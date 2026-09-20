import "server-only";

import webpush from "web-push";

import type { SupabaseClient } from "@supabase/supabase-js";

export function isVapidConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim(),
  );
}

function configuredWebPush(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!pub || !priv) return false;
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:honza@localhost";
  webpush.setVapidDetails(subject, pub, priv);
  return true;
}

export type PushSendResult = {
  attempted: number;
  sent: number;
  gone: number;
  failed: number;
};

export async function sendPushToUser(
  supabase: SupabaseClient,
  userId: string,
  payload: { title: string; body: string; url?: string },
): Promise<PushSendResult> {
  const empty: PushSendResult = { attempted: 0, sent: 0, gone: 0, failed: 0 };
  if (!configuredWebPush()) return empty;

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("[push] load subscriptions", userId, error.message);
    return empty;
  }

  const rows = data ?? [];
  const outcomes = await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint as string,
            keys: { p256dh: row.p256dh as string, auth: row.auth as string },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url ?? "/chat",
          }),
        );
        return "sent" as const;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", userId)
            .eq("endpoint", row.endpoint as string);
          return "gone" as const;
        }
        console.error("[push] send failed", userId, status, e);
        return "failed" as const;
      }
    }),
  );

  return {
    attempted: rows.length,
    sent: outcomes.filter((o) => o === "sent").length,
    gone: outcomes.filter((o) => o === "gone").length,
    failed: outcomes.filter((o) => o === "failed").length,
  };
}
