"use client";

import type { ReactNode } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import type { HonzaOrbState } from "@/components/honza/theme";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { tapLight } from "@/lib/interaction/haptic";

/** Recess mood label shown under the lit channel (handoff copy). */
export function recessMoodLabel(
  mood: HonzaOrbState,
  loading?: boolean,
): string {
  if (loading || mood === "thinking") return "PŘEMÝŠLÍ";
  switch (mood) {
    case "speaking":
      return "MLUVÍ";
    case "oops":
      return "CHYBA";
    case "excited":
      return "SKVĚLE";
    case "idle":
    default:
      return "ČEKÁ";
  }
}

export function HmatPresenceRecess({
  orbState,
  size = 172,
  stackClassName,
  loading,
  onOrbTap,
}: {
  orbState: HonzaOrbState;
  size?: number;
  stackClassName?: string;
  loading?: boolean;
  onOrbTap?: () => void;
}) {
  const moodLabel = recessMoodLabel(orbState, loading);

  return (
    <div className="relative">
      <div className="hmat-pulse-glow" aria-hidden />
      <div className="hmat-recess-hero mat-recess flex flex-col items-center px-4 pb-3.5 pt-[18px]">
        <button
          type="button"
          onClick={() => {
            tapLight();
            onOrbTap?.();
          }}
          className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Honza"
        >
          <HmatOrb state={orbState} size={size} breathe stackClassName={stackClassName} />
        </button>
        <div
          className="mat-channel mt-2.5 w-[200px] motion-reduce:animate-none"
          aria-hidden
        />
        <p className={cn("mt-2.5", TYPE.kicker, "font-display tracking-[0.2em] text-accent")}>
          {moodLabel}
        </p>
      </div>
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
    <h1 className={cn("text-center font-display text-[26px] font-bold leading-tight text-[#243D2C]")}>
      {children}
    </h1>
  );
}

export function HmatHonzaBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[88%] self-start">
      <div className="hmat-bubble-honza px-4 py-3.5">
        <p className={cn(TYPE.bodySm, "text-[#243D2C]")}>{children}</p>
      </div>
    </div>
  );
}

export function HmatUserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[88%] self-end">
      <div className="hmat-bubble-user px-4 py-3.5">
        <p className={cn(TYPE.bodySm, "text-white")}>{children}</p>
      </div>
    </div>
  );
}

export function HmatOpenerCard({ children }: { children: ReactNode }) {
  return (
    <div className="hmat-opener-card rounded-2xl px-3.5 py-3.5">
      <p className={cn(TYPE.bodySm, "text-[#243D2C]")}>{children}</p>
    </div>
  );
}

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
    <p
      className={cn(
        "font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#9c9089]",
      )}
    >
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
          className="hmat-ink-send flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-white disabled:opacity-40"
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
  endLabel = "Ukončit",
}: {
  captionsOn: boolean;
  onToggleCaptions: () => void;
  onEndCall: () => void;
  endLabel?: string;
}) {
  return (
    <div className="flex items-start justify-center gap-7">
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onToggleCaptions}
          aria-pressed={captionsOn}
          aria-label={captionsOn ? "Skrýt titulky" : "Zobrazit titulky"}
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
      <path d="M11 5 6 9H3v6h3l5 4V5zm4.5 2.5a7 7 0 0 1 0 11 1.5 1.5 0 0 0 2.1 2.1 10 10 0 0 0 0-15.2 1.5 1.5 0 0 0-2.1 2.1zM16 9.5a3.5 3.5 0 0 1 0 5 1.5 1.5 0 0 0 2.1 2.1 6.5 6.5 0 0 0 0-9.2 1.5 1.5 0 0 0-2.1 2.1z" opacity={active ? 1 : 0.85} />
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
      <HmatOrb state={orbState} size={64} breathe={false} />
      <div className="min-w-0 flex-1">
        <p className={cn(TYPE.kicker, "font-display tracking-[0.2em] text-accent")}>{kicker}</p>
        <p className={cn(TYPE.title, "font-display text-[18px] text-[#243D2C]")}>{title}</p>
      </div>
    </header>
  );
}
