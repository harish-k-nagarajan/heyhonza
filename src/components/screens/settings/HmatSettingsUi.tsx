"use client";

import { useState, type ReactNode } from "react";

import { useSlidingPill } from "@/hooks/useSlidingPill";
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
  const [init, setInit] = useState(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      data-on={on ? "true" : "false"}
      onClick={() => {
        setInit(true);
        onChange(!on);
      }}
      className={cn(
        "hmat-toggle relative h-7 w-12 shrink-0 rounded-full p-1 disabled:opacity-50",
        init && "is-init",
        on ? "bg-accent" : "bg-[#E8E2DC]",
      )}
    >
      <span className="hmat-toggle-thumb block h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}

export function HmatSettingsStatusBadge({
  connected,
  connectedLabel,
  disconnectedLabel,
  tone,
}: {
  connected: boolean;
  connectedLabel: string;
  disconnectedLabel: string;
  tone?: "ok" | "warn" | "off";
}) {
  const resolved = tone ?? (connected ? "ok" : "off");
  const styles =
    resolved === "ok"
      ? { wrap: "bg-[#E8F5E9]", dot: "bg-[#2F8F4E]", text: "text-[#2F8F4E]" }
      : resolved === "warn"
        ? { wrap: "bg-[#FFF4E5]", dot: "bg-[#D97706]", text: "text-[#B45309]" }
        : { wrap: "bg-[#FFF0F0]", dot: "bg-[#C46B6B]", text: "text-[#C46B6B]" };
  const label = connected ? connectedLabel : disconnectedLabel;
  return (
    <span
      className={cn(
        "hmat-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        styles.wrap,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} aria-hidden />
      <span className={cn("hmat-text-swap font-display text-[11px] font-bold", styles.text)}>
        {label}
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
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const { barRef, pillRef, setItemRef } = useSlidingPill(
    activeIndex,
    options.map((o) => o.label).join("|"),
  );

  return (
    <div
      ref={barRef}
      className="hmat-tabs flex gap-1 rounded-[14px] bg-[#F5EDE7] p-1"
      role="group"
      aria-label={ariaLabel}
    >
      <span ref={pillRef} className="hmat-tabs-pill" aria-hidden />
      {options.map((option, i) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            ref={setItemRef(i)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "hmat-tab-btn flex h-10 flex-1 items-center justify-center rounded-xl bg-transparent font-display text-sm font-bold",
              active ? "text-[#243D2C]" : "text-[#9c9089]",
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
        "hmat-chip rounded-full border px-3.5 py-2 font-sans text-[13px] font-semibold",
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
        "hmat-chip flex flex-1 items-center justify-center rounded-full border px-3 py-2.5 text-center font-sans text-xs",
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
        "hmat-chip flex flex-1 flex-col items-center rounded-[14px] px-2.5 py-3",
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
        "hmat-press flex h-12 w-full items-center justify-center gap-2 rounded-2xl border bg-white font-display text-sm font-bold",
        variant === "danger"
          ? "hmat-press--danger border-[#C46B6B55] text-[#C46B6B]"
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
  embedded,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { embedded?: boolean }) {
  return (
    <textarea
      className={cn(
        "min-h-[88px] w-full resize-none bg-transparent px-3.5 py-3 font-sans text-sm text-[#243D2C] outline-none",
        embedded ? "" : "hmat-frost-field rounded-[14px]",
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
      className="hmat-press flex h-10 w-full items-center justify-center rounded-xl bg-[#F5EDE7] font-display text-[13px] font-bold text-[#243D2C] disabled:opacity-50"
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
      className="hmat-press flex h-10 items-center justify-center rounded-xl bg-accent px-3.5 font-display text-[13px] font-bold text-white disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function HmatSettingsHint({ children }: { children: ReactNode }) {
  return <p className={cn(TYPE.helper, "text-[#9c9089]")}>{children}</p>;
}

export function HmatSettingsGlyphButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  tone = "accent",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
  tone?: "accent" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "hmat-glyph-lite flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border bg-white transition-[transform,background-color,border-color,color] duration-[160ms] ease-[var(--ease-out)] active:scale-[0.96] disabled:opacity-40",
        tone === "danger"
          ? "hmat-glyph-lite--danger border-[#C46B6B]/35 text-[#C46B6B]"
          : "border-black/15 text-accent",
      )}
    >
      {children}
    </button>
  );
}

export function HmatSettingsInlineField({
  action,
  actionVisible,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  action: ReactNode;
  actionVisible: boolean;
}) {
  return (
    <div className="hmat-frost-field relative flex min-h-[52px] items-center">
      <input
        className={cn(
          "h-11 w-full min-w-0 bg-transparent px-3.5 pr-14 font-sans text-sm text-[#243D2C] outline-none",
          className,
        )}
        {...props}
      />
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <div
          className={cn(
            "hmat-inline-action",
            actionVisible ? "hmat-inline-action--in" : "hmat-inline-action--out",
          )}
        >
          {action}
        </div>
      </div>
    </div>
  );
}

export function HmatSettingsConfirm({
  open = true,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open?: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className={cn(
        "hmat-confirm-overlay fixed inset-0 z-50 flex items-end justify-center bg-[#2A2420]/35 p-4 sm:items-center",
        open ? "is-open" : "is-closing",
      )}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hmat-reset-title"
        className="hmat-frost-card hmat-confirm-sheet w-full max-w-[390px] space-y-3 p-4"
      >
        <p id="hmat-reset-title" className="font-display text-base tracking-[0.04em] text-[#243D2C]">
          {title}
        </p>
        <p className={cn(TYPE.bodySm, "text-[#5c5a57]")}>{body}</p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="hmat-press flex h-11 flex-1 items-center justify-center rounded-xl border border-black/10 bg-white font-display text-[13px] text-[#243D2C]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="hmat-press hmat-press--danger flex h-11 flex-1 items-center justify-center rounded-xl bg-[#C46B6B] font-display text-[13px] text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function HmatSettingsRowTitle({ children }: { children: ReactNode }) {
  return <p className="font-display text-sm font-bold text-[#243D2C]">{children}</p>;
}

export function HmatSettingsRowSubtitle({ children }: { children: ReactNode }) {
  return <p className="font-sans text-xs text-[#9c9089]">{children}</p>;
}
