import type {HonzaOrbState} from "@/components/honza/theme";
import {
  HmatPresenceRecess,
  HmatScreenTitle,
  HmatStatusChip,
} from "@/components/screens/hmat/HmatUi";
import {CREAM_CANVAS} from "@/components/honza/theme";
import {TYPE} from "@/lib/design/typography";
import {cn} from "@/lib/cn";
import {HardwareIcon} from "@/components/icons/HardwareIcons";
import {interpolate} from "remotion";

import {COPY} from "./copy";
import {interFamily} from "./fonts";
import {CLAMP} from "./scene";
import {FPS, PHONE_H, PHONE_W} from "./timing";

function HangIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3a9 9 0 0 0-9 9v3l2-2v-1a7 7 0 0 1 14 0v1l2 2v-3a9 9 0 0 0-9-9zm-5 11 2.3 2.3a3 3 0 0 0 4.2 0L16 14l-1.4-1.4-2.3 2.3a1 1 0 0 1-1.4 0L8.6 12.6 7.2 14z" />
    </svg>
  );
}

/** Live call surface — the same recess, title, chip, and end control as `/call`. */
export function FilmCall({
  frame,
  mood,
  speakAt,
  embedded = false,
}: {
  frame: number;
  mood: HonzaOrbState;
  speakAt: number;
  /** Inside the shared phone shell, so the shell owns the radius and shadow. */
  embedded?: boolean;
}) {
  const hearing = frame < speakAt;
  const seconds = 4 + Math.max(0, Math.floor((frame - speakAt) / FPS));
  const clock = `0:${String(Math.min(seconds, 59)).padStart(2, "0")}`;
  const words = COPY.callCaption.split(" ");
  const shown = Math.max(0, Math.min(words.length, Math.floor((frame - speakAt) / 4) + (frame >= speakAt ? 1 : 0)));
  const caption = words.slice(0, shown).join(" ");
  const micLive = interpolate(frame % 18, [0, 9, 18], [1, 1.06, 1], CLAMP);

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        width: PHONE_W,
        height: PHONE_H,
        backgroundColor: CREAM_CANVAS,
        borderRadius: embedded ? 0 : 28,
        boxShadow: embedded ? "none" : "0 28px 60px rgba(36, 61, 44, 0.12), inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <div className="mat-bg" aria-hidden />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-5 pb-5 pt-5">
        <div className="relative flex shrink-0 flex-col gap-3">
          <span
            className="absolute right-1 top-1 z-10 hmat-frost-action rounded-full px-3 py-1"
            aria-hidden
          >
            <span className={cn(TYPE.meta, "tabular-nums text-accent")}>{clock}</span>
          </span>
          <HmatPresenceRecess orbState={mood} size={112} breathe={false} attentive={hearing} />
          <div className="flex flex-col items-center gap-1.5">
            <HmatScreenTitle>{hearing ? COPY.callTitleListening : COPY.callTitle}</HmatScreenTitle>
            <HmatStatusChip
              label={hearing ? COPY.callChipListening : COPY.callChip}
              sizerLabel={hearing ? COPY.callChipListening : COPY.callChip}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-2">
          <p
            className="text-center text-[22px] leading-relaxed"
            style={{fontFamily: interFamily, color: "#243D2C", fontWeight: 500}}
          >
            {caption}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-5 pb-2 pt-1">
          <span
            aria-hidden
            className="flex items-center justify-center rounded-full text-white"
            style={{
              width: 60,
              height: 60,
              background: "#3f6b4a",
              border: "1px solid rgba(255,255,255,0.25)",
              scale: hearing ? micLive : 1,
              boxShadow: hearing
                ? "0 0 0 8px rgba(63,107,74,0.18)"
                : "0 0 0 0 rgba(63,107,74,0)",
            }}
          >
            <HardwareIcon name="mic" size={24} emboss={false} />
          </span>
          <button
            type="button"
            aria-label={COPY.callEnd}
            className="hmat-call-end hmat-call-btn flex items-center justify-center rounded-full text-white"
          >
            <HangIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
