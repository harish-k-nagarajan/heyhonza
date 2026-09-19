import { NextResponse } from "next/server";

import {
  EngineError,
  buildOpenerPrompt,
  generateReply,
  sanitizeMessages,
} from "@/lib/server/conversation-engine";
import { prepareEngineTurn } from "@/lib/server/engine-turn";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import {
  insertMessages,
  loadEngineContext,
  updateContextContent,
  updateProfile,
} from "@/lib/server/user-data";
import { resolveProviderKey } from "@/lib/server/provider-keys";
import {
  LAST_OPENER_LIMIT,
  RECENT_TOPIC_LIMIT,
  asStringList,
  asTopicIds,
  rememberOpener,
} from "@/lib/topic-focus";

export const runtime = "nodejs";

type ChatRequestBody = {
  model?: string;
  messages?: unknown;
  topics?: string[];
  learnerContext?: string;
  level?: string;
  bootstrap?: boolean;
  /** Phase 7 — client hints so the unprompted opener feels ambient. */
  localHour?: number;
  lastContactAt?: number;
  /**
   * Phase 8 — where this turn came from. Spoken turns persist into the *same*
   * history as typed ones, tagged so Chat can render them as a call transcript.
   */
  kind?: "chat" | "call";
  sessionId?: string;
  formality?: string;
  learnerName?: string;
  focusTopic?: string | null;
  recentTopics?: string[];
  lastOpeners?: string[];
};

export async function POST(req: Request) {
  // Best-effort abuse protection before we do any work.
  const limit = rateLimit(clientKey(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Slow down a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const bootstrap = Boolean(body.bootstrap);
  const kind = body.kind === "call" ? "call" : "chat";
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.length > 0
      ? body.sessionId
      : undefined;
  const messages = sanitizeMessages(body.messages, bootstrap);
  if (!messages) {
    return NextResponse.json(
      { error: "Missing messages or bootstrap." },
      { status: 400 },
    );
  }

  // When the user is signed in, the engine reads context/topics/level from the
  // DB (BUILD_SPEC §3/§5: "the engine reads context from the store, not the
  // client"). Falls back to the client-sent values in local pass-through dev.
  const serverContext = await loadEngineContext();
  const persisted = serverContext !== null;
  const llm = await resolveProviderKey("openrouter");

  const topics = serverContext
    ? serverContext.topics
    : Array.isArray(body.topics)
      ? body.topics
      : [];
  const prepared = await prepareEngineTurn({
    bootstrap,
    topics,
    focusTopic: serverContext
      ? serverContext.focusTopic
      : typeof body.focusTopic === "string"
        ? body.focusTopic
        : null,
    recentTopics: serverContext
      ? serverContext.recentTopics
      : asTopicIds(body.recentTopics),
    lastOpeners: serverContext
      ? serverContext.lastOpeners
      : asStringList(body.lastOpeners, LAST_OPENER_LIMIT),
    chunks: serverContext?.contextChunks ?? [],
    learnerContextFallback:
      typeof body.learnerContext === "string" ? body.learnerContext : "",
  });

  const engineMessages = bootstrap
    ? [
        {
          role: "user" as const,
          content: buildOpenerPrompt({
            localHour: typeof body.localHour === "number" ? body.localHour : undefined,
            lastContactAt:
              typeof body.lastContactAt === "number" ? body.lastContactAt : undefined,
            mode: kind,
            focusTopic: prepared.focus,
            lastOpeners: prepared.lastOpeners,
          }),
        },
      ]
    : messages;

  try {
    const { text, model } = await generateReply({
      mode: kind,
      requestedModel: serverContext?.preferredModel ?? body.model,
      topics,
      learnerContext: prepared.contextText,
      level: serverContext?.level ?? (typeof body.level === "string" ? body.level : undefined),
      learnerName:
        serverContext?.name ??
        (typeof body.learnerName === "string" ? body.learnerName : undefined),
      formality:
        serverContext?.formality ??
        (typeof body.formality === "string" ? body.formality : undefined),
      apiKey: llm.key,
      messages: engineMessages,
      focusTopic: prepared.focus,
      recentTopics: prepared.recent,
      lastOpeners: prepared.lastOpeners,
    });

    const nextOpeners = bootstrap
      ? rememberOpener(prepared.lastOpeners, text)
      : prepared.lastOpeners;

    if (persisted) {
      const turns: {
        role: "user" | "assistant";
        content: string;
        kind: "chat" | "call";
        sessionId?: string;
      }[] = [];
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (!bootstrap && lastUser) {
        turns.push({ role: "user", content: lastUser.content, kind, sessionId });
      }
      turns.push({ role: "assistant", content: text, kind, sessionId });
      await insertMessages(turns);
      await updateProfile({
        focusTopic: prepared.focus,
        recentTopics: prepared.recent.slice(-RECENT_TOPIC_LIMIT),
        lastOpeners: nextOpeners,
      });
      await Promise.all(
        prepared.chunkUpdates.map((u) => updateContextContent(u.id, u.text)),
      );
    }

    return NextResponse.json({
      message: text,
      model,
      persisted,
      kind,
      focusTopic: prepared.focus,
      recentTopics: prepared.recent,
      lastOpeners: nextOpeners,
    });
  } catch (e) {
    if (e instanceof EngineError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
