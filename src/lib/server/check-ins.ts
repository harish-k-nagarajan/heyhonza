import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildOpenerPrompt,
  generateReply,
} from "@/lib/server/conversation-engine";
import { prepareEngineTurn } from "@/lib/server/engine-turn";
import { resolveProviderKey } from "@/lib/server/provider-keys";
import { sendPushToUser } from "@/lib/server/push-send";
import { slotsDueForCheckIn } from "@/lib/server/schedule";
import {
  LAST_OPENER_LIMIT,
  asStringList,
  asTopicIds,
  rememberOpener,
} from "@/lib/topic-focus";
import type { ContextChunk, ContextSource } from "@/types";

type ProfileRow = {
  id: string;
  name: string | null;
  full_name?: string | null;
  level: string | null;
  topics: string[] | null;
  preferred_model: string | null;
  formality: string | null;
  schedule_enabled: boolean | null;
  daily_message_count: number | null;
  schedule_mode: string | null;
  first_message_time: string | null;
  timezone: string | null;
  focus_topic?: string | null;
  recent_topics?: string[] | null;
  last_openers?: string[] | null;
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
): Promise<{ sent: number; skipped: number; errors: number; pushed: number }> {
  const selects = [
    "id, name, full_name, level, topics, preferred_model, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone, focus_topic, recent_topics, last_openers",
    "id, name, level, topics, preferred_model, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone, focus_topic, recent_topics, last_openers",
    "id, name, level, topics, preferred_model, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone",
  ];
  let profiles: ProfileRow[] | null = null;
  for (const cols of selects) {
    const { data, error } = await supabase
      .from("profiles")
      .select(cols)
      .eq("schedule_enabled", true);
    if (!error && data) {
      profiles = data as unknown as ProfileRow[];
      break;
    }
  }

  if (!profiles) return { sent: 0, skipped: 0, errors: 1, pushed: 0 };

  let sent = 0;
  let skipped = 0;
  let errors = 0;
  let pushed = 0;

  for (const raw of profiles) {
    const profile = raw as ProfileRow;
    try {
      const result = await deliverForUser(supabase, profile, now);
      if (result.delivered) sent += 1;
      else skipped += 1;
      pushed += result.pushed;
    } catch (e) {
      errors += 1;
      console.error("[check-ins]", profile.id, e);
    }
  }

  return { sent, skipped, errors, pushed };
}

async function releaseClaim(
  supabase: SupabaseClient,
  userId: string,
  slotAt: string,
): Promise<void> {
  await supabase
    .from("scheduled_deliveries")
    .delete()
    .eq("user_id", userId)
    .eq("slot_at", slotAt);
}

async function deliverForUser(
  supabase: SupabaseClient,
  profile: ProfileRow,
  now: Date,
): Promise<{ delivered: boolean; pushed: number }> {
  const tz = profile.timezone?.trim() || "UTC";
  const count = profile.daily_message_count === 2 || profile.daily_message_count === 3
    ? profile.daily_message_count
    : 1;
  const mode = profile.schedule_mode === "random" ? "random" : "specific";
  const due = slotsDueForCheckIn({
    userId: profile.id,
    timeZone: tz,
    now,
    count,
    mode,
    firstMessageTime: profile.first_message_time || "09:00",
  }, now);
  if (due.length === 0) return { delivered: false, pushed: 0 };

  let delivered = false;
  let pushed = 0;

  for (const slot of due) {
    const slotAt = slot.toISOString();
    const { data: existing } = await supabase
      .from("scheduled_deliveries")
      .select("id")
      .eq("user_id", profile.id)
      .eq("slot_at", slotAt)
      .maybeSingle();
    if (existing) continue;

    const { error: claimErr } = await supabase.from("scheduled_deliveries").insert({
      user_id: profile.id,
      slot_at: slotAt,
    });
    if (claimErr) continue;

    const llm = await resolveProviderKey("openrouter", {
      client: supabase,
      userId: profile.id,
    });
    if (!llm.key) {
      await releaseClaim(supabase, profile.id, slotAt);
      continue;
    }

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

    const prepared = await prepareEngineTurn({
      bootstrap: true,
      topics: profile.topics ?? [],
      focusTopic: profile.focus_topic ?? null,
      recentTopics: asTopicIds(profile.recent_topics ?? []),
      lastOpeners: asStringList(profile.last_openers, LAST_OPENER_LIMIT),
      chunks,
      learnerContextFallback: "",
    });

    const opener = buildOpenerPrompt({
      localHour: Number.isFinite(localHour) ? localHour : undefined,
      lastContactAt,
      now: now.getTime(),
      mode: "chat",
      focusTopic: prepared.focus,
      lastOpeners: prepared.lastOpeners,
    });

    let text: string;
    try {
      ({ text } = await generateReply({
        requestedModel: profile.preferred_model ?? undefined,
        topics: profile.topics ?? [],
        learnerContext: prepared.contextText,
        level: profile.level ?? undefined,
        learnerName: profile.name?.trim() || profile.full_name?.trim().split(/\s+/)[0] || null,
        formality: profile.formality ?? undefined,
        apiKey: llm.key,
        messages: [{ role: "user", content: opener }],
        mode: "chat",
        focusTopic: prepared.focus,
        recentTopics: prepared.recent,
        lastOpeners: prepared.lastOpeners,
      }));
    } catch (e) {
      await releaseClaim(supabase, profile.id, slotAt);
      throw e;
    }

    const nextOpeners = rememberOpener(prepared.lastOpeners, text);
    const engineRow = {
      focus_topic: prepared.focus,
      recent_topics: prepared.recent,
      last_openers: nextOpeners,
    };
    const { error: engineErr } = await supabase
      .from("profiles")
      .update(engineRow)
      .eq("id", profile.id);
    if (engineErr) {
      console.warn("[check-ins] engine focus columns missing?", engineErr.message);
    }
    await Promise.all(
      prepared.chunkUpdates.map((u) =>
        supabase
          .from("user_context")
          .update({ content: u.text, synced_at: now.toISOString() })
          .eq("id", u.id)
          .eq("user_id", profile.id),
      ),
    );

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
    const push = await sendPushToUser(supabase, profile.id, {
      title: "Honza",
      body,
      url: "/chat",
    });
    pushed += push.sent;
    delivered = true;
  }

  return { delivered, pushed };
}
