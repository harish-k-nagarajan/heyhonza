"use client";

import { useEffect, useMemo, useRef } from "react";

import { ChatActionBar } from "@/components/chat/ChatActionBar";
import { ChatHistoryDrawer } from "@/components/chat/ChatHistoryDrawer";
import { HmatOrb } from "@/components/honza/HmatOrb";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import type { ChatScreen } from "@/hooks/useChatScreen";
import { HmatScreenLoading } from "@/components/screens/hmat/HmatChrome";
import { useLocale } from "@/lib/i18n/useLocale";
import type { ChatMessage } from "@/types";

type Segment = { kind: "chat" | "call"; id: string; messages: ChatMessage[] };

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

export function HmatChat({ screen }: { screen: ChatScreen }) {
  const { t } = useLocale();
  const {
    expression,
    threadMessages,
    loading,
    lastError,
    showEmptyState,
    chatPhase,
    endedSessions,
    historyOpen,
    setHistoryOpen,
  } = screen;
  const segments = useMemo(() => segment(threadMessages), [threadMessages]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  if (!screen.ready) return <HmatScreenLoading />;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-end">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label={t.chat.history}
            className="mat-key press flex h-10 w-10 items-center justify-center rounded-full text-accent"
          >
            <HardwareIcon name="history" size={20} />
          </button>
        </div>

        <div className="mat-recess flex shrink-0 flex-col items-center px-4 py-5">
          <HmatOrb state={expression.mood} size={150} />
          <p className="mt-3 font-display text-[9px] uppercase tracking-[0.16em] text-accent">
            {loading ? t.chat.thinking : expression.czLabel}
          </p>
        </div>

        <div className="mat mt-3 flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          {lastError ? (
            <div className="mb-3 shrink-0 px-1">
              <p className="font-sans text-sm text-accent">{lastError}</p>
              {threadMessages.length === 0 ? (
                <button
                  type="button"
                  onClick={screen.retryOpener}
                  className="mt-2 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline"
                >
                  {t.chat.tryAgain}
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
            {chatPhase === "idle" ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {t.chat.emptyHint}
                </p>
              </div>
            ) : showEmptyState ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {t.chat.thinking}
                </p>
              </div>
            ) : (
              <>
                {segments.map((seg) =>
                  seg.messages.map((m) => <Bubble key={m.id} message={m} />),
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>
        </div>

        <ChatActionBar
          chatPhase={chatPhase}
          onStartChat={screen.startChat}
          onSend={screen.send}
          onEndChat={screen.endChat}
          disabled={loading}
        />
      </div>

      <ChatHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={endedSessions}
        onSelect={screen.openHistorySession}
      />
    </>
  );
}
