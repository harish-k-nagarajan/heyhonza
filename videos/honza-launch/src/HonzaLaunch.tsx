import {useLayoutEffect, type ReactNode} from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

import {CREAM_CANVAS, HONZA_STATE_COLORS} from "@/components/honza/theme";
import {useMoodStore} from "@/stores/useMoodStore";

import {COPY} from "./copy";
import {FilmCall} from "./FilmCall";
import {FilmChat} from "./FilmChat";
import {FilmGoogleDoc} from "./FilmGoogleDoc";
import {FilmLevel} from "./FilmLevel";
import {FilmLockup} from "./FilmLockup";
import {FilmPrague} from "./FilmPrague";
import {FilmProviders} from "./FilmProviders";
import {FilmRail} from "./FilmRail";
import {moodAt} from "./mood-timeline";
import {inWindow, sceneMotion} from "./scene";
import {BEATS, DURATION_IN_FRAMES, PHONE_H, PHONE_W, RAILS, type Cue} from "./timing";

function MoodSync({mood}: {mood: ReturnType<typeof moodAt>}) {
  const setMood = useMoodStore((s) => s.setMood);
  useLayoutEffect(() => {
    setMood(mood);
  }, [mood, setMood]);
  return null;
}

function typedDraft(frame: number) {
  if (frame < BEATS.typeStart || frame >= BEATS.send) return "";
  const span = BEATS.send - BEATS.typeStart - 6;
  const t = Math.max(0, frame - BEATS.typeStart);
  const n = Math.min(COPY.userSlip.length, Math.floor((t / span) * COPY.userSlip.length));
  return COPY.userSlip.slice(0, n);
}

const STAGE_SHADOW = "0 28px 60px rgba(36, 61, 44, 0.12), inset 0 0 0 1px rgba(0,0,0,0.05)";

function SplitScene({
  frame,
  enter,
  leave,
  flip,
  visual,
  lines,
}: {
  frame: number;
  enter: number;
  leave: number;
  flip: boolean;
  visual: ReactNode;
  lines: readonly Cue[];
}) {
  if (!inWindow(frame, enter, leave)) return null;
  return (
    <AbsoluteFill style={{...sceneMotion(frame, enter, leave), pointerEvents: "none"}}>
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          padding: "0 72px",
          gap: 64,
          flexDirection: flip ? "row-reverse" : "row",
        }}
      >
        <div style={{flex: "0 0 auto"}}>{visual}</div>
        <div style={{width: 640, minHeight: 280, display: "flex", alignItems: "center"}}>
          <FilmRail frame={frame} lines={lines} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Phone({children}: {children: ReactNode}) {
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: STAGE_SHADOW,
      }}
    >
      {children}
    </div>
  );
}

function FilmCanvas() {
  const frame = useCurrentFrame();
  const mood = moodAt(frame);
  const colors = HONZA_STATE_COLORS[mood];

  const speaking = mood === "speaking" && frame < BEATS.lockup;
  const talkCycle = ["open", "mid"] as const;
  const talk = frame >= BEATS.lockup ? "open" : speaking ? talkCycle[Math.floor(frame / 10) % talkCycle.length] : "rest";
  const blink = frame % 100 >= 94;
  const wash = frame < BEATS.docIn ? CREAM_CANVAS : colors.background;

  return (
    <AbsoluteFill
      className="film-root font-sans overflow-hidden"
      data-design="hmat-metal"
      data-mood={mood}
      data-talk={talk}
      data-blink={blink ? "1" : "0"}
      style={{
        backgroundColor: CREAM_CANVAS,
        backgroundImage: `linear-gradient(180deg, ${wash} 0%, ${CREAM_CANVAS} 78%)`,
        ["--accent" as string]: colors.accent,
        ["--background" as string]: CREAM_CANVAS,
      }}
    >
      <MoodSync mood={mood} />

      <SplitScene
        frame={frame}
        enter={0}
        leave={BEATS.docIn}
        flip={false}
        lines={RAILS.prague}
        visual={<FilmPrague frame={frame} leave={BEATS.docIn} />}
      />

      <SplitScene
        frame={frame}
        enter={BEATS.docIn}
        leave={BEATS.chatIn}
        flip={false}
        lines={RAILS.notes}
        visual={
          <div style={{width: 560, height: 820}}>
            <FilmGoogleDoc frame={frame} />
          </div>
        }
      />

      <SplitScene
        frame={frame}
        enter={BEATS.chatIn}
        leave={BEATS.callIn}
        flip
        lines={RAILS.chat}
        visual={
          <Phone>
            <FilmChat frame={frame} mood={mood} draft={typedDraft(frame)} />
          </Phone>
        }
      />

      <SplitScene
        frame={frame}
        enter={BEATS.callIn}
        leave={BEATS.startsIn}
        flip={false}
        lines={RAILS.call}
        visual={<FilmCall frame={frame} mood={mood} speakAt={BEATS.callSpeak} />}
      />

      <SplitScene
        frame={frame}
        enter={BEATS.startsIn}
        leave={BEATS.levelIn}
        flip
        lines={RAILS.starts}
        visual={
          <Phone>
            <FilmChat
              frame={frame}
              mood={mood}
              draft=""
              openerOnly
              appearAt={BEATS.startsIn}
            />
          </Phone>
        }
      />

      <SplitScene
        frame={frame}
        enter={BEATS.levelIn}
        leave={BEATS.lockup}
        flip={false}
        lines={RAILS.level}
        visual={<FilmLevel mood={mood} />}
      />

      {inWindow(frame, BEATS.lockup, DURATION_IN_FRAMES + 30) ? (
        <AbsoluteFill
          className="items-center justify-center"
          style={{...sceneMotion(frame, BEATS.lockup, DURATION_IN_FRAMES + 30), pointerEvents: "none"}}
        >
          <FilmLockup frame={frame} mood={mood} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

export const HonzaLaunch = () => {
  return (
    <FilmProviders>
      <FilmCanvas />
    </FilmProviders>
  );
};
