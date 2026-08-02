"use client";

import { useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { ChatActionBar } from "@/components/chat/ChatActionBar";
import { ChatHistoryDrawer } from "@/components/chat/ChatHistoryDrawer";
import { HonzaOrbBackdrop } from "@/components/honza/HonzaOrbBackdrop";
import { HmatOrb } from "@/components/honza/HmatOrb";
import { MoodOrbStrip } from "@/components/honza/MoodOrbStrip";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import type { ChatScreen } from "@/hooks/useChatScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { TYPE } from "@/lib/design/typography";
import { tapLight } from "@/lib/interaction/haptic";
import { useLocale } from "@/lib/i18n/useLocale";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/cn";

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

function Bubble({ message, index }: { message: ChatMessage; index: number }) {
  const me = message.role === "user";
  const delay = Math.min(index, 3) * 60;
  return (
    <div
      className={cn(
        "max-w-[82%] motion-safe:animate-message-in motion-reduce:animate-none motion-reduce:opacity-100",
        me ? "self-end" : "self-start",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "px-3.5 py-2.5",
          me ? "" : "mat mat-tilt",
        )}
        style={
          me
            ? {
                borderRadius: "16px 16px 5px 16px",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--accent) 96%, #fff), var(--accent))",
                color: "#fff",
                boxShadow:
                  "0 3px 8px color-mix(in srgb, var(--accent) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.3)",
              }
            : { borderRadius: "16px 16px 16px 5px" }
        }
      >
        <p className={TYPE.bodySm}>{message.content}</p>
      </div>
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
    heroMode,
    openerMessage,
    endedSessions,
    historyOpen,
    setHistoryOpen,
  } = screen;
  const segments = useMemo(() => segment(threadMessages), [threadMessages]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { stackClassName, triggerPop } = useReactPop();
  const prevMoodRef = useRef(expression.mood);

  useMoodReactions(triggerPop);

  useEffect(() => {
    if (prevMoodRef.current !== expression.mood) {
      prevMoodRef.current = expression.mood;
    }
  }, [expression.mood]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  if (!screen.ready) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
        <HmatOrb state="idle" size={72} breathe={false} />
        <div className="mat h-4 w-32 animate-pulse rounded-full opacity-60" aria-hidden />
        <p className={TYPE.label + " text-muted-foreground"}>Načítání…</p>
      </div>
    );
  }

  const channelPulse = expression.mood === "speaking" || expression.mood === "excited";

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-end">
          <Button
            type="button"
            surface="mat-key"
            shape="circle"
            size="icon"
            onClick={() => {
              setHistoryOpen(true);
            }}
            aria-label={t.chat.history}
          >
            <HardwareIcon name="history" size={20} />
          </Button>
        </div>

        <div
          className={cn(
            "mat-recess flex shrink-0 transition-all duration-300 motion-reduce:transition-none",
            heroMode ? "chat-orb-header hero flex-col items-center" : "chat-orb-header compact flex-row",
          )}
        >
          <button
            type="button"
            onClick={() => {
              tapLight();
              triggerPop();
            }}
            className="chat-orb-wrap rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Honza"
          >
            <span
              className="orb-lead-stack"
              style={{ width: heroMode ? 150 : 48, height: heroMode ? 150 : 48 }}
            >
              <HonzaOrbBackdrop
                state={expression.mood}
                size={heroMode ? 150 : 48}
              />
              <HmatOrb
                state={expression.mood}
                size={heroMode ? 150 : 48}
                breathe={heroMode}
                stackClassName={stackClassName}
              />
            </span>
          </button>
          <MoodOrbStrip
            expression={expression}
            loading={loading}
            thinkingLabel={t.chat.thinking}
            channelPulse={channelPulse}
            compact={!heroMode}
            className={heroMode ? "mt-3 w-full" : "min-w-0 flex-1"}
          />
        </div>

        {heroMode && openerMessage ? (
          <div className="mat-metal mat-tilt mt-3 shrink-0 px-4 py-3.5 motion-safe:animate-landing-fade-in motion-reduce:animate-none">
            <p className={TYPE.label + " mb-2 text-muted-foreground"}>HONZA TI NAPSAL</p>
            <p className={TYPE.bodySm}>{openerMessage}</p>
          </div>
        ) : null}

        <div className="mat mat-tilt mt-3 flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          {lastError ? (
            <div className="mb-3 shrink-0 px-1">
              <p className={TYPE.bodySm + " text-accent"}>{lastError}</p>
              {threadMessages.length === 0 ? (
                <button
                  type="button"
                  onClick={screen.retryOpener}
                  className={cn("mt-2 underline text-muted-foreground", TYPE.label)}
                >
                  {t.chat.tryAgain}
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto">
            {!heroMode && showEmptyState ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <p className={TYPE.helper}>{t.chat.thinking}</p>
              </div>
            ) : !heroMode ? (
              <>
                {segments.map((seg) =>
                  seg.messages.map((m, i) => <Bubble key={m.id} message={m} index={i} />),
                )}
                <div ref={bottomRef} />
              </>
            ) : loading && !openerMessage ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <p className={TYPE.helper}>{t.chat.thinking}</p>
              </div>
            ) : null}
          </div>
        </div>

        <ChatActionBar
          onSend={screen.send}
          onEndChat={screen.endChat}
          disabled={loading}
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
