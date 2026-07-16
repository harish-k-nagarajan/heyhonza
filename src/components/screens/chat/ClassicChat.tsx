"use client";

import { Composer } from "@/components/chat/Composer";
import { MessageList } from "@/components/chat/MessageList";
import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ChatScreen } from "@/hooks/useChatScreen";

/**
 * Classic Chat presentation — the shipped app, byte-for-byte. Behaviour comes
 * from `useChatScreen` (via `screen`); the markup is unchanged.
 */
export function ClassicChat({ screen }: { screen: ChatScreen }) {
  const { expression, threadMessages, loading, lastError, showEmptyState } = screen;

  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-3">
      {/* Character-first header: Honza leads, and his face reacts to state. */}
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HonzaOrb state={expression.mood} size="avatar" />
          <div className="flex flex-col gap-1">
            <SectionLabel>Chat with Honza</SectionLabel>
            <span className="font-sans text-xs text-muted-foreground">
              {loading ? "Honza is typing…" : "Reply in Czech, get corrected."}
            </span>
          </div>
        </div>
        <Button type="button" variant="ghost" className="text-xs" onClick={screen.clearThread}>
          New chat
        </Button>
      </header>

      {lastError ? (
        <Card className="border-accent/40 bg-muted">
          <p className="text-sm text-accent">{lastError}</p>
          {threadMessages.length === 0 ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={screen.retryOpener}
            >
              Try again
            </Button>
          ) : null}
        </Card>
      ) : null}

      <Card className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        {showEmptyState ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <HonzaOrb state="idle" size="avatar" />
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Honza will open the conversation in Czech. Reply below and he&apos;ll
              keep it going.
            </p>
          </div>
        ) : (
          <MessageList messages={threadMessages} />
        )}
        <Composer onSend={screen.send} disabled={loading} />
      </Card>
    </div>
  );
}
