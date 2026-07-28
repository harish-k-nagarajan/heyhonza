"use client";

import { useEffect, useMemo, useRef } from "react";

import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ChatMessage } from "@/types";

import { MessageBubble } from "./MessageBubble";

/**
 * One continuous history, two kinds of turn. Consecutive `kind:'call'` messages
 * are grouped and framed as a transcript rather than tagged one bubble at a
 * time — a call was a single event, and reading it back as a run of loose
 * bubbles would lose that. Typed turns render exactly as before.
 */

type Segment =
  | { kind: "chat"; id: string; messages: ChatMessage[] }
  | { kind: "call"; id: string; messages: ChatMessage[] };

function segment(messages: ChatMessage[]): Segment[] {
  const out: Segment[] = [];
  for (const m of messages) {
    const kind = m.kind === "call" ? "call" : "chat";
    const tail = out[out.length - 1];
    if (tail && tail.kind === kind) {
      tail.messages.push(m);
    } else {
      out.push({ kind, id: m.id, messages: [m] });
    }
  }
  return out;
}

function CallTranscript({ messages }: { messages: ChatMessage[] }) {
  const started = messages[0]?.createdAt;
  return (
    <section
      className="rounded-card border border-dashed border-accent/40 bg-accent/[0.03] p-3"
      aria-label="Call transcript"
    >
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <SectionLabel as="p" className="text-[9px]">
          Call transcript
        </SectionLabel>
        {started ? (
          <time
            className="font-sans text-[9px] text-muted-foreground"
            dateTime={new Date(started).toISOString()}
          >
            {new Date(started).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </time>
        ) : null}
      </header>
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <MessageBubble key={m.id} message={m} index={i} />
        ))}
      </div>
    </section>
  );
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const segments = useMemo(() => segment(messages), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
      {segments.map((seg) =>
        seg.kind === "call" ? (
          <CallTranscript key={seg.id} messages={seg.messages} />
        ) : (
          seg.messages.map((m, i) => (
            <MessageBubble key={m.id} message={m} index={i} />
          ))
        ),
      )}
      <div ref={bottomRef} />
    </div>
  );
}
