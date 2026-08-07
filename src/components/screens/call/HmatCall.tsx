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
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { tapMedium } from "@/lib/interaction/haptic";

function callTitle(phase: CallScreen["phase"]): string {
  switch (phase) {
    case "ready":
      return "Hovor s Honzou";
    case "connecting":
      return "Spojuji hovor…";
    case "speaking":
      return "Honza mluví…";
    case "listening":
      return "Poslouchám…";
    case "thinking":
      return "Honza přemýšlí…";
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

function callChip(phase: CallScreen["phase"], listening: boolean): string {
  switch (phase) {
    case "ready":
      return "připraven";
    case "connecting":
      return "vyzvání";
    case "speaking":
      return "mluví";
    case "listening":
      return listening ? "poslouchá" : "čeká na tebe";
    case "thinking":
      return "přemýšlí";
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

function captionKicker(phase: CallScreen["phase"], inCall: boolean): string {
  if (!inCall) return "TITULKY";
  if (phase === "connecting") return "STAV";
  return "TITULKY";
}

function captionFallback(
  phase: CallScreen["phase"],
  inCall: boolean,
  captionsVisible: boolean,
): string {
  if (!inCall) {
    return "Titulky vypnuté · zvol reproduktor, až budeš chtít číst.";
  }
  if (phase === "connecting") {
    return "Volá se… Titulky se objeví v reproduktoru.";
  }
  if (!captionsVisible) {
    return "Titulky vypnuté · klepni na reproduktor.";
  }
  return "…";
}

export function HmatCall({ screen }: { screen: CallScreen }) {
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
    : captionFallback(phase, inCall, captionsVisible);

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
        <HmatScreenTitle>{callTitle(phase)}</HmatScreenTitle>
        <HmatStatusChip label={callChip(phase, listening)} />
      </div>

      <HmatCaptionPanel
        kicker={captionKicker(phase, inCall)}
        muted={!showLiveCaption}
      >
        {showLiveCaption ? (
          <>
            <span className={cn(TYPE.kicker, "mb-1 block text-[#6E8A74]")}>
              {captionWho === "honza" ? "Honza" : "Ty"}
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
          Rozpoznávání řeči potřebuje Chrome, Edge nebo Safari. Jinde použij{" "}
          <a href={ROUTES.chat} className="text-accent underline">
            Chat
          </a>
          .
        </p>
      ) : null}

      <div className="flex-1" />

      <div className="flex shrink-0 flex-col items-center pb-1">
        {!inCall ? (
          <HmatCallButton
            label="Zavolat"
            disabled={!supported}
            onClick={() => screen.startCall()}
          />
        ) : (
          <HmatCallControls
            captionsOn={captionsVisible}
            onToggleCaptions={() => screen.toggleCaptions()}
            onEndCall={() => screen.endCall(true)}
          />
        )}
      </div>
    </div>
  );
}
