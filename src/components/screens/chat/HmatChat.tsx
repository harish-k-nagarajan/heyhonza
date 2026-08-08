"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import {
  HmatChatComposerRow,
  HmatChatThread,
  HmatHonzaBubble,
  HmatOpenerCard,
  HmatPresenceRecess,
  HmatScreenTitle,
  HmatStatusChip,
  HmatUserBubble,
} from "@/components/screens/hmat/HmatUi";
import type { ChatScreen } from "@/hooks/useChatScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { localizeClientError } from "@/lib/i18n/extended";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/cn";

function chipLabel(screen: ChatScreen, t: ReturnType<typeof useLocale>["t"]): string {
  if (screen.lastError) return t.chat.chipProblem;
  if (screen.loading) return t.chat.chipThinking;
  if (!screen.heroMode) return t.chat.chipInChat;
  return t.chat.chipPresent;
}

export function HmatChat({ screen }: { screen: ChatScreen }) {
  const { t } = useLocale();
  const {
    expression,
    threadMessages,
    loading,
    lastError,
    heroMode,
    openerMessage,
  } = screen;
  const threadRef = useRef<HTMLDivElement>(null);
  const { stackClassName, triggerPop } = useReactPop();
  const [draft, setDraft] = useState("");

  useMoodReactions(triggerPop);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [threadMessages.length, loading]);

  const composerMode = heroMode ? "idle" : "ongoing";
  const localizedError = localizeClientError(lastError, t.errors);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft("");
    screen.send(text);
    triggerPop();
  }, [draft, loading, screen, triggerPop]);

  if (!screen.ready) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
        <HmatOrb state="idle" size={72} breathe={false} />
        <div className="mat h-4 w-32 animate-pulse rounded-full opacity-60" aria-hidden />
        <p className={TYPE.label + " text-muted-foreground"}>{t.common.loading}</p>
      </div>
    );
  }

  const orbState = loading ? "thinking" : expression.mood;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <div className="flex shrink-0 flex-col gap-3">
          <HmatPresenceRecess
            orbState={orbState}
            loading={loading}
            stackClassName={stackClassName}
            onOrbTap={triggerPop}
          />

          <div className="flex flex-col items-center gap-2">
            <HmatScreenTitle>{t.chat.titlePresent}</HmatScreenTitle>
            <HmatStatusChip label={chipLabel(screen, t)} />
          </div>
        </div>

        <HmatChatThread
          ref={threadRef}
          watchKey={`${threadMessages.length}-${loading}-${heroMode}`}
        >
          {localizedError ? (
            <p className={cn(TYPE.bodySm, "text-center text-accent")} role="alert">
              {localizedError}
              {threadMessages.length === 0 ? (
                <button
                  type="button"
                  onClick={screen.retryOpener}
                  className={cn("mt-2 block w-full underline text-muted-foreground", TYPE.label)}
                >
                  {t.chat.tryAgain}
                </button>
              ) : null}
            </p>
          ) : null}

          {heroMode && openerMessage ? (
            <HmatOpenerCard>{openerMessage}</HmatOpenerCard>
          ) : heroMode && loading && !openerMessage ? (
            <p className={cn(TYPE.helper, "text-center")}>{t.chat.thinking}</p>
          ) : !heroMode ? (
            <>
              {threadMessages.map((m: ChatMessage) =>
                m.role === "user" ? (
                  <HmatUserBubble key={m.id}>{m.content}</HmatUserBubble>
                ) : (
                  <HmatHonzaBubble key={m.id}>{m.content}</HmatHonzaBubble>
                ),
              )}
              {loading ? (
                <HmatHonzaBubble>
                  <span className="text-muted-foreground">{t.chat.thinking}</span>
                </HmatHonzaBubble>
              ) : null}
            </>
          ) : null}
        </HmatChatThread>

        <div className="shrink-0">
          <HmatChatComposerRow
            mode={composerMode}
            value={draft}
            onChange={setDraft}
            onSend={send}
            onEndChat={screen.endChat}
            disabled={loading}
            placeholder={
              composerMode === "idle" ? t.chat.placeholderIdle : t.chat.placeholderOngoing
            }
            sendLabel={t.chat.send}
            endLabel={t.chat.endChat}
          />
        </div>
      </div>
    </>
  );
}
