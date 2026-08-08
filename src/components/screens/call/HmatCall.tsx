"use client";

import { useEffect, useRef } from "react";

import { ROUTES } from "@/lib/constants";
import {
  HmatCallButton,
  HmatCallControls,
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

function captionKicker(phase: CallScreen["phase"], inCall: boolean, c: ReturnType<typeof useLocale>["t"]["call"]): string {
  if (!inCall) return c.captionKicker;
  if (phase === "connecting") return c.captionStatus;
  return c.captionKicker;
}

function captionFallback(
  phase: CallScreen["phase"],
  inCall: boolean,
  captionsVisible: boolean,
  c: ReturnType<typeof useLocale>["t"]["call"],
): string {
  if (!inCall) return c.captionOffIdle;
  if (phase === "connecting") return c.captionOffConnecting;
  if (!captionsVisible) return c.captionOffInCall;
  return "…";
}

export function HmatCall({ screen }: { screen: CallScreen }) {
  const { t } = useLocale();
  const c = t.call;
  const {
    phase,
    inCall,
    orbState,
    caption,
    captionWho,
    error,
    listening,
    supported,
    captionsVisible,
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

  const showLiveCaption = inCall && captionsVisible && caption;
  const captionText = showLiveCaption
    ? caption
    : captionFallback(phase, inCall, captionsVisible, c);

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
        loading={phase === "connecting" || phase === "thinking"}
        onOrbTap={triggerPop}
      />

      <div className="flex shrink-0 flex-col items-center gap-2">
        <HmatScreenTitle>{callTitle(phase, c)}</HmatScreenTitle>
        <HmatStatusChip label={callChip(phase, listening, c)} />
      </div>

      <HmatCaptionPanel kicker={captionKicker(phase, inCall, c)} muted={!showLiveCaption}>
        {showLiveCaption ? (
          <>
            <span className={cn(TYPE.kicker, "mb-1 block text-[#6E8A74]")}>
              {captionWho === "honza" ? t.common.honza : t.common.you}
            </span>
            {captionText}
          </>
        ) : (
          captionText
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
        {!inCall ? (
          <HmatCallButton
            label={c.callCta}
            disabled={!supported}
            onClick={() => screen.startCall()}
          />
        ) : (
          <HmatCallControls
            captionsOn={captionsVisible}
            onToggleCaptions={() => screen.toggleCaptions()}
            onEndCall={() => screen.endCall(true)}
            endLabel={c.endCall}
            showCaptionsLabel={c.showCaptions}
            hideCaptionsLabel={c.hideCaptions}
          />
        )}
      </div>
    </div>
  );
}
