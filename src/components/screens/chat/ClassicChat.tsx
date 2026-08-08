"use client";

import { useEffect, useRef } from "react";

import { ChatActionBar } from "@/components/chat/ChatActionBar";
import { ChatHistoryDrawer } from "@/components/chat/ChatHistoryDrawer";
import { HonzaTypingBubble } from "@/components/chat/HonzaTypingBubble";
import { MessageList } from "@/components/chat/MessageList";
import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { OrbRipples } from "@/components/honza/OrbRipples";
import { MoodOrbStrip } from "@/components/honza/MoodOrbStrip";
import { Card } from "@/components/ui/Card";
import type { ChatScreen } from "@/hooks/useChatScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { useLocale } from "@/lib/i18n/useLocale";
import { localizeClientError } from "@/lib/i18n/extended";
import { tapLight } from "@/lib/interaction/haptic";
import { cn } from "@/lib/cn";
import { useChatStore } from "@/stores/useChatStore";

/** Matches `HonzaOrb` hero size (`SIZE_PX.hero`). */
const CLASSIC_HERO_ORB_PX = 200;

export function ClassicChat({ screen }: { screen: ChatScreen }) {
  const { t } = useLocale();
  const {
    expression,
    threadMessages,
    loading,
    lastError,
    showEmptyState,
    heroMode,
    openerMessage,
    endedSessions,
    historyOpen,
    setHistoryOpen,
  } = screen;
  const typingPreview = useChatStore((s) => s.typingPreview);
  const typingPhaseActive = typingPreview !== null;
  const showTyping = typingPhaseActive;
  const composerDisabled = loading || showTyping;
  const localizedError = localizeClientError(lastError, t.errors);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { stackClassName, triggerPop } = useReactPop();

  useMoodReactions(triggerPop);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <HonzaOrb state="idle" size="avatar" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-muted" aria-hidden />
        <p className="font-sans text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100dvh-7rem)] flex-col gap-3">
        <div className="flex shrink-0 items-center justify-end">
          <button
            type="button"
            onClick={() => {
              tapLight();
              setHistoryOpen(true);
            }}
            aria-label={t.chat.history}
            className="rounded-full border border-border px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
          >
            {t.chat.history}
          </button>
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-3 py-2 transition-[transform,opacity,gap] duration-[220ms] ease-[var(--ease-out)] motion-reduce:transition-none",
            heroMode ? "flex-col text-center" : "flex-row",
          )}
        >
          <button
            type="button"
            onClick={() => {
              tapLight();
              triggerPop();
            }}
            className="relative shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={t.common.honza}
          >
            {heroMode ? (
              <OrbRipples state={expression.mood} size={CLASSIC_HERO_ORB_PX} />
            ) : null}
            <HonzaOrb
              state={expression.mood}
              size={heroMode ? "hero" : "avatar"}
              stackClassName={stackClassName}
            />
          </button>
          {!heroMode ? (
            <MoodOrbStrip
              expression={expression}
              loading={loading}
              thinkingLabel={t.chat.thinking}
              compact
              showChannel={false}
              channelPulse={typingPhaseActive}
              className="min-w-0 flex-1 items-start"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="font-sans text-xs uppercase tracking-[0.16em] text-accent">
                {loading ? t.chat.thinking : expression.czLabel}
              </span>
              <span className="font-sans text-xs text-muted-foreground">{expression.caption}</span>
            </div>
          )}
        </div>

        {heroMode && openerMessage ? (
          <Card className="motion-safe:animate-landing-fade-in shrink-0 p-4 motion-reduce:animate-none">
            <p className="mb-2 font-sans text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              {t.chat.openerKicker}
            </p>
            <p className="font-sans text-sm leading-relaxed text-accent">{openerMessage}</p>
          </Card>
        ) : null}

        <Card className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          {localizedError ? (
            <div className="shrink-0 rounded-card border border-accent/40 bg-muted px-3 py-2">
              <p className="text-sm text-accent">{localizedError}</p>
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
            {!heroMode && showEmptyState ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {t.chat.thinking}
                </p>
              </div>
            ) : !heroMode ? (
              <>
                <MessageList messages={threadMessages} />
                {showTyping ? <HonzaTypingBubble variant="classic" /> : null}
                <div ref={bottomRef} />
              </>
            ) : showTyping ? (
              <HonzaTypingBubble variant="classic" />
            ) : null}
          </div>
        </Card>

        <ChatActionBar
          onSend={screen.send}
          onEndChat={screen.endChat}
          disabled={composerDisabled}
          onSent={triggerPop}
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
