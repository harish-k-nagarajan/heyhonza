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
    speakerOn,
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
    <div className="hmat-call-layout flex min-h-0 flex-1 flex-col gap-2">
      {inCall ? (
        <div className="flex shrink-0 justify-center">
          <span className="hmat-frost-action rounded-full px-4 py-1.5">
            <span className={cn(TYPE.meta, "tabular-nums text-accent")}>{screen.durationLabel}</span>
          </span>
        </div>
      ) : null}

      <HmatPresenceRecess
        orbState={orbState}
        stackClassName={stackClassName}
        loading={orbLoading}
        onOrbTap={triggerPop}
        compact
      />

      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <HmatScreenTitle>{statusTitle}</HmatScreenTitle>
        <HmatStatusChip label={statusLabel} muted={needsKey} />
      </div>

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
        <p className={cn(TYPE.helper, "text-center text-accent")} role="alert">
          {error}
        </p>
      ) : null}

      {!supported && !inCall ? (
        <p className={cn(TYPE.helper, "text-center")}>
          {c.browserUnsupported}{" "}
          <a href={ROUTES.chat} className="text-accent underline">
            {t.nav.chat}
          </a>
          .
        </p>
      ) : null}

      {needsKey ? null : orbLoading ? (
        <CallThinkingGlyph
          className="min-h-0 max-h-[72px]"
          label={phase === "connecting" ? c.titleConnecting : c.titleThinking}
        />
      ) : null}

      <div className="mt-auto flex shrink-0 flex-col items-center pb-1">
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
            speakerOn={speakerOn}
            callLabel={c.callCta}
            endLabel={c.endCall}
            speakerOnAria={c.speakerOnAria}
            speakerOffAria={c.speakerOffAria}
            onStartCall={() => screen.startCall()}
            onToggleSpeaker={() => screen.toggleSpeaker()}
            onEndCall={() => screen.endCall(false)}
          />
        )}
      </div>
    </div>
  );
}
