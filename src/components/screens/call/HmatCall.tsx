"use client";

import { useEffect, useRef } from "react";

import { CaptionTextReveal } from "@/components/call/CaptionTextReveal";
import { CallControlCluster } from "@/components/screens/call/CallControlCluster";
import { ROUTES } from "@/lib/constants";
import {
  HmatCaptionPanel,
  HmatPresenceRecess,
  HmatScreenTitle,
  HmatStatusChip,
} from "@/components/screens/hmat/HmatUi";
import { HmatScreenLoading } from "@/components/screens/hmat/HmatChrome";
import type { CallScreen } from "@/hooks/useCallScreen";
import { useMoodReactions } from "@/hooks/useMoodReactions";
import { useReactPop } from "@/hooks/useReactPop";
import { callChip, callTitle } from "@/lib/i18n/extended";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { tapMedium } from "@/lib/interaction/haptic";

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

  if (!screen.ready) return <HmatScreenLoading />;

  const showLiveCaption = inCall && caption;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
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
      />

      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <HmatScreenTitle>{callTitle(phase, c)}</HmatScreenTitle>
        <HmatStatusChip label={callChip(phase, listening, c)} />
      </div>

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

      <div className="flex-1" />

      <div className="flex shrink-0 flex-col items-center pb-1">
        <CallControlCluster
          inCall={inCall}
          disabled={!supported}
          speakerOn={speakerOn}
          callLabel={c.callCta}
          endLabel={c.endCall}
          speakerOnAria={c.speakerOnAria}
          speakerOffAria={c.speakerOffAria}
          onStartCall={() => screen.startCall()}
          onToggleSpeaker={() => screen.toggleSpeaker()}
          onEndCall={() => screen.endCall(false)}
        />
      </div>
    </div>
  );
}
