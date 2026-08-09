"use client";

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { RecessReverb, recessMotion } from "@/components/honza/RecessReverb";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import type { HonzaOrbState } from "@/components/honza/theme";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { tapLight } from "@/lib/interaction/haptic";

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
  size = 172,
  stackClassName,
  loading,
  channelPulse,
  onOrbTap,
}: {
  orbState: HonzaOrbState;
  size?: number;
  stackClassName?: string;
  loading?: boolean;
  channelPulse?: boolean;
  onOrbTap?: () => void;
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

  return (
    <div
      className={cn(
        "hmat-recess-hero mat-recess flex flex-col items-center px-4 pb-3.5 pt-[18px]",
        orbState === "oops" && "hmat-recess-hero-oops",
      )}
    >
      <div className="hmat-display-module hmat-presence-shared">
        <RecessReverb motion={reverbMotion} />
        <div
          className={cn(
            "hmat-display-bezel",
            bezelActive && "hmat-display-bezel--active",
            speakFlash && "hmat-display-bezel--speak",
            stackClassName === "react-pop" && "hmat-display-bezel--burst",
          )}
        >
          <button
            type="button"
            onClick={() => {
              tapLight();
              onOrbTap?.();
            }}
            className="hmat-display-screen relative rounded-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={t.common.honza}
          >
            <HmatOrb state={orbState} size={size} breathe stackClassName={stackClassName} />
          </button>
        </div>
      </div>
        <div
          className={cn(
            "mat-channel mt-2.5 w-[200px] motion-reduce:animate-none",
            channelPulse && "motion-safe:animate-channel-pulse",
          )}
          aria-hidden
        />
        <p className={cn("mt-2.5", TYPE.kicker, "font-display tracking-[0.2em] text-accent")}>
          {moodLabel}
        </p>
    </div>
  );
}

export function HmatStatusChip({ label }: { label: string }) {
  return (
    <span className="hmat-chip inline-flex items-center gap-2 rounded-xl px-3.5 py-2">
      <span className="h-2 w-2 shrink-0 rounded-[2px] bg-accent" aria-hidden />
      <span className={cn(TYPE.bodySm, "font-display font-bold tracking-wide text-accent")}>
        {label}
      </span>
    </span>
  );
}

export function HmatScreenTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-center font-display text-[26px] font-bold leading-tight text-[#243D2C]">
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

/** Scrollable chat thread with frosted top/bottom edge fades when content overflows. */
export const HmatChatThread = forwardRef<
  HTMLDivElement,
  { children: ReactNode; watchKey?: string | number }
>(function HmatChatThread({ children, watchKey }, forwardedRef) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

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
    setFadeBottom(canScroll && el.scrollTop + el.clientHeight < el.scrollHeight - 4);
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
        className="hmat-chat-thread-scroll flex flex-col gap-2.5 overflow-y-auto px-0.5"
      >
        {children}
      </div>
      <div
        className={cn("hmat-chat-thread-fade hmat-chat-thread-fade-top", fadeTop && "visible")}
        aria-hidden
      />
      <div
        className={cn(
          "hmat-chat-thread-fade hmat-chat-thread-fade-bottom",
          fadeBottom && "visible",
        )}
        aria-hidden
      />
    </div>
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
}: {
  kicker: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="hmat-caption-panel rounded-2xl px-3.5 py-3.5">
      <p className={cn(TYPE.kicker, "mb-1.5 font-display tracking-[0.15em] text-[#6E8A74]")}>
        {kicker}
      </p>
      <p
        className={cn(
          TYPE.bodySm,
          muted ? "text-[#243D2C]/40" : "text-[#243D2C]",
        )}
      >
        {children}
      </p>
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

  if (mode === "idle") {
    return (
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="hmat-frost-field relative flex-1">
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
        <button
          type="button"
          onClick={() => {
            if (!disabled && !empty) onSend();
          }}
          disabled={disabled || empty}
          aria-label={sendLabel}
          className="hmat-fern-send flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-white disabled:opacity-40"
        >
          <SendArrowIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col gap-2.5">
      <div className="hmat-frost-field relative">
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
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => {
            tapLight();
            onEndChat();
          }}
          disabled={disabled}
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
          disabled={disabled || empty}
          className="hmat-ink-action flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl text-white disabled:opacity-40"
        >
          <SendArrowIcon />
          <span className={cn(TYPE.bodySm, "font-display font-semibold")}>{sendLabel}</span>
        </button>
      </div>
    </div>
  );
}

export function HmatCallButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="hmat-call-start flex h-[76px] w-[76px] items-center justify-center rounded-full text-white disabled:opacity-40"
      >
        <HardwareIcon name="call" size={30} emboss={false} />
      </button>
      <span className={cn(TYPE.bodySm, "font-display font-bold text-[#243D2C]")}>{label}</span>
    </div>
  );
}

export function HmatCallControls({
  captionsOn,
  onToggleCaptions,
  onEndCall,
  endLabel,
  showCaptionsLabel,
  hideCaptionsLabel,
}: {
  captionsOn: boolean;
  onToggleCaptions: () => void;
  onEndCall: () => void;
  endLabel: string;
  showCaptionsLabel: string;
  hideCaptionsLabel: string;
}) {
  return (
    <div className="flex items-start justify-center gap-7">
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onToggleCaptions}
          aria-pressed={captionsOn}
          aria-label={captionsOn ? hideCaptionsLabel : showCaptionsLabel}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border transition",
            captionsOn
              ? "hmat-call-start border-white/25 text-white"
              : "hmat-frost-action border-black/10 text-[#6E8A74]",
          )}
        >
          <VolumeIcon active={captionsOn} />
        </button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onEndCall}
          aria-label={endLabel}
          className="hmat-call-end flex h-[76px] w-[76px] items-center justify-center rounded-full text-white"
        >
          <HangIcon />
        </button>
        <span className={cn(TYPE.bodySm, "font-display font-bold text-[#243D2C]")}>{endLabel}</span>
      </div>
    </div>
  );
}

function VolumeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5zm4.5 2.5a7 7 0 0 1 0 11 1.5 1.5 0 0 0 2.1 2.1 10 10 0 0 0 0-15.2 1.5 1.5 0 0 0-2.1 2.1zM16 9.5a3.5 3.5 0 0 1 0 5 1.5 1.5 0 0 0 2.1 2.1 6.5 6.5 0 0 0 0-9.2 1.5 1.5 0 0 0-2.1 2.1z"
        opacity={active ? 1 : 0.85}
      />
    </svg>
  );
}

function HangIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3a9 9 0 0 0-9 9v3l2-2v-1a7 7 0 0 1 14 0v1l2 2v-3a9 9 0 0 0-9-9zm-5 11 2.3 2.3a3 3 0 0 0 4.2 0L16 14l-1.4-1.4-2.3 2.3a1 1 0 0 1-1.4 0L8.6 12.6 7.2 14z" />
    </svg>
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
