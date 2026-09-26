"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { CaptionTextReveal } from "@/components/call/CaptionTextReveal";
import { CallThinkingGlyph } from "@/components/call/CallThinkingGlyph";
import { CallControlCluster } from "@/components/screens/call/CallControlCluster";
import { ROUTES } from "@/lib/constants";
import {
  HmatCaptionPanel,
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

function captionPlaceholder(
  phase: CallScreen["phase"],
  inCall: boolean,
  c: ReturnType<typeof useLocale>["t"]["call"],
): string {
  if (!inCall) return c.captionOffIdle;
  if (phase === "connecting") return c.captionOffConnecting;
  return "…";
}

export function HmatCall({ screen }: { screen: CallScreen }) {
  const { t } = useLocale();
  const c = t.call;
  const {
    phase,
    inCall,
    orbState,
    orbLoading,
    caption,
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

  const showLiveCaption = inCall && caption;
  const needsKey = providersLoaded && !inCall && (!llmReady || !ttsReady);
  const missingVoice = !ttsReady;
  const statusTitle = needsKey ? c.titleUnlinked : callTitle(phase, c);
  const statusLabel = needsKey ? c.chipUnlinked : callChip(phase, listening, c);
  const emptyTitle = missingVoice ? c.missingElevenLabsTitle : c.missingOpenRouterTitle;
  const emptyBody = missingVoice ? c.missingElevenLabs : c.missingOpenRouter;
  const keyHref = missingVoice ? ROUTES.settingsAiVoice : ROUTES.settingsAiText;
  const keyCta = missingVoice ? c.addElevenLabsKey : t.chat.addOpenRouterKey;

  const hydrating = !screen.ready || !providersLoaded;

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
          <HmatCaptionPanel
            kicker={c.captionKicker}
            muted={!showLiveCaption}
            live={Boolean(showLiveCaption)}
          >
            {showLiveCaption ? (
              <CaptionTextReveal key={caption} className="absolute inset-0" text={caption!} />
            ) : (
              captionPlaceholder(phase, inCall, c)
            )}
          </HmatCaptionPanel>
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
