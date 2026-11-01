import type {HonzaOrbState} from "@/components/honza/theme";
import {HmatPresenceRecess} from "@/components/screens/hmat/HmatUi";

import {interFamily} from "./fonts";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

/** The level control, short. A2 is the one that is on. */
export function FilmLevel({mood}: {mood: HonzaOrbState}) {
  return (
    <div
      className="film-level"
      style={{
        width: 420,
        background: "#fffdfb",
        borderRadius: 28,
        border: "1px solid #E8E2DC",
        padding: "18px 18px 20px",
        boxShadow: "0 28px 60px rgba(36, 61, 44, 0.12), inset 0 0 0 1px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <HmatPresenceRecess orbState={mood} size={112} breathe={false} />
      <div style={{display: "flex", flexDirection: "column", gap: 8, width: "100%"}}>
        {LEVELS.map((id) => {
          const on = id === "A2";
          return (
            <div
              key={id}
              style={{
                borderRadius: 16,
                border: on ? "1px solid var(--accent)" : "1px solid #E8E2DC",
                background: on ? "#FFF4EE" : "#F5F2EE",
                padding: "14px 16px",
                fontFamily: interFamily,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: on ? "var(--accent)" : "#243D2C",
              }}
            >
              {id}
            </div>
          );
        })}
      </div>
    </div>
  );
}
