"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

function ScheduleMessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="#E8432D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MockPill({
  children,
  active,
}: {
  children: string;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3.5 py-2 font-sans text-[13px] font-semibold",
        active
          ? "border-accent bg-accent text-white"
          : "border-[#E8E2DC] bg-white text-[#2A2420]",
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

function MockToggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 rounded-full p-1",
        on ? "bg-accent" : "bg-[#E8E2DC]",
      )}
      aria-hidden
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow-sm",
          on ? "translate-x-5" : "translate-x-0",
        )}
      />
    </span>
  );
}

export type LandingScheduleSettingsMockProps = {
  hint: string;
  toggleLabel: string;
  howOftenLabel: string;
  whenLabel: string;
  specificTimeLabel: string;
  randomLabel: string;
  firstMessageLabel: string;
  className?: string;
};

export function LandingScheduleSettingsMock({
  hint,
  toggleLabel,
  howOftenLabel,
  whenLabel,
  specificTimeLabel,
  randomLabel,
  firstMessageLabel,
  className,
}: LandingScheduleSettingsMockProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-[28px] border border-border bg-white p-3.5 md:gap-3 md:p-5",
        "shadow-[0_16px_40px_rgba(120,90,70,0.08)]",
        className,
      )}
    >
      <p className={cn(TYPE.helper, "hidden leading-[1.45] text-[#5C534D] md:block")}>{hint}</p>

      <div className="space-y-3 rounded-[20px] border border-[#E8E2DC] bg-[#FFFBF9] p-3 md:space-y-4 md:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFE5DC]"
              aria-hidden
            >
              <ScheduleMessageIcon />
            </div>
            <p className={cn(TYPE.bodySm, "font-medium leading-snug text-[#2A2420]")}>
              {toggleLabel}
            </p>
          </div>
          <MockToggle on />
        </div>

        <div className="space-y-2">
          <p className={cn(TYPE.label, "text-[#6B625C]")}>{howOftenLabel}</p>
          <div className="flex flex-wrap gap-2">
            <MockPill>1×</MockPill>
            <MockPill active>2×</MockPill>
            <MockPill>3×</MockPill>
          </div>
        </div>

        <div className="space-y-2">
          <p className={cn(TYPE.label, "text-[#6B625C]")}>{whenLabel}</p>
          <div className="flex flex-wrap gap-2">
            <MockPill active>{specificTimeLabel}</MockPill>
            <MockPill>{randomLabel}</MockPill>
          </div>
          <div className="flex items-center justify-between rounded-[14px] border border-[#E8E2DC] bg-white px-4 py-3">
            <span className={cn(TYPE.bodySm, "text-[#2A2420]")}>{firstMessageLabel}</span>
            <span className={cn(TYPE.title, "text-base text-accent")}>8:30</span>
          </div>
        </div>
      </div>
    </div>
  );
}
