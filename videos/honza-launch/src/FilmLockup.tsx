import type {HonzaOrbState} from "@/components/honza/theme";
import {HmatPresenceRecess} from "@/components/screens/hmat/HmatUi";

import {COPY, CTA_LINE, END_LINE, INK} from "./copy";
import {dotoFamily, interFamily} from "./fonts";
import {rise} from "./scene";
import {BEATS} from "./timing";
import {Sentence} from "./words";

export function FilmLockup({
  frame,
  mood,
  reveal = 1,
}: {
  frame: number;
  mood: HonzaOrbState;
  reveal?: number;
}) {
  const cta = rise(frame, BEATS.endCta, 10, 8);
  const url = rise(frame, BEATS.endCta, 10, 8);

  return (
    <div className="flex flex-col items-center" style={{width: 860, opacity: reveal}}>
      <div className="relative w-full max-w-[520px]">
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            width: 240,
            height: 240,
            marginLeft: -120,
            marginTop: -120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,67,45,0.28), rgba(232,67,45,0) 68%)",
            opacity: reveal,
            pointerEvents: "none",
          }}
        />
        <HmatPresenceRecess orbState={mood} variant="display" size={148} breathe={false} />
      </div>

      <div className="mt-8 w-full">
        <Sentence text={END_LINE} frame={frame} at={BEATS.lockup + 16} size={40} align="center" />
      </div>

      <div className="mt-8 flex w-full flex-col items-center">
        <div style={cta}>
          <span
            className="auth-cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              padding: "14px 28px",
              fontFamily: interFamily,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.011em",
              lineHeight: 1,
            }}
          >
            {CTA_LINE}
          </span>
        </div>
        <p
          style={{
            ...url,
            marginTop: 16,
            fontFamily: dotoFamily,
            fontSize: 22,
            letterSpacing: "0.14em",
            color: INK,
          }}
        >
          {COPY.url}
        </p>
      </div>
    </div>
  );
}
