import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { buildLearnerContextText } from "@/lib/context";
import type {
  DailyMessageCount,
  FormalityMode,
  ScheduleMode,
} from "@/lib/constants";
import {
  LAST_OPENER_LIMIT,
  asStringList,
  asTopicIds,
} from "@/lib/topic-focus";
import type { ContextChunk, ContextSource } from "@/types";

/**
 * The per-user data access layer. Every function is a no-op / null when
 * Supabase isn't configured or nobody is signed in (local pass-through dev),
 * so callers get one honest signal — `persisted` — for whether the DB path is
 * live. When it is, RLS guarantees a user only ever touches their own rows.
 */

export type PersistedMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  kind: "chat" | "call";
  sessionId?: string;
  createdAt: number;
};

export type PersistedSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
  preview: string;
  messageCount: number;
};

export type PersistedProfile = {
  name: string | null;
  /** Absent when the `full_name` column is not on this database yet. */
  fullName?: string | null;
  level: string;
  topics: string[];
  preferredModel: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  formality: FormalityMode;
  scheduleEnabled: boolean;
  dailyMessageCount: DailyMessageCount;
  scheduleMode: ScheduleMode;
  firstMessageTime: string;
  timezone: string | null;
  focusTopic: string | null;
  recentTopics: string[];
  lastOpeners: string[];
};

export type UserState = {
  persisted: true;
  userId: string;
  profile: PersistedProfile;
  contextChunks: ContextChunk[];
  contextText: string;
  activeSessionId: string | null;
  endedSessions: PersistedSession[];
  messages: PersistedMessage[];
};

/** The current auth user's id, or null when unconfigured / signed out. */
export async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

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

function refForMeta(meta: ContextSource): string {
  if (meta.kind === "google_doc") return meta.url;
  if (meta.kind === "file") return meta.name;
  return meta.label;
}

function previewFromMessages(messages: PersistedMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const firstAssistant = messages.find((m) => m.role === "assistant");
  const text = (firstUser ?? firstAssistant)?.content ?? "";
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

/** One-time backfill: orphan chat rows become a single ended session. */
async function migrateOrphanMessages(
  userId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<void> {
  const { data: orphans } = await supabase
    .from("messages")
    .select("id, role, content, kind, created_at")
    .eq("user_id", userId)
    .is("session_id", null)
    .eq("kind", "chat")
    .order("created_at", { ascending: true });

  if (!orphans?.length) return;

  const startedAt = orphans[0]!.created_at as string;
  const endedAt = orphans[orphans.length - 1]!.created_at as string;
  const mapped: PersistedMessage[] = orphans.map((m) => ({
    id: m.id as string,
    role: m.role as "user" | "assistant",
    content: m.content as string,
    kind: "chat",
    createdAt: new Date(m.created_at as string).getTime(),
  }));

  const { data: session, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      started_at: startedAt,
      ended_at: endedAt,
      preview: previewFromMessages(mapped),
      message_count: mapped.length,
    })
    .select("id")
    .single();

  if (error || !session) return;

  await supabase
    .from("messages")
    .update({ session_id: session.id })
    .eq("user_id", userId)
    .is("session_id", null)
    .eq("kind", "chat");
}

/** Full hydration payload for the signed-in user, or null (use local fallback). */
export async function loadUserState(): Promise<UserState | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await migrateOrphanMessages(user.id, supabase);

  const profileColumnSets = [
    "full_name, name, level, topics, preferred_model, onboarding_completed, onboarding_step, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone, focus_topic, recent_topics, last_openers",
    "name, level, topics, preferred_model, onboarding_completed, onboarding_step, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone, focus_topic, recent_topics, last_openers",
    "name, level, topics, preferred_model, onboarding_completed, onboarding_step, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone",
    "name, level, topics, preferred_model, onboarding_completed, formality, schedule_enabled, daily_message_count, schedule_mode, first_message_time, timezone",
  ];

  let p: Record<string, unknown> | null = null;
  let fullNameKnown = false;
  for (const cols of profileColumnSets) {
    const profileRes = await supabase
      .from("profiles")
      .select(cols)
      .eq("id", user.id)
      .maybeSingle();
    if (!profileRes.error) {
      p = (profileRes.data as Record<string, unknown> | null) ?? null;
      fullNameKnown = cols.startsWith("full_name");
      break;
    }
  }

  const [contextRes, openRes, endedRes] = await Promise.all([
    supabase
      .from("user_context")
      .select("id, source_kind, source_ref, content, synced_at")
      .eq("user_id", user.id)
      .order("synced_at", { ascending: true }),
    supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", user.id)
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("chat_sessions")
      .select("id, started_at, ended_at, preview, message_count")
      .eq("user_id", user.id)
      .not("ended_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(40),
  ]);

  const daily = Number(p?.daily_message_count ?? 1);
  const profile: PersistedProfile = {
    name: (p?.name as string | null) ?? null,
    ...(fullNameKnown
      ? { fullName: (p?.full_name as string | null) ?? null }
      : {}),
    level: typeof p?.level === "string" ? p.level : "A2",
    topics: (p?.topics as string[] | null) ?? [],
    preferredModel: (p?.preferred_model as string | null) ?? null,
    onboardingCompleted: Boolean(p?.onboarding_completed),
    onboardingStep: clampOnboardingStep(Number(p?.onboarding_step ?? 1)),
    formality: p?.formality === "vy" ? "vy" : "ty",
    scheduleEnabled: p?.schedule_enabled !== false,
    dailyMessageCount: daily === 2 || daily === 3 ? daily : 1,
    scheduleMode: p?.schedule_mode === "random" ? "random" : "specific",
    firstMessageTime:
      typeof p?.first_message_time === "string" && p.first_message_time
        ? p.first_message_time
        : "09:00",
    timezone: (p?.timezone as string | null) ?? null,
    focusTopic: typeof p?.focus_topic === "string" ? p.focus_topic : null,
    recentTopics: asTopicIds((p?.recent_topics as string[] | null) ?? []),
    lastOpeners: asStringList(p?.last_openers, LAST_OPENER_LIMIT),
  };

  const contextChunks = (contextRes.data ?? []).map(chunkFromRow);
  const activeSessionId = (openRes.data?.id as string | undefined) ?? null;

  const endedSessions: PersistedSession[] = (endedRes.data ?? []).map((s) => ({
    id: s.id as string,
    startedAt: new Date(s.started_at as string).getTime(),
    endedAt: s.ended_at ? new Date(s.ended_at as string).getTime() : undefined,
    preview: (s.preview as string) ?? "",
    messageCount: (s.message_count as number) ?? 0,
  }));

  // The live thread is whatever the learner starts now. Old rows — especially
  // call turns saved with no session — must not come back as the current chat.
  const messages: PersistedMessage[] = [];

  return {
    persisted: true,
    userId: user.id,
    profile,
    contextChunks,
    contextText: buildLearnerContextText(contextChunks),
    activeSessionId,
    endedSessions,
    messages,
  };
}

/** Rebuild the same context blob the engine consumes, but from DB rows. */
export function buildContextText(chunks: ContextChunk[]): string {
  return buildLearnerContextText(chunks);
}

/** Load only what the engine needs to build context (context + topics + level). */
export async function loadEngineContext(): Promise<{
  contextText: string;
  contextChunks: ContextChunk[];
  topics: string[];
  level: string;
  preferredModel: string | null;
  name: string | null;
  formality: FormalityMode;
  focusTopic: string | null;
  recentTopics: string[];
  lastOpeners: string[];
} | null> {
  const state = await loadUserState();
  if (!state) return null;
  return {
    contextText: state.contextText,
    contextChunks: state.contextChunks,
    topics: state.profile.topics,
    level: state.profile.level,
    preferredModel: state.profile.preferredModel,
    name: nameHonzaUses(state.profile.name, state.profile.fullName),
    formality: state.profile.formality,
    focusTopic: state.profile.focusTopic,
    recentTopics: state.profile.recentTopics,
    lastOpeners: state.profile.lastOpeners,
  };
}

export async function loadMessages(): Promise<PersistedMessage[] | null> {
  const state = await loadUserState();
  return state ? state.messages : null;
}

/** Append turns for the signed-in user. No-op (returns false) when unconfigured. */
export async function insertMessages(
  turns: {
    role: "user" | "assistant";
    content: string;
    kind?: "chat" | "call";
    sessionId?: string;
  }[],
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || turns.length === 0) return false;
  const supabase = await createSupabaseServerClient();
  const rows = turns.map((t) => ({
    user_id: userId,
    role: t.role,
    content: t.content,
    kind: t.kind ?? "chat",
    session_id: t.sessionId ?? null,
  }));
  const { error } = await supabase.from("messages").insert(rows);
  return !error;
}

/** Start a new typed-chat session; returns the session id or null. */
export async function createChatSession(): Promise<string | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("chat_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("ended_at", null);
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, preview: "", message_count: 0 })
    .select("id")
    .single();
  if (error || !data) return null;
  return data.id as string;
}

/** Mark the active session ended and store preview metadata. */
export async function endChatSession(
  sessionId: string,
  preview: string,
  messageCount: number,
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      ended_at: new Date().toISOString(),
      preview,
      message_count: messageCount,
    })
    .eq("id", sessionId)
    .eq("user_id", userId);
  return !error;
}

/** List ended sessions for history (newest first). */
export async function listEndedSessions(): Promise<PersistedSession[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("chat_sessions")
    .select("id, started_at, ended_at, preview, message_count")
    .eq("user_id", userId)
    .not("ended_at", "is", null)
    .order("started_at", { ascending: false });
  return (data ?? []).map((s) => ({
    id: s.id as string,
    startedAt: new Date(s.started_at as string).getTime(),
    endedAt: s.ended_at ? new Date(s.ended_at as string).getTime() : undefined,
    preview: (s.preview as string) ?? "",
    messageCount: (s.message_count as number) ?? 0,
  }));
}

/** Load all turns for one session (chat history transcript view). */
export async function loadSessionMessages(
  sessionId: string,
): Promise<PersistedMessage[] | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createSupabaseServerClient();
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!session) return null;

  const { data } = await supabase
    .from("messages")
    .select("id, role, content, kind, session_id, created_at")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((m) => ({
    id: m.id as string,
    role: m.role as "user" | "assistant",
    content: m.content as string,
    kind: (m.kind as "chat" | "call") ?? "chat",
    sessionId: sessionId,
    createdAt: new Date(m.created_at as string).getTime(),
  }));
}

function clampOnboardingStep(n: number): number {
  return Math.min(6, Math.max(1, Math.round(n)));
}

/** Pet name if set, otherwise the first word of the full name. */
function nameHonzaUses(
  callName: string | null | undefined,
  fullName: string | null | undefined,
): string | null {
  const call = callName?.trim();
  if (call) return call;
  const first = fullName?.trim().split(/\s+/)[0];
  return first || null;
}

export type ProfilePatch = Partial<{
  name: string | null;
  fullName: string | null;
  level: string;
  topics: string[];
  preferredModel: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  formality: FormalityMode;
  scheduleEnabled: boolean;
  dailyMessageCount: DailyMessageCount;
  scheduleMode: ScheduleMode;
  firstMessageTime: string;
  timezone: string | null;
  focusTopic: string | null;
  recentTopics: string[];
  lastOpeners: string[];
}>;

export async function updateProfile(patch: ProfilePatch): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const supabase = await createSupabaseServerClient();
  const row: Record<string, unknown> = {};
  if ("name" in patch) row.name = patch.name;
  if ("fullName" in patch) row.full_name = patch.fullName;
  if ("level" in patch) row.level = patch.level;
  if ("topics" in patch) row.topics = patch.topics;
  if ("preferredModel" in patch) row.preferred_model = patch.preferredModel;
  if ("onboardingCompleted" in patch)
    row.onboarding_completed = patch.onboardingCompleted;
  if ("onboardingStep" in patch && patch.onboardingStep !== undefined)
    row.onboarding_step = clampOnboardingStep(patch.onboardingStep);
  if ("formality" in patch) row.formality = patch.formality;
  if ("scheduleEnabled" in patch) row.schedule_enabled = patch.scheduleEnabled;
  if ("dailyMessageCount" in patch)
    row.daily_message_count = patch.dailyMessageCount;
  if ("scheduleMode" in patch) row.schedule_mode = patch.scheduleMode;
  if ("firstMessageTime" in patch) row.first_message_time = patch.firstMessageTime;
  if ("timezone" in patch) row.timezone = patch.timezone;
  if ("focusTopic" in patch) row.focus_topic = patch.focusTopic;
  if ("recentTopics" in patch) row.recent_topics = asTopicIds(patch.recentTopics ?? []);
  if ("lastOpeners" in patch)
    row.last_openers = asStringList(patch.lastOpeners, LAST_OPENER_LIMIT);
  if (Object.keys(row).length === 0) return true;

  const optional = [
    "full_name",
    "focus_topic",
    "recent_topics",
    "last_openers",
    "onboarding_step",
  ];
  let payload = { ...row };
  const droppable = optional.filter((key) => key in payload);
  for (let i = 0; i <= droppable.length; i += 1) {
    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
    if (!error) return true;
    const drop = droppable[i];
    if (!drop) return false;
    delete payload[drop];
    if (Object.keys(payload).length === 0) return false;
  }
  return false;
}

/** Update an existing notes row after a live Google Doc refresh. */
export async function updateContextContent(
  id: string,
  text: string,
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_context")
    .update({ content: text, synced_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

/** Persist a freshly ingested context chunk; returns the stored row's id. */
export async function addContextChunk(
  text: string,
  meta: ContextSource,
): Promise<{ id: string; syncedAt: number } | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_context")
    .insert({
      user_id: userId,
      source_kind: meta.kind,
      source_ref: refForMeta(meta),
      content: text,
    })
    .select("id, synced_at")
    .single();
  if (error || !data) return null;
  return { id: data.id as string, syncedAt: new Date(data.synced_at as string).getTime() };
}

/** Replace all chunks of a source kind with one new blob. */
export async function upsertContextByKind(
  text: string,
  meta: ContextSource,
): Promise<{ id: string; syncedAt: number } | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("user_context")
    .delete()
    .eq("user_id", userId)
    .eq("source_kind", meta.kind);
  return addContextChunk(text, meta);
}

export async function removeContextChunk(id: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_context")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

/** Reset a user's data: wipe chat + context, re-arm onboarding (data doctrine §5). */
export async function resetUserData(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const supabase = await createSupabaseServerClient();
  await supabase.from("messages").delete().eq("user_id", userId);
  await supabase.from("chat_sessions").delete().eq("user_id", userId);
  await supabase.from("user_context").delete().eq("user_id", userId);
  const resetRow = {
    onboarding_completed: false,
    topics: [] as string[],
    focus_topic: null as string | null,
    recent_topics: [] as string[],
    last_openers: [] as string[],
  };
  const { error } = await supabase
    .from("profiles")
    .update(resetRow)
    .eq("id", userId);
  if (error) {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: false, topics: [] })
      .eq("id", userId);
  }
  return true;
}
