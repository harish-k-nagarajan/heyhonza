"use client";

import { useEffect, useRef } from "react";

import { ChatActionBar } from "@/components/chat/ChatActionBar";
import { ChatHistoryDrawer } from "@/components/chat/ChatHistoryDrawer";
import { MessageList } from "@/components/chat/MessageList";
import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Card } from "@/components/ui/Card";
import type { ChatScreen } from "@/hooks/useChatScreen";
import { useLocale } from "@/lib/i18n/useLocale";

export function ClassicChat({ screen }: { screen: ChatScreen }) {
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100dvh-7rem)] flex-col gap-3">
        <div className="flex shrink-0 items-center justify-end">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            aria-label={t.chat.history}
            className="rounded-full border border-border px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
          >
            {t.chat.history}
          </button>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 py-2 text-center">
          <HonzaOrb state={expression.mood} size="hero" className="shrink-0" />
          <span className="font-sans text-xs text-muted-foreground">
            {loading ? t.chat.thinking : "Reply in Czech, get corrected."}
          </span>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          {lastError ? (
            <div className="shrink-0 border border-accent/40 bg-muted px-3 py-2">
              <p className="text-sm text-accent">{lastError}</p>
              {threadMessages.length === 0 ? (
                <button
                  type="button"
                  onClick={screen.retryOpener}
                  className="mt-2 font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline"
                >
                  {t.chat.tryAgain}
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {chatPhase === "idle" ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {t.chat.emptyHint}
                </p>
              </div>
            ) : showEmptyState ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {t.chat.thinking}
                </p>
              </div>
            ) : (
              <>
                <MessageList messages={threadMessages} />
                <div ref={bottomRef} />
              </>
            )}
          </div>
        </Card>

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
