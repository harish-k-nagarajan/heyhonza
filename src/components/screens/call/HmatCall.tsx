"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { CAPTION_TYPE, CaptionTextReveal } from "@/components/call/CaptionTextReveal";
import { CallThinkingGlyph } from "@/components/call/CallThinkingGlyph";
import { CallControlCluster } from "@/components/screens/call/CallControlCluster";
import { ROUTES } from "@/lib/constants";
import {
  HmatNeedsKeyEmpty,
  HmatPresenceRecess,
  HmatScreenTitle,
  HmatStatusChip,
} from "@/components/screens/hmat/HmatUi";
import type { CallScreen } from "@/hooks/useCallScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { callChip, callTitle } from "@/lib/i18n/extended";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { tapLight, tapMedium } from "@/lib/interaction/haptic";

const DISSOLVE_MS = 300;
const DISSOLVE_EASE = [0.22, 1, 0.36, 1] as const;

function captionPlaceholder(
  phase: CallScreen["phase"],
  inCall: boolean,
  c: ReturnType<typeof useLocale>["t"]["call"],
): string | null {
  if (!inCall) return c.captionOffIdle;
  if (phase === "connecting") return c.captionOffConnecting;
  return null;
}

export function HmatCall({ screen }: { screen: CallScreen }) {
  const { t } = useLocale();
  const c = t.call;
  const reducedMotion = useReducedMotion() ?? false;
  const {
    phase,
    inCall,
    orbState,
    orbLoading,
    error,
    listening,
    supported,
    llmReady,
    ttsReady,
    providersLoaded,
  } = screen;
  const { stackClassName, triggerPop } = useReactPop();
  const wasInCallRef = useRef(false);

  useMoodReactions(triggerPop);

  useEffect(() => {
    if (inCall && !wasInCallRef.current) {
      tapMedium();
      triggerPop();
    }
    wasInCallRef.current = inCall;
  }, [inCall, triggerPop]);

  const needsKey = providersLoaded && !inCall && (!llmReady || !ttsReady);
  const missingVoice = !ttsReady;
  const statusTitle = needsKey ? c.titleUnlinked : callTitle(phase, c);
  const statusLabel = needsKey ? c.chipUnlinked : callChip(phase, listening, c);
  const emptyTitle = missingVoice ? c.missingElevenLabsTitle : c.missingOpenRouterTitle;
  const emptyBody = missingVoice ? c.missingElevenLabs : c.missingOpenRouter;
  const keyHref = missingVoice ? ROUTES.settingsAiVoice : ROUTES.settingsAiText;
  const keyCta = missingVoice ? c.addElevenLabsKey : t.chat.addOpenRouterKey;

  const hydrating = !screen.ready || !providersLoaded;
  const placeholder = captionPlaceholder(phase, inCall, c);

  return (
    <div className="hmat-call-layout flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3">
        <div className="relative">
          {inCall ? (
            <span
              className="absolute right-3 top-3 z-10 hmat-frost-action rounded-full px-3 py-1"
              aria-label={c.callDurationAria}
            >
              <span className={cn(TYPE.meta, "tabular-nums text-accent")}>
                {screen.durationLabel}
              </span>
            </span>
          ) : null}
          <HmatPresenceRecess
            className="hmat-orb-presence is-shown shrink-0"
            orbState={orbState}
            stackClassName={stackClassName}
            loading={orbLoading}
            onOrbTap={triggerPop}
            breathe
            attentive={listening && inCall}
          />
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <HmatScreenTitle>{statusTitle}</HmatScreenTitle>
          <HmatStatusChip label={statusLabel} muted={needsKey} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        {needsKey ? (
          <HmatNeedsKeyEmpty title={emptyTitle} body={emptyBody} icon="callUnlinked" />
        ) : (
          <div
            className="hmat-caption-stage flex min-h-0 w-full flex-1 flex-col justify-center"
            role="status"
            aria-live="polite"
          >
            <AnimatePresence mode="wait" initial={false}>
              {screen.caption ? (
                <motion.div
                  key={screen.caption}
                  className="flex min-h-0 max-h-full w-full flex-col justify-center"
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -10, filter: "blur(4px)" }
                  }
                  transition={{
                    duration: reducedMotion ? 0 : DISSOLVE_MS / 1000,
                    ease: DISSOLVE_EASE,
                  }}
                >
                  <CaptionTextReveal text={screen.caption} />
                </motion.div>
              ) : placeholder ? (
                <motion.p
                  key="caption-placeholder"
                  className={cn(CAPTION_TYPE, "font-normal text-center text-[#243D2C]/40")}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.18 }}
                >
                  {placeholder}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        )}

        {error ? (
          <p className={cn(TYPE.helper, "shrink-0 text-center text-accent")} role="alert">
            {error}
          </p>
        ) : null}

        {!supported && !inCall ? (
          <p className={cn(TYPE.helper, "shrink-0 text-center")}>
            {c.browserUnsupported}{" "}
            <a href={ROUTES.chat} className="text-accent underline">
              {t.nav.chat}
            </a>
            .
          </p>
        ) : null}

        {needsKey ? null : orbLoading ? (
          <CallThinkingGlyph
            className="shrink-0 py-0.5"
            label={phase === "connecting" ? c.titleConnecting : c.titleThinking}
          />
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-center pb-2 pt-1">
        {needsKey ? (
          <Link
            href={keyHref}
            onClick={() => tapLight()}
            className="hmat-ink-action flex h-[52px] w-full items-center justify-center rounded-2xl text-white"
          >
            <span className={cn(TYPE.bodySm, "font-display font-semibold")}>{keyCta}</span>
          </Link>
        ) : (
          <CallControlCluster
            inCall={inCall}
            disabled={!supported || hydrating}
            callLabel={c.callCta}
            endLabel={c.endCall}
            onStartCall={() => screen.startCall()}
            onEndCall={() => screen.endCall(false)}
          />
        )}
      </div>
    </div>
  );
}
