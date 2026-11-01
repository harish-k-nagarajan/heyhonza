import type {HonzaOrbState} from "@/components/honza/theme";
import {HmatPresenceRecess} from "@/components/screens/hmat/HmatUi";

import {COPY, END_LINE, FREE_LINE, INK} from "./copy";
import {dotoFamily, interFamily} from "./fonts";
import {rise} from "./scene";
import {BEATS} from "./timing";
import {Sentence} from "./words";

export function FilmLockup({frame, mood}: {frame: number; mood: HonzaOrbState}) {
  const cta = rise(frame, BEATS.endCta, 10, 8);
  const url = rise(frame, BEATS.endCta, 10, 8);

  return (
    <div className="flex flex-col items-center" style={{width: 860}}>
      <div className="relative w-full max-w-[520px]">
        <HmatPresenceRecess orbState={mood} variant="display" size={148} breathe={false} />
      </div>

      <div className="mt-8 w-full">
        <Sentence text={END_LINE} frame={frame} at={BEATS.lockup + 4} size={40} align="center" />
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
            {COPY.tryNow}
          </span>
        </div>
        <div className="mt-4 w-full">
          <Sentence text={FREE_LINE} frame={frame} at={BEATS.endCta} size={32} align="center" />
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
