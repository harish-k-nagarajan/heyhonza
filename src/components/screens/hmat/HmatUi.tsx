"use client";

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { RecessCardLight } from "@/components/honza/RecessCardLight";
import { RecessReverb, recessMotion } from "@/components/honza/RecessReverb";
import type { HonzaOrbState } from "@/components/honza/theme";
import { HardwareIcon, type IconName } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { tapLight } from "@/lib/interaction/haptic";

function recessHeroModifier(mood: HonzaOrbState): string {
  switch (mood) {
    case "idle":
      return "hmat-recess-hero--idle";
    case "thinking":
      return "hmat-recess-hero--thinking";
    case "speaking":
      return "hmat-recess-hero--speaking";
    case "oops":
      return "hmat-recess-hero--oops";
    case "excited":
      return "hmat-recess-hero--excited";
    default: {
      const _exhaustive: never = mood;
      return _exhaustive;
    }
  }
}

/** Recess mood label shown under the lit channel. */
export function recessMoodLabel(
  mood: HonzaOrbState,
  loading: boolean | undefined,
  t: ReturnType<typeof useLocale>["t"],
): string {
  if (loading || mood === "thinking") return t.mood.recessThinking;
  return t.mood.recess[mood];
}

export function HmatPresenceRecess({
  orbState,
  /** Face size inside liquid-glass slab (120 face; rim ~22 around it). */
  size = 120,
  stackClassName,
  loading,
  channelPulse,
  onOrbTap,
  className,
  breathe = true,
  /** `display` = compact rectangular recess + orb for the landing hero. */
  variant = "presence",
}: {
  orbState: HonzaOrbState;
  size?: number;
  stackClassName?: string;
  loading?: boolean;
  channelPulse?: boolean;
  onOrbTap?: () => void;
  className?: string;
  breathe?: boolean;
  variant?: "presence" | "display";
}) {
  const { t } = useLocale();
  const moodLabel = recessMoodLabel(orbState, loading, t);
  const prevOrbState = useRef(orbState);
  const [speakFlash, setSpeakFlash] = useState(false);

  useLayoutEffect(() => {
    if (orbState === "speaking" && prevOrbState.current !== "speaking") {
      setSpeakFlash(true);
      // Match --duration-presence-beat (680ms) + wave delay (120ms) + settle.
      const timer = window.setTimeout(() => setSpeakFlash(false), 820);
      prevOrbState.current = orbState;
      return () => window.clearTimeout(timer);
    }
    prevOrbState.current = orbState;
  }, [orbState]);

  const reverbMotion = recessMotion(
    orbState,
    loading,
    speakFlash,
    stackClassName === "react-pop",
  );
  const bezelActive = loading || orbState === "thinking";
  const recessMood: HonzaOrbState = loading || orbState === "thinking" ? "thinking" : orbState;
  const isDisplay = variant === "display";
  const orb = (
    <HmatOrb state={orbState} size={size} breathe={breathe} stackClassName={stackClassName} />
  );

  return (
    <div
      className={cn(
        "hmat-recess-hero",
        recessHeroModifier(recessMood),
        isDisplay && "hmat-recess-hero--display",
        className,
      )}
    >
      {isDisplay ? null : (
        <RecessCardLight mood={recessMood} speakFlash={speakFlash} />
      )}
      <div className="hmat-display-module hmat-presence-shared">
        {isDisplay ? null : <RecessReverb motion={reverbMotion} />}
        <div
          className={cn(
            "hmat-display-bezel",
            bezelActive && "hmat-display-bezel--active",
            speakFlash && "hmat-display-bezel--speak",
            stackClassName === "react-pop" && "hmat-display-bezel--burst",
          )}
        >
          {isDisplay ? (
            <div className="hmat-display-screen relative rounded-[18px]">{orb}</div>
          ) : (
            <button
              type="button"
              onClick={() => {
                tapLight();
                onOrbTap?.();
              }}
              className="hmat-display-screen relative rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={t.common.honza}
            >
              {orb}
            </button>
          )}
        </div>
      </div>
      {isDisplay ? null : (
        <>
          <div
            className={cn(
              "mat-channel w-[200px] motion-reduce:animate-none",
              channelPulse && "motion-safe:animate-channel-pulse",
            )}
            aria-hidden
          />
          {/* honza.pen Bir3A mood label: Doto 13 / 700 / letterSpacing 2 */}
          <p className="font-display text-[13px] font-bold tracking-[2px] text-accent">
            {moodLabel}
          </p>
        </>
      )}
    </div>
  );
}

function cssMs(name: string, fallback: number): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
}

const THINK_TEXT_CLASS = "font-display text-[11px] font-bold leading-none tracking-wide";

export function HmatStatusChip({
  label,
  sizerLabel,
  shimmer,
  muted,
}: {
  label: string;
  sizerLabel?: string;
  shimmer?: boolean;
  muted?: boolean;
}) {
  const [layers, setLayers] = useState([{ id: 0, text: label, phase: "live" as "in" | "live" | "out" }]);
  const liveText = useRef(label);
  const nextId = useRef(0);
  const boxRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (label === liveText.current) return;
    liveText.current = label;
    nextId.current += 1;
    const incomingId = nextId.current;
    setLayers((cur) => {
      const live = cur.find((l) => l.phase === "live" || l.phase === "in");
      const outgoing = live ? [{ ...live, phase: "out" as const }] : [];
      return [...outgoing, { id: incomingId, text: label, phase: "in" as const }];
    });
    const gap = cssMs("--think-gap", 50);
    const swap = cssMs("--think-swap", 150);
    const release = window.setTimeout(() => {
      setLayers((cur) =>
        cur.map((l) => (l.id === incomingId ? { ...l, phase: "live" as const } : l)),
      );
    }, gap);
    const cleanup = window.setTimeout(() => {
      setLayers((cur) => cur.filter((l) => l.id === incomingId));
    }, swap + gap);
    return () => {
      window.clearTimeout(release);
      window.clearTimeout(cleanup);
    };
  }, [label]);

  useLayoutEffect(() => {
    const el = boxRef.current?.querySelector(".is-enter-start");
    if (el instanceof HTMLElement) void el.offsetWidth;
  }, [layers]);

  return (
    <span
      className={cn(
        "hmat-chip inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1",
        muted && "hmat-chip--muted",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-[2px]", muted ? "bg-[#6E8A74]" : "bg-accent")}
        aria-hidden
      />
      <span
        ref={boxRef}
        className={cn("t-think", shimmer && "is-shimmering")}
        role="status"
      >
        <span className={cn("t-think-sizer", THINK_TEXT_CLASS)} aria-hidden>
          {sizerLabel ?? label}
        </span>
        {layers.map((layer) => (
          <span
            key={layer.id}
            className={cn(
              "t-think-text",
              THINK_TEXT_CLASS,
              layer.phase === "out" && "is-exit",
              layer.phase === "in" && "is-enter-start",
            )}
            data-text={layer.text}
          >
            {layer.text}
          </span>
        ))}
      </span>
    </span>
  );
}

export function HmatNeedsKeyEmpty({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: IconName;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "t-stagger flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6",
        shown && "is-shown",
      )}
    >
      <div className="t-stagger-line t-stagger-line--1">
        <div
          className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-[#6E8A74]"
          style={{ background: "color-mix(in srgb, #6E8A74 12%, #fff)" }}
        >
          <HardwareIcon name={icon} size={32} emboss={false} />
        </div>
      </div>
      <div className="flex max-w-[28ch] flex-col items-center gap-1.5 text-center">
        <p className={cn("t-stagger-line t-stagger-line--2", TYPE.heading, "text-[#243D2C]")}>
          {title}
        </p>
        <p className={cn("t-stagger-line t-stagger-line--3", TYPE.bodySm, "text-[#6E8A74]")}>
          {body}
        </p>
      </div>
    </div>
  );
}

export function HmatScreenTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-center font-display text-[20px] font-bold leading-tight text-[#243D2C]">
      {children}
    </h1>
  );
}

export function HmatHonzaBubble({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) {
  const delay = Math.min(index, 3) * 40;

  return (
    <div
      className="message-enter message-enter--presence max-w-[88%] self-start"
      style={delay > 0 ? { transitionDelay: `${delay}ms, ${delay}ms` } : undefined}
    >
      <div className="hmat-bubble-honza px-4 py-3.5">
        <p className={cn(TYPE.bodySm, "text-[#243D2C]")}>{children}</p>
      </div>
    </div>
  );
}

export function HmatUserBubble({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) {
  const delay = Math.min(index, 3) * 50;

  return (
    <div
      className="message-enter max-w-[88%] self-end"
      style={delay > 0 ? { transitionDelay: `${delay}ms, 0ms` } : undefined}
    >
      <div className="hmat-bubble-user px-4 py-3.5">
        <p className={cn(TYPE.bodySm, "text-white")}>{children}</p>
      </div>
    </div>
  );
}

export function HmatOpenerCard({ children }: { children: ReactNode }) {
  return (
    <div className="hmat-opener-card rounded-2xl p-3.5">
      <p className={cn(TYPE.bodySm, "text-[#243D2C]")}>{children}</p>
    </div>
  );
}

/** Scroll region with a frosted top edge when content scrolls under. */
export const HmatFrostedScroll = forwardRef<
  HTMLDivElement,
  { children: ReactNode; watchKey?: string | number; className?: string }
>(function HmatFrostedScroll({ children, watchKey, className }, forwardedRef) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [fadeTop, setFadeTop] = useState(false);

  const setScrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      if (!forwardedRef) return;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else forwardedRef.current = el;
    },
    [forwardedRef],
  );

  const syncFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const canScroll = el.scrollHeight > el.clientHeight + 1;
    setFadeTop(canScroll && el.scrollTop > 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncFades();
    el.addEventListener("scroll", syncFades, { passive: true });
    const ro = new ResizeObserver(syncFades);
    ro.observe(el);
    for (const child of el.children) {
      ro.observe(child);
    }
    return () => {
      el.removeEventListener("scroll", syncFades);
      ro.disconnect();
    };
  }, [syncFades, watchKey]);

  return (
    <div className="hmat-chat-thread relative min-h-0 w-full flex-1 overflow-hidden">
      <div
        ref={setScrollRef}
        className={cn("hmat-chat-thread-scroll", className)}
      >
        {children}
      </div>
      <div
        className={cn("hmat-chat-thread-fade hmat-chat-thread-fade-top", fadeTop && "visible")}
        aria-hidden
      />
    </div>
  );
});

/** Scrollable chat thread with a frosted top edge when content scrolls under. */
export const HmatChatThread = forwardRef<
  HTMLDivElement,
  { children: ReactNode; watchKey?: string | number }
>(function HmatChatThread({ children, watchKey }, forwardedRef) {
  return (
    <HmatFrostedScroll
      ref={forwardedRef}
      watchKey={watchKey}
      className="flex flex-col gap-2.5 overflow-y-auto px-0.5"
    >
      {children}
    </HmatFrostedScroll>
  );
});

export function HmatFrostCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("hmat-frost-card rounded-[20px]", className)}>{children}</div>;
}

export function HmatSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#9c9089]">
      {children}
    </p>
  );
}

export function HmatCaptionPanel({
  kicker,
  children,
  muted,
  live,
}: {
  kicker: string;
  children: ReactNode;
  muted?: boolean;
  live?: boolean;
}) {
  return (
    <div className="hmat-caption-panel rounded-2xl px-3.5 py-3.5">
      <p className={cn(TYPE.kicker, "mb-1.5 shrink-0 font-display tracking-[0.15em] text-[#6E8A74]")}>
        {kicker}
      </p>
      <div
        className={cn(
          "hmat-caption-body",
          TYPE.bodySm,
          live && "hmat-caption-body--live",
          muted ? "text-[#243D2C]/40" : "text-[#243D2C]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SendArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function HmatChatComposerRow({
  mode,
  value,
  onChange,
  onSend,
  onEndChat,
  disabled,
  placeholder,
  sendLabel = "Odeslat",
  endLabel = "Ukončit",
}: {
  mode: "idle" | "ongoing";
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onEndChat: () => void;
  disabled?: boolean;
  placeholder: string;
  sendLabel?: string;
  endLabel?: string;
}) {
  const empty = value.trim().length === 0;
  const ongoing = mode === "ongoing";

  return (
    <div className="flex h-full min-h-0 shrink-0 flex-col">
      <div className="flex min-h-[54px] items-center">
        <div className="hmat-frost-field relative min-w-0 flex-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!disabled && !empty) onSend();
              }
            }}
            disabled={disabled}
            aria-label={sendLabel}
            className={cn(
              "w-full bg-transparent px-[18px] py-3.5 text-[#243D2C] outline-none disabled:opacity-50",
              TYPE.body,
            )}
          />
          {empty ? (
            <span
              className={cn(
                "pointer-events-none absolute inset-y-0 left-[18px] flex items-center text-[#6E8A74]",
                TYPE.body,
              )}
              aria-hidden
            >
              {placeholder}
            </span>
          ) : null}
        </div>
        <div
          className="t-resize hmat-composer-icon-slot"
          data-open={ongoing ? "false" : "true"}
          inert={ongoing || undefined}
          aria-hidden={ongoing}
        >
          <button
            type="button"
            onClick={() => {
              if (!disabled && !empty) onSend();
            }}
            disabled={disabled || empty || ongoing}
            aria-label={sendLabel}
            tabIndex={ongoing ? -1 : undefined}
            className="hmat-fern-send flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-white disabled:opacity-40"
          >
            <SendArrowIcon />
          </button>
        </div>
      </div>
      <div
        className="t-acc hmat-composer-split"
        data-open={ongoing ? "true" : "false"}
        inert={!ongoing || undefined}
      >
        <div className="t-acc-panel">
          <div className="t-acc-panel-inner">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  tapLight();
                  onEndChat();
                }}
                disabled={disabled || !ongoing}
                tabIndex={ongoing ? undefined : -1}
                className="hmat-frost-action flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl text-[#243D2C] disabled:opacity-50"
              >
                <CloseIcon />
                <span className={cn(TYPE.bodySm, "font-display font-semibold")}>{endLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!disabled && !empty) onSend();
                }}
                disabled={disabled || empty || !ongoing}
                tabIndex={ongoing ? undefined : -1}
                className="hmat-ink-action flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl text-white disabled:opacity-40"
              >
                <SendArrowIcon />
                <span className={cn(TYPE.bodySm, "font-display font-semibold")}>{sendLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HmatSettingsHeader({
  orbState,
  kicker,
  title,
}: {
  orbState: HonzaOrbState;
  kicker: string;
  title: string;
}) {
  return (
    <header className="flex items-center gap-3.5">
      <div className="hmat-presence-shared hmat-presence-compact shrink-0">
        <HmatOrb state={orbState} size={64} breathe={false} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn(TYPE.kicker, "font-display tracking-[0.2em] text-accent")}>{kicker}</p>
        <p className={cn(TYPE.title, "font-display text-[18px] text-[#243D2C]")}>{title}</p>
      </div>
    </header>
  );
}
