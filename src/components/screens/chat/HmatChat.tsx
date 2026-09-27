"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { HonzaTypingBubble } from "@/components/chat/HonzaTypingBubble";
import {
  HmatChatComposerRow,
  HmatChatThread,
  HmatHonzaBubble,
  HmatNeedsKeyEmpty,
  HmatPresenceRecess,
  HmatScreenTitle,
  HmatStatusChip,
  HmatUserBubble,
} from "@/components/screens/hmat/HmatUi";
import type { ChatScreen } from "@/hooks/useChatScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { localizeClientError } from "@/lib/i18n/extended";
import {
  chatChip,
  chatTitle,
  resolveChatStatus,
  type ChatCopy,
} from "@/lib/i18n/locales";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { ROUTES } from "@/lib/constants";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/cn";
import { tapLight } from "@/lib/interaction/haptic";
import { useChatStore } from "@/stores/useChatStore";

function readDurationMs(el: HTMLElement | null, prop: string, fallback: number): number {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  if (!el) return fallback;
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  if (!raw) return fallback;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return fallback;
  return raw.endsWith("s") && !raw.endsWith("ms") ? n * 1000 : n;
}

function longestChipLabel(c: ChatCopy): string {
  return [
    c.chipUnlinked,
    c.chipReady,
    c.chipWaiting,
    c.chipOnline,
    c.chipThinking,
    c.chipReplying,
    c.chipFixing,
    c.chipSnag,
    c.chipThrilled,
  ].reduce((a, b) => (a.length >= b.length ? a : b));
}

function HmatEmptyHint({ text }: { text: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className={cn("t-stagger", shown && "is-shown")}>
      <p className={cn("t-stagger-line t-stagger-line--1", TYPE.bodySm, "text-center text-[#6E8A74]")}>
        {text}
      </p>
    </div>
  );
}

/** Survives dock remounts in this JS context; resets on full reload. */
let chatBootCeremonyDone = false;

export function HmatChat({ screen }: { screen: ChatScreen }) {
  const { t } = useLocale();
  const {
    expression,
    threadMessages,
    loading,
    lastError,
    heroMode,
    showStartGate,
    showEmptyState,
    llmReady,
    providersLoaded,
  } = screen;
  const typingPreview = useChatStore((s) => s.typingPreview);
  const typingPhaseActive = typingPreview !== null;
  const showTyping = loading || typingPhaseActive;
  const composerDisabled = loading || showTyping;
  const threadRef = useRef<HTMLDivElement>(null);
  const threadAccRef = useRef<HTMLDivElement>(null);
  const { stackClassName, triggerPop } = useReactPop();
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [presenceShown, setPresenceShown] = useState(false);
  const [copyShown, setCopyShown] = useState(false);
  const [draft, setDraft] = useState("");
  const [composerFocused, setComposerFocused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [stashedMessages, setStashedMessages] = useState<ChatMessage[]>([]);
  const [exitingMessages, setExitingMessages] = useState<ChatMessage[]>([]);
  const [prevWantThreadOpen, setPrevWantThreadOpen] = useState(!showStartGate);

  useMoodReactions(triggerPop);

  const wantThreadOpen = !showStartGate;

  if (threadMessages.length > 0 && stashedMessages !== threadMessages) {
    setStashedMessages(threadMessages);
  }

  if (prevWantThreadOpen !== wantThreadOpen) {
    setPrevWantThreadOpen(wantThreadOpen);
    if (!wantThreadOpen) {
      setIsExiting(true);
      setExitingMessages(stashedMessages);
    } else {
      setIsExiting(false);
      setExitingMessages([]);
    }
  }

  const threadOpen = wantThreadOpen || isExiting;

  useEffect(() => {
    if (!isExiting) return;
    const el = threadAccRef.current;
    const wait = Math.max(
      readDurationMs(el, "--acc-collapse", 350),
      readDurationMs(el, "--panel-close-dur", 350),
    );
    const id = window.setTimeout(() => {
      setIsExiting(false);
      setExitingMessages([]);
      setStashedMessages([]);
    }, wait);
    return () => window.clearTimeout(id);
  }, [isExiting]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [threadMessages.length, showTyping]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const skipCeremony = chatBootCeremonyDone;
    chatBootCeremonyDone = true;

    const reveal = () => {
      setRevealed(true);
      if (skipCeremony) {
        setPresenceShown(true);
        setCopyShown(true);
        return;
      }
      window.requestAnimationFrame(() => {
        setPresenceShown(true);
        setCopyShown(true);
      });
    };

    // Don't tie this to server sync. A slow history load was cancelling the
    // timer and holding the skeleton until old messages arrived.
    const timeout = window.setTimeout(reveal, 240);
    return () => window.clearTimeout(timeout);
  }, [mounted]);

  const composerMode = heroMode ? "idle" : "ongoing";
  const localizedError = localizeClientError(lastError, t.errors);
  const needsOpenRouterKey = showStartGate && providersLoaded && !llmReady;
  const statusPhase = resolveChatStatus({
    lastError,
    loading,
    showStartGate,
    heroMode,
    mood: expression.mood,
    llmReady,
    providersLoaded,
  });
  const statusLabel = chatChip(statusPhase, t.chat);
  const statusTitle = chatTitle(statusPhase, t.chat);
  const sizerLabel = longestChipLabel(t.chat);
  const actionMode = showStartGate ? "gate" : composerMode;
  const orbState = loading ? "thinking" : expression.mood;
  const visibleMessages = threadMessages.length > 0 ? threadMessages : exitingMessages;
  const showThreadMessages = visibleMessages.length > 0;

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || composerDisabled) return;
    setDraft("");
    screen.send(text);
    triggerPop();
  }, [draft, composerDisabled, screen, triggerPop]);

  const chatBody = (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3">
        <HmatPresenceRecess
          className={cn("hmat-orb-presence", presenceShown && "is-shown")}
          orbState={orbState}
          loading={loading}
          channelPulse={typingPhaseActive}
          stackClassName={stackClassName}
          onOrbTap={triggerPop}
          breathe={presenceShown}
          attentive={composerFocused && !composerDisabled}
        />

        <div className={cn("t-stagger flex flex-col items-center gap-1.5", copyShown && "is-shown")}>
          <HmatScreenTitle>
            <span className="t-stagger-line t-stagger-line--1">{statusTitle}</span>
          </HmatScreenTitle>
          <span className="t-stagger-line t-stagger-line--2">
            <HmatStatusChip
              label={statusLabel}
              sizerLabel={sizerLabel}
              shimmer={loading}
              muted={statusPhase === "unlinked"}
            />
          </span>
        </div>
      </div>

      {needsOpenRouterKey ? (
        <HmatNeedsKeyEmpty
          title={t.chat.missingOpenRouterTitle}
          body={t.chat.missingOpenRouter}
          icon="chatUnlinked"
        />
      ) : (
        <div
          ref={threadAccRef}
          className="t-acc hmat-chat-thread-acc"
          data-open={threadOpen ? "true" : "false"}
        >
          <div className="t-acc-panel">
            <div className="t-acc-panel-inner">
              <div className="t-panel-slide" data-open={threadOpen ? "true" : "false"}>
                <HmatChatThread
                  ref={threadRef}
                  watchKey={`${visibleMessages.length}-${showTyping}-${heroMode}-${threadOpen}`}
                >
                  {localizedError ? (
                    <p className={cn(TYPE.bodySm, "text-center text-accent")} role="alert">
                      {localizedError}
                    </p>
                  ) : null}

                  {showEmptyState ? <HmatEmptyHint text={t.chat.emptyHint} /> : null}

                  {showThreadMessages
                    ? visibleMessages.map((m: ChatMessage, i) =>
                        m.role === "user" ? (
                          <HmatUserBubble key={m.id} index={i}>
                            {m.content}
                          </HmatUserBubble>
                        ) : (
                          <HmatHonzaBubble key={m.id} index={i}>
                            {m.content}
                          </HmatHonzaBubble>
                        ),
                      )
                    : null}

                  {showTyping && threadOpen ? <HonzaTypingBubble variant="hmat" /> : null}
                </HmatChatThread>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0">
        <div
          className="t-resize hmat-chat-action-slot"
          data-mode={actionMode}
        >
          <div
            className={cn("hmat-chat-action-face", showStartGate && "is-front")}
            inert={!showStartGate || undefined}
            aria-hidden={!showStartGate}
          >
            {needsOpenRouterKey ? (
              <Link
                href={ROUTES.settingsAiText}
                onClick={() => tapLight()}
                className="hmat-ink-action flex h-[52px] w-full items-center justify-center rounded-2xl text-white"
              >
                <span className={cn(TYPE.bodySm, "font-display font-semibold")}>
                  {t.chat.addOpenRouterKey}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  tapLight();
                  screen.startChat();
                }}
                disabled={providersLoaded && !llmReady}
                className="hmat-ink-action flex h-[52px] w-full items-center justify-center rounded-2xl text-white disabled:opacity-40"
              >
                <span className={cn(TYPE.bodySm, "font-display font-semibold")}>
                  {t.chat.startChat}
                </span>
              </button>
            )}
          </div>
          <div
            className={cn("hmat-chat-action-face", !showStartGate && "is-front")}
            inert={showStartGate || undefined}
            aria-hidden={showStartGate}
          >
            <HmatChatComposerRow
              mode={composerMode}
              value={draft}
              onChange={setDraft}
              onSend={send}
              onEndChat={screen.endChat}
              disabled={composerDisabled}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              placeholder={
                composerMode === "idle" ? t.chat.placeholderIdle : t.chat.placeholderOngoing
              }
              sendLabel={t.chat.send}
              endLabel={t.chat.endChat}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const skeleton = (
    <div className="t-skel-skeleton is-pulsing hmat-chat-skel-layer" aria-hidden>
      <div className="hmat-recess-hero hmat-recess-hero--idle">
        <div className="hmat-display-module hmat-presence-shared">
          <div className="hmat-orb-seat relative">
            <div className="rounded-[34%] bg-muted/35" style={{ width: 120, height: 120 }} />
          </div>
        </div>
        <div className="mat-channel w-[200px]" />
        <div className="h-3.5 w-16 rounded-sm bg-muted/40" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="hmat-chat-skel-title" />
        <div className="hmat-chat-skel-chip" />
      </div>
      <div className="min-h-0 flex-1" />
      <div className="hmat-chat-skel-cta" />
    </div>
  );

  return (
    <div className={cn("t-skel hmat-chat-skel", revealed && "is-revealed")}>
      {skeleton}
      <div className="t-skel-content hmat-chat-skel-layer" aria-hidden={!revealed}>
        {mounted ? chatBody : null}
      </div>
    </div>
  );
}
