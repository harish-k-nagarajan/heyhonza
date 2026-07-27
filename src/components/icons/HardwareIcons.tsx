import { cn } from "@/lib/cn";

/**
 * The Honza hardware icon set (system kit, P4) — built once, used by every
 * design that wants it (both Hmat variants do; Classic keeps its own minimal
 * iconography, byte-for-byte). Ported from the locked round-4 reference.
 *
 * Design language: geometric, square-cap, heavier strokes, pixel construction
 * where it reads (Home carries a 2×2 dot-matrix window, Chat three square dots).
 * Every glyph inherits `currentColor` — so it takes the mood accent from its
 * container — and is embossed on the material (a white lower + faint dark upper
 * drop-shadow). Each is `aria-hidden`; always pair one with a real text label.
 *
 * Hovor (call) is a phone handset. The mic glyph is ONLY the in-call mute
 * control, never the nav destination.
 */

export type IconName =
  | "home"
  | "chat"
  | "call"
  | "settings"
  | "send"
  | "mic"
  | "hang"
  | "history";

type IconProps = {
  name: IconName;
  /** Pixel size (font-size of the 1em box). Default 22, dock uses ~21. */
  size?: number;
  className?: string;
  /** Emboss the glyph onto the material surface. On by default. */
  emboss?: boolean;
};

const EMBOSS =
  "drop-shadow(0 1px 0 rgba(255,255,255,0.92)) drop-shadow(0 -0.5px 0 rgba(0,0,0,0.06))";

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path
        d="M3.5 11 12 3.6 20.5 11v8.4a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1z"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinejoin="round"
      />
      <rect x="9.2" y="12.4" width="2.4" height="2.4" rx="0.5" fill="currentColor" />
      <rect x="12.4" y="12.4" width="2.4" height="2.4" rx="0.5" fill="currentColor" />
      <rect x="9.2" y="15.6" width="2.4" height="2.4" rx="0.5" fill="currentColor" />
      <rect x="12.4" y="15.6" width="2.4" height="2.4" rx="0.5" fill="currentColor" />
    </>
  ),
  chat: (
    <>
      <path
        d="M3.6 5h16.8v10.4H10.5l-5 3.8v-3.8H3.6z"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinejoin="round"
      />
      <rect x="7.4" y="9" width="2.1" height="2.1" rx="0.4" fill="currentColor" />
      <rect x="10.9" y="9" width="2.1" height="2.1" rx="0.4" fill="currentColor" />
      <rect x="14.4" y="9" width="2.1" height="2.1" rx="0.4" fill="currentColor" />
    </>
  ),
  call: (
    // Phone handset — the real Hovor glyph, not a mic.
    <path
      d="M7 3.2C5.4 3.2 3.6 4.8 3.6 6.6 3.6 13.6 10.4 20.4 17.4 20.4c1.8 0 3.4-1.8 3.4-3.4v-2.3c0-.8-.5-1.4-1.3-1.5l-2.7-.3c-.8-.1-1.5.2-1.9.9l-.5.9a13 13 0 0 1-4.3-4.3l.9-.5c.7-.4 1-1.1.9-1.9l-.3-2.7C11 3.7 10.4 3.2 9.6 3.2z"
      fill="currentColor"
    />
  ),
  settings: (
    // Machined sliders with square knobs. `--bg` fills the knob so the rail
    // reads through it; falls back to white where --bg is unset.
    <>
      <path
        d="M4 8h16M4 16h16"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
      />
      <rect
        x="7.4"
        y="5.4"
        width="5.2"
        height="5.2"
        rx="1.5"
        fill="var(--bg,#fff)"
        stroke="currentColor"
        strokeWidth={2.1}
      />
      <rect
        x="11.4"
        y="13.4"
        width="5.2"
        height="5.2"
        rx="1.5"
        fill="var(--bg,#fff)"
        stroke="currentColor"
        strokeWidth={2.1}
      />
    </>
  ),
  send: (
    <path
      d="M4 12h13M11 5.5 17.5 12 11 18.5"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  mic: (
    // In-call mute control only.
    <>
      <rect x="9" y="3" width="6" height="10" rx="3" stroke="currentColor" strokeWidth={2.1} />
      <path
        d="M5.8 11a6.2 6.2 0 0 0 12.4 0M12 17.2V20.5"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
      />
    </>
  ),
  hang: (
    <path
      d="M3.5 13.6c4.7-4.2 12.3-4.2 17 0l1.5-2.4C17 5.6 7 5.6 2 11.2z"
      fill="currentColor"
    />
  ),
  history: (
    <>
      <path
        d="M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z"
        stroke="currentColor"
        strokeWidth={2.1}
      />
      <path
        d="M12 8v4.2l2.8 1.6"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 4.5 5 7l2.5 2"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
};

export function HardwareIcon({ name, size = 22, className, emboss = true }: IconProps) {
  return (
    <span
      className={cn("inline-flex", className)}
      style={{
        width: "1em",
        height: "1em",
        fontSize: size,
        filter: emboss ? EMBOSS : undefined,
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        {PATHS[name]}
      </svg>
    </span>
  );
}
