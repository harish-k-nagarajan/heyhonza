"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function HmatSettingsSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#9c9089]">
        {label}
      </p>
      {children}
    </section>
  );
}

export function HmatSettingsCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hmat-frost-card rounded-[20px]", className)}>{children}</div>
  );
}

export function HmatSettingsIconWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFE5DC]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HmatSettingsToggle({
  on,
  onChange,
  disabled,
  ariaLabel,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors disabled:opacity-50",
        on ? "bg-accent" : "bg-[#E8E2DC]",
      )}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function HmatSettingsStatusBadge({
  connected,
  connectedLabel,
  disconnectedLabel,
}: {
  connected: boolean;
  connectedLabel: string;
  disconnectedLabel: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        connected ? "bg-[#E8F5E9]" : "bg-[#FFF0F0]",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-[#2F8F4E]" : "bg-[#C46B6B]")}
        aria-hidden
      />
      <span
        className={cn(
          "font-display text-[11px] font-bold",
          connected ? "text-[#2F8F4E]" : "text-[#C46B6B]",
        )}
      >
        {connected ? connectedLabel : disconnectedLabel}
      </span>
    </span>
  );
}

export function HmatSettingsSegment<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="flex gap-1 rounded-[14px] bg-[#F5EDE7] p-1"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-10 flex-1 items-center justify-center rounded-xl font-display text-sm font-bold transition",
              active
                ? "bg-white text-[#243D2C] shadow-[0_2px_6px_rgba(120,90,70,0.1)]"
                : "bg-transparent text-[#9c9089]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function HmatSettingsPill({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-full border px-3.5 py-2 font-sans text-[13px] font-semibold transition",
        on
          ? "border-accent bg-accent text-white"
          : "border-[#E8E2DC] bg-white text-[#2A2420]",
      )}
    >
      {children}
    </button>
  );
}

export function HmatSettingsTopicChip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex flex-1 items-center justify-center rounded-full border px-3 py-2.5 text-center font-sans text-xs transition",
        on
          ? "border-accent/30 bg-[#FFE5DC] font-bold text-accent"
          : "border-black/10 bg-white font-normal text-[#243D2C]",
      )}
    >
      {children}
    </button>
  );
}

export function HmatSettingsLevelTile({
  id,
  hint,
  selected,
  onClick,
}: {
  id: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 flex-col items-center rounded-[14px] px-2.5 py-3 transition",
        selected
          ? "bg-[#FFE5DC] outline outline-1 outline-accent/30"
          : "bg-white outline outline-1 outline-black/10",
      )}
    >
      <span
        className={cn(
          "font-display text-base font-bold",
          selected ? "text-accent" : "text-[#243D2C]",
        )}
      >
        {id}
      </span>
      <span
        className={cn(
          "mt-0.5 font-sans text-[11px]",
          selected ? "text-accent" : "text-[#9c9089]",
        )}
      >
        {hint}
      </span>
    </button>
  );
}

export function HmatSettingsMicroLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c9089]">
      {children}
    </p>
  );
}

export function HmatSettingsDangerButton({
  children,
  onClick,
  variant = "neutral",
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "neutral" | "danger";
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border bg-white font-display text-sm font-bold transition active:scale-[0.99]",
        variant === "danger"
          ? "border-[#C46B6B55] text-[#C46B6B]"
          : "border-black/10 text-[#243D2C]",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function HmatSettingsField({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "hmat-frost-field h-11 w-full rounded-[14px] bg-transparent px-3.5 font-sans text-sm text-[#243D2C] outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function HmatSettingsTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "hmat-frost-field min-h-[88px] w-full resize-none rounded-[14px] bg-transparent px-3.5 py-3 font-sans text-sm text-[#243D2C] outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function HmatSettingsSecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-full items-center justify-center rounded-xl bg-[#F5EDE7] font-display text-[13px] font-bold text-[#243D2C] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function HmatSettingsPrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 items-center justify-center rounded-xl bg-accent px-3.5 font-display text-[13px] font-bold text-white disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function HmatSettingsHint({ children }: { children: ReactNode }) {
  return <p className={cn(TYPE.helper, "text-[#9c9089]")}>{children}</p>;
}

export function HmatSettingsRowTitle({ children }: { children: ReactNode }) {
  return <p className="font-display text-sm font-bold text-[#243D2C]">{children}</p>;
}

export function HmatSettingsRowSubtitle({ children }: { children: ReactNode }) {
  return <p className="font-sans text-xs text-[#9c9089]">{children}</p>;
}
