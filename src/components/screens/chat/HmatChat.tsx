"use client";

import { useEffect, useMemo, useRef } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import type { ChatScreen } from "@/hooks/useChatScreen";
import { HmatScreenLoading } from "@/components/screens/hmat/HmatChrome";
import { HmatComposer } from "@/components/screens/hmat/HmatComposer";
import type { ChatMessage } from "@/types";

/**
 * Hmat Chat — Honza leads from a material header card, the thread runs in
 * tactile bubbles (user = lit accent, Honza = machined card), and a run of
 * `kind:'call'` turns is framed as a call transcript. Behaviour comes from
 * `useChatScreen`; Czech renders in the body face with full diacritics.
 */

type Segment = { kind: "chat" | "call"; id: string; messages: ChatMessage[] };

// Mirrors the grouping in the Classic MessageList: a call was one event, so its
// consecutive turns read back as a labelled transcript, not loose bubbles.
function segment(messages: ChatMessage[]): Segment[] {
  const out: Segment[] = [];
  for (const m of messages) {
    const kind = m.kind === "call" ? "call" : "chat";
    const tail = out[out.length - 1];
    if (tail && tail.kind === kind) tail.messages.push(m);
    else out.push({ kind, id: m.id, messages: [m] });
  }
  return out;
}

function Bubble({ message }: { message: ChatMessage }) {
  const me = message.role === "user";
  if (me) {
    return (
      <div
        className="max-w-[82%] self-end px-3.5 py-2.5"
        style={{
          borderRadius: "16px 16px 5px 16px",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 96%, #fff), var(--accent))",
          color: "#fff",
          boxShadow:
            "0 3px 8px color-mix(in srgb, var(--accent) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <p className="font-sans text-[14.5px] leading-relaxed">{message.content}</p>
      </div>
    );
  }
  return (
    <div
      className="mat max-w-[82%] self-start px-3.5 py-2.5"
      style={{ borderRadius: "16px 16px 16px 5px" }}
    >
      <p className="font-sans text-[14.5px] leading-relaxed text-foreground">
        {message.content}
      </p>
    </div>
  );
}

function CallTranscript({ messages }: { messages: ChatMessage[] }) {
  return (
    <section
      className="rounded-[16px] border border-dashed border-accent/40 bg-accent/[0.03] p-3"
      aria-label="Call transcript"
    >
      <p className="mb-3 font-display text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        Přepis hovoru
      </p>
      <div className="flex flex-col gap-2.5">
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
      </div>
    </section>
  );
}

export function HmatChat({ screen }: { screen: ChatScreen }) {
  const { expression, threadMessages, loading, lastError, showEmptyState } = screen;
  const segments = useMemo(() => segment(threadMessages), [threadMessages]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  if (!screen.ready) return <HmatScreenLoading />;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Character-first header card. */}
      <header className="mat flex shrink-0 items-center gap-3 px-3.5 py-2.5">
        <HmatOrb state={expression.mood} size={40} breathe={false} />
        <div className="flex-1">
          <p className="font-display text-[12px] tracking-[0.06em] text-foreground">Honza</p>
          <p className="font-display text-[8.5px] uppercase tracking-[0.12em] text-accent">
            {loading ? "Přemýšlí" : expression.czLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={screen.clearThread}
          className="font-display text-[9px] uppercase tracking-[0.14em] text-muted-foreground"
        >
          Nový
        </button>
      </header>

      {lastError ? (
        <div className="mat px-4 py-3">
          <p className="font-sans text-sm text-accent">{lastError}</p>
          {threadMessages.length === 0 ? (
            <button
              type="button"
              onClick={screen.retryOpener}
              className="mt-2 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline"
            >
              Zkusit znovu
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Thread. */}
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-y-auto">
        {showEmptyState ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <HmatOrb state="idle" size={64} breathe={false} />
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Honza začne konverzaci česky. Odpověz níže a bude pokračovat.
            </p>
          </div>
        ) : (
          <>
            {segments.map((seg) =>
              seg.kind === "call" ? (
                <CallTranscript key={seg.id} messages={seg.messages} />
              ) : (
                seg.messages.map((m) => <Bubble key={m.id} message={m} />)
              ),
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <HmatComposer onSend={screen.send} disabled={loading} />
    </div>
  );
}
