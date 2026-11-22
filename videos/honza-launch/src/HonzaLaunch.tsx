import {useLayoutEffect, type CSSProperties, type ReactNode} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

import {CREAM_CANVAS, HONZA_STATE_COLORS} from "@/components/honza/theme";
import {useMoodStore} from "@/stores/useMoodStore";

import {COPY, CORAL} from "./copy";
import {FilmCall} from "./FilmCall";
import {FilmChat} from "./FilmChat";
import {FilmGoogleDoc} from "./FilmGoogleDoc";
import {FilmHonzaIntro} from "./FilmHonzaIntro";
import {FilmLockPhone} from "./FilmLockPhone";
import {FilmLockup} from "./FilmLockup";
import {FilmPrague} from "./FilmPrague";
import {FilmProviders} from "./FilmProviders";
import {FilmRail} from "./FilmRail";
import {FilmSound} from "./FilmSound";
import {interFamily} from "./fonts";
import {moodAt} from "./mood-timeline";
import {CLAMP, EASE_MOVE, EASE_OUT, progress} from "./scene";
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
const LOCK_SCALE = 1.22;

function Layer({z, style, children}: {z: number; style?: CSSProperties; children: ReactNode}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: z,
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Phone({children, style}: {children: ReactNode; style?: CSSProperties}) {
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: STAGE_SHADOW,
        position: "relative",
        backgroundColor: CREAM_CANVAS,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function railFor(frame: number): readonly Cue[] | null {
  if (frame >= BEATS.lockup) return null;
  if (frame >= BEATS.closeIn) return RAILS.close;
  if (frame >= BEATS.notifyIn) return RAILS.notify;
  if (frame >= BEATS.callIn) return RAILS.call;
  if (frame >= BEATS.chatIn) return RAILS.chat;
  if (frame >= BEATS.docIn) return RAILS.notes;
  if (frame >= BEATS.introIn) return RAILS.intro;
  return RAILS.prague;
}

function TravelingKnedliky({frame}: {frame: number}) {
  if (frame < BEATS.chatMove || frame > BEATS.chatMove + 56) return null;
  const p = progress(frame, BEATS.chatMove, BEATS.chatMove + 52, EASE_MOVE);
  const x = interpolate(p, [0, 1], [228, 388], CLAMP);
  const y = interpolate(p, [0, 0.48, 1], [552, 292, 418], CLAMP);
  const opacity = interpolate(p, [0, 0.06, 0.78, 1], [0, 1, 1, 0], CLAMP);
  const scale = interpolate(p, [0, 0.45, 1], [1, 1.1, 0.68], CLAMP);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 30,
        opacity,
        scale,
        pointerEvents: "none",
        background: CORAL,
        color: "#FFFDFB",
        fontFamily: interFamily,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: "-0.02em",
        padding: "6px 14px",
        borderRadius: 8,
        boxShadow: "0 10px 24px rgba(232,67,45,0.28)",
      }}
    >
      knedlíky
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
  const wash = frame < BEATS.introIn ? CREAM_CANVAS : colors.background;

  const notesOpen = progress(frame, BEATS.notesMove, BEATS.notesMove + 28, EASE_OUT);
  const chatMove = progress(frame, BEATS.chatMove, BEATS.chatMove + 36, EASE_OUT);
  const callMove = progress(frame, BEATS.callMove, BEATS.callMove + 20, EASE_MOVE);
  const lockMove = progress(frame, BEATS.lockMove, BEATS.lockMove + 42, EASE_MOVE);
  const endMove = progress(frame, BEATS.lockup, BEATS.lockup + 48, EASE_OUT);

  // Hold the city through cityExit (300–342) so the fade finishes before the glyph.
  const showPrague = frame < BEATS.pragueExit + 44;
  const showIntro = frame >= BEATS.introIn && frame < BEATS.docIn;
  const showDoc = frame >= BEATS.notesMove && frame < BEATS.chatMove + 44;
  const showPhone = frame >= BEATS.chatMove && frame < BEATS.lockMove + 42;
  const showLock = frame >= BEATS.lockMove && frame < BEATS.lockup + 48;
  const showSplit = frame < BEATS.lockup + 48;
  const rail = railFor(frame);

  const docOpacity =
    interpolate(notesOpen, [0, 1], [0, 1], CLAMP) * interpolate(chatMove, [0, 0.42, 0.72], [1, 1, 0], CLAMP);
  const docScale = interpolate(notesOpen, [0, 1], [0.96, 1], CLAMP) * interpolate(chatMove, [0, 1], [1, 1.04], CLAMP);

  const phoneOpacity =
    interpolate(chatMove, [0.38, 0.72], [0, 1], CLAMP) * interpolate(lockMove, [0.58, 1], [1, 0], CLAMP);
  const phoneScale =
    interpolate(chatMove, [0.38, 1], [0.96, 1], CLAMP) *
    (1 + interpolate(callMove, [0, 0.4], [0, 0.025], CLAMP)) *
    interpolate(lockMove, [0, 1], [1, 0.72], CLAMP);
  const phoneY = interpolate(lockMove, [0, 1], [0, 18], CLAMP);

  const chatInner = interpolate(callMove, [0.5, 0.9], [1, 0], CLAMP);
  const callInner = interpolate(callMove, [0.32, 0.7], [0, 1], CLAMP);
  const chatGrow = interpolate(callMove, [0, 0.42], [1, 1.05], CLAMP);
  const callGrow = interpolate(callMove, [0.32, 1], [0.97, 1], CLAMP);

  const lockOpacity =
    interpolate(lockMove, [0.18, 0.52], [0, 1], CLAMP) * interpolate(endMove, [0, 0.66, 1], [1, 1, 0], CLAMP);
  const lockScale = LOCK_SCALE * interpolate(lockMove, [0, 1], [1.14, 1], CLAMP);

  const endReveal = frame < BEATS.lockup ? 0 : interpolate(endMove, [0.12, 1], [0, 1], CLAMP);

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

      {showSplit ? (
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 72,
          }}
        >
          <div style={{position: "relative", width: 820, height: 900, flex: "0 0 820px"}}>
            {showPrague ? (
              <Layer z={3}>
                <FilmPrague frame={frame} />
              </Layer>
            ) : null}

            {showIntro ? (
              <Layer z={5} style={{alignItems: "center", justifyContent: "center"}}>
                <FilmHonzaIntro frame={frame} mood={mood} />
              </Layer>
            ) : null}

            {showDoc ? (
              <Layer
                z={4}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: docOpacity,
                  scale: docScale,
                }}
              >
                <div style={{width: 600, height: 860, transformOrigin: "50% 40%"}}>
                  <FilmGoogleDoc frame={frame} />
                </div>
              </Layer>
            ) : null}

            {showPhone ? (
              <Layer z={6} style={{opacity: phoneOpacity, scale: phoneScale, translate: `0px ${phoneY}px`}}>
                <Phone>
                  {frame < BEATS.callMove + 22 ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: frame >= BEATS.callMove ? chatInner : 1,
                        scale: frame >= BEATS.callMove ? chatGrow : 1,
                      }}
                    >
                      <FilmChat frame={frame} mood={mood} draft={typedDraft(frame)} />
                    </div>
                  ) : null}
                  {frame >= BEATS.callMove ? (
                    <div style={{position: "absolute", inset: 0, opacity: callInner, scale: callGrow}}>
                      <FilmCall frame={frame} mood={mood} speakAt={BEATS.callSpeak} embedded />
                    </div>
                  ) : null}
                </Phone>
              </Layer>
            ) : null}

            {showLock ? (
              <Layer z={5} style={{opacity: lockOpacity, scale: lockScale}}>
                <FilmLockPhone frame={frame} appearAt={BEATS.bannerAt} />
              </Layer>
            ) : null}

            <TravelingKnedliky frame={frame} />
          </div>

          <div style={{width: 620, minHeight: 240, display: "flex", alignItems: "center"}}>
            {rail ? <FilmRail frame={frame} lines={rail} /> : null}
          </div>
        </div>
      ) : null}

      {frame >= BEATS.lockup && frame < DURATION_IN_FRAMES ? (
        <AbsoluteFill className="items-center justify-center" style={{pointerEvents: "none"}}>
          <FilmLockup frame={frame} mood={mood} reveal={endReveal} />
        </AbsoluteFill>
      ) : null}

    </AbsoluteFill>
  );
}

export const HonzaLaunch = () => {
  return (
    <FilmProviders>
      <FilmCanvas />
      <FilmSound />
    </FilmProviders>
  );
};
