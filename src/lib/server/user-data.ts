import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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
  createdAt: number;
};

export type PersistedProfile = {
  name: string | null;
  level: string;
  topics: string[];
  preferredModel: string | null;
  onboardingCompleted: boolean;
};

export type UserState = {
  persisted: true;
  profile: PersistedProfile;
  contextChunks: ContextChunk[];
  contextText: string;
  messages: PersistedMessage[];
};

/** The current auth user's id, or null when unconfigured / signed out. */
export async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseServerClient();
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

/** Full hydration payload for the signed-in user, or null (use local fallback). */
export async function loadUserState(): Promise<UserState | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, contextRes, messagesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, level, topics, preferred_model, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_context")
      .select("id, source_kind, source_ref, content, synced_at")
      .eq("user_id", user.id)
      .order("synced_at", { ascending: true }),
    supabase
      .from("messages")
      .select("id, role, content, kind, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const p = profileRes.data;
  const profile: PersistedProfile = {
    name: p?.name ?? null,
    level: p?.level ?? "A2",
    topics: (p?.topics as string[] | null) ?? [],
    preferredModel: p?.preferred_model ?? null,
    onboardingCompleted: Boolean(p?.onboarding_completed),
  };

  const contextChunks = (contextRes.data ?? []).map(chunkFromRow);
  const messages: PersistedMessage[] = (messagesRes.data ?? []).map((m) => ({
    id: m.id as string,
    role: m.role as "user" | "assistant",
    content: m.content as string,
    kind: (m.kind as "chat" | "call") ?? "chat",
    createdAt: new Date(m.created_at as string).getTime(),
  }));

  return {
    persisted: true,
    profile,
    contextChunks,
    contextText: buildContextText(contextChunks),
    messages,
  };
}

/** Rebuild the same context blob the engine consumes, but from DB rows. */
export function buildContextText(chunks: ContextChunk[]): string {
  if (!chunks.length) return "";
  return chunks
    .map((c) => {
      const head =
        c.meta.kind === "google_doc"
          ? `## Google Doc\n${c.meta.url}`
          : c.meta.kind === "file"
            ? `## File: ${c.meta.name}`
            : `## ${c.meta.label}`;
      return `${head}\n\n${c.text}`;
    })
    .join("\n\n---\n\n");
}

/** Load only what the engine needs to build context (context + topics + level). */
export async function loadEngineContext(): Promise<{
  contextText: string;
  topics: string[];
  level: string;
  preferredModel: string | null;
} | null> {
  const state = await loadUserState();
  if (!state) return null;
  return {
    contextText: state.contextText,
    topics: state.profile.topics,
    level: state.profile.level,
    preferredModel: state.profile.preferredModel,
  };
}

export async function loadMessages(): Promise<PersistedMessage[] | null> {
  const state = await loadUserState();
  return state ? state.messages : null;
}

/** Append turns for the signed-in user. No-op (returns false) when unconfigured. */
export async function insertMessages(
  turns: { role: "user" | "assistant"; content: string; kind?: "chat" | "call" }[],
): Promise<boolean> {
  const userId = await getUserId();
  if (!userId || turns.length === 0) return false;
  const supabase = createSupabaseServerClient();
  const rows = turns.map((t) => ({
    user_id: userId,
    role: t.role,
    content: t.content,
    kind: t.kind ?? "chat",
  }));
  const { error } = await supabase.from("messages").insert(rows);
  return !error;
}

export type ProfilePatch = Partial<{
  name: string | null;
  level: string;
  topics: string[];
  preferredModel: string | null;
  onboardingCompleted: boolean;
}>;

export async function updateProfile(patch: ProfilePatch): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const supabase = createSupabaseServerClient();
  const row: Record<string, unknown> = {};
  if ("name" in patch) row.name = patch.name;
  if ("level" in patch) row.level = patch.level;
  if ("topics" in patch) row.topics = patch.topics;
  if ("preferredModel" in patch) row.preferred_model = patch.preferredModel;
  if ("onboardingCompleted" in patch)
    row.onboarding_completed = patch.onboardingCompleted;
  if (Object.keys(row).length === 0) return true;
  const { error } = await supabase.from("profiles").update(row).eq("id", userId);
  return !error;
}

/** Persist a freshly ingested context chunk; returns the stored row's id. */
export async function addContextChunk(
  text: string,
  meta: ContextSource,
): Promise<{ id: string; syncedAt: number } | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = createSupabaseServerClient();
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

export async function removeContextChunk(id: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  const supabase = createSupabaseServerClient();
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
  const supabase = createSupabaseServerClient();
  await supabase.from("messages").delete().eq("user_id", userId);
  await supabase.from("user_context").delete().eq("user_id", userId);
  await supabase
    .from("profiles")
    .update({ onboarding_completed: false, topics: [] })
    .eq("id", userId);
  return true;
}
