import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildOpenerPrompt,
  generateReply,
} from "@/lib/server/conversation-engine";
import { buildLearnerContextText } from "@/lib/context";
import { resolveProviderKey } from "@/lib/server/provider-keys";
import { sendPushToUser } from "@/lib/server/push-send";
import { dueSlots, slotsForLocalDay } from "@/lib/server/schedule";
import type { ContextChunk, ContextSource } from "@/types";

type ProfileRow = {
  id: string;
  name: string | null;
  level: string | null;
  topics: string[] | null;
  preferred_model: string | null;
  formality: string | null;
  schedule_enabled: boolean | null;
  daily_message_count: number | null;
  schedule_mode: string | null;
  first_message_time: string | null;
  timezone: string | null;
};

function chunkFromRow(row: {
  id: string;
  source_kind: string;
  source_ref: string | null;
  content: string;
  synced_at: string;
}): ContextChunk {
  const addedAt = new Date(row.synced_at).getTime();
  let meta: ContextSource;
  if (row.source_kind === "google_doc") {
    meta = { kind: "google_doc", url: row.source_ref ?? "", addedAt };
  } else if (row.source_kind === "file") {
    meta = { kind: "file", name: row.source_ref ?? "file", addedAt };
  } else {
    meta = { kind: "pasted", label: row.source_ref ?? "Pasted text", addedAt };
  }
  return { id: row.id, text: row.content, meta };
}

export async function runCheckIns(
  supabase: SupabaseClient,
  now = new Date(),
): Promise<{ sent: number; skipped: number; errors: number }> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, name, level, topics, preferred_model, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone",
    )
    .eq("schedule_enabled", true);

  if (error || !profiles) return { sent: 0, skipped: 0, errors: 1 };

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const raw of profiles) {
    const profile = raw as ProfileRow;
    try {
      const did = await deliverForUser(supabase, profile, now);
      if (did) sent += 1;
      else skipped += 1;
    } catch (e) {
      errors += 1;
      console.error("[check-ins]", profile.id, e);
    }
  }

  return { sent, skipped, errors };
}

async function deliverForUser(
  supabase: SupabaseClient,
  profile: ProfileRow,
  now: Date,
): Promise<boolean> {
  const tz = profile.timezone?.trim() || "UTC";
  const count = profile.daily_message_count === 2 || profile.daily_message_count === 3
    ? profile.daily_message_count
    : 1;
  const mode = profile.schedule_mode === "random" ? "random" : "specific";
  const slots = slotsForLocalDay({
    userId: profile.id,
    timeZone: tz,
    now,
    count,
    mode,
    firstMessageTime: profile.first_message_time || "09:00",
  });
  const due = dueSlots(slots, now);
  if (due.length === 0) return false;

  for (const slot of due) {
    const { data: existing } = await supabase
      .from("scheduled_deliveries")
      .select("id")
      .eq("user_id", profile.id)
      .eq("slot_at", slot.toISOString())
      .maybeSingle();
    if (existing) continue;

    const { error: claimErr } = await supabase.from("scheduled_deliveries").insert({
      user_id: profile.id,
      slot_at: slot.toISOString(),
    });
    if (claimErr) continue;

    const llm = await resolveProviderKey("openrouter", {
      client: supabase,
      userId: profile.id,
    });
    if (!llm.key) continue;

    const [contextRes, lastRes, sessionRes] = await Promise.all([
      supabase
        .from("user_context")
        .select("id, source_kind, source_ref, content, synced_at")
        .eq("user_id", profile.id),
      supabase
        .from("messages")
        .select("created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", profile.id)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    let sessionId = (sessionRes.data?.id as string | undefined) ?? null;
    if (!sessionId) {
      const { data: created } = await supabase
        .from("chat_sessions")
        .insert({ user_id: profile.id, preview: "", message_count: 0 })
        .select("id")
        .single();
      sessionId = (created?.id as string | undefined) ?? null;
    }

    const chunks = (contextRes.data ?? []).map(chunkFromRow);
    const lastContactAt = lastRes.data?.created_at
      ? new Date(lastRes.data.created_at as string).getTime()
      : undefined;
    const localHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        hourCycle: "h23",
      }).format(now),
    );

    const opener = buildOpenerPrompt({
      localHour: Number.isFinite(localHour) ? localHour : undefined,
      lastContactAt,
      now: now.getTime(),
      mode: "chat",
    });

    const { text } = await generateReply({
      requestedModel: profile.preferred_model ?? undefined,
      topics: profile.topics ?? [],
      learnerContext: buildLearnerContextText(chunks),
      level: profile.level ?? undefined,
      learnerName: profile.name,
      formality: profile.formality ?? undefined,
      apiKey: llm.key,
      messages: [{ role: "user", content: opener }],
      mode: "chat",
    });

    await supabase.from("messages").insert({
      user_id: profile.id,
      role: "assistant",
      content: text,
      kind: "chat",
      session_id: sessionId,
    });

    const preview = text.length > 80 ? `${text.slice(0, 77)}…` : text;
    if (sessionId) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("session_id", sessionId);
      await supabase
        .from("chat_sessions")
        .update({ preview, message_count: count ?? 0 })
        .eq("id", sessionId);
    }

    const body = text.split("\n")[0]?.slice(0, 140) ?? "Honza napsal.";
    await sendPushToUser(supabase, profile.id, {
      title: "Honza",
      body,
      url: "/chat",
    });
    return true;
  }

  return false;
}
