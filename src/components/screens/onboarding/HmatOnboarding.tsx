"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { Button } from "@/components/ui/Button";
import { HmatFileInput } from "@/components/screens/hmat/HmatChrome";
import {
  DAILY_MESSAGE_COUNTS,
  LEVEL_OPTIONS,
  ONBOARDING_LEVEL_DETAILS,
  ONBOARDING_TOPIC_LABELS,
  type LevelId,
  type TopicId,
} from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { OnboardingScreen } from "@/hooks/useOnboardingScreen";

const TOPIC_ROWS: TopicId[][] = [
  ["daily", "travel", "food"],
  ["work", "grammar", "smalltalk"],
];

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex w-full justify-center gap-1.5">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={cn(
            "h-2 w-2 rounded-full",
            dot === step ? "bg-accent" : "bg-[#E8E2DC]",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

function OnboardingCta({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="auth-cta-primary w-full rounded-full py-3.5 font-sans text-[15px] font-semibold normal-case tracking-normal"
    >
      {children}
    </button>
  );
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "font-display text-[9px] font-bold uppercase tracking-[0.16em] text-[#9C9089]",
      )}
    >
      {children}
    </p>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-[20px] font-bold leading-tight text-[#2A2420]">
      {children}
    </h1>
  );
}

function StepBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[14px] leading-relaxed text-[#9C9089]">{children}</p>
  );
}

function SectionMicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "font-display text-[9px] font-bold uppercase tracking-[0.16em] text-[#9C9089]",
      )}
    >
      {children}
    </p>
  );
}

function PillChip({
  on,
  children,
  onClick,
  pressed,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "rounded-full border px-3.5 py-1.5 font-sans text-[15px] transition",
        on
          ? "border-accent bg-accent text-white"
          : "border-[#E8E2DC] bg-[#F5F2EE] text-[#2A2420]",
      )}
    >
      {children}
    </button>
  );
}

function formatDisplayTime(value: string): string {
  const [hour, minute] = value.split(":");
  if (!hour || !minute) return value;
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/** Hmat onboarding — 5-step flow from Handoff — Onboarding Flow. */
export function HmatOnboarding({ screen }: { screen: OnboardingScreen }) {
  if (!screen.ready) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center uppercase text-muted-foreground",
          TYPE.meta,
        )}
      >
        Načítání…
      </div>
    );
  }

  const ctaLabel = screen.step === 5 ? "Start chatting" : "Continue";

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-4 py-10">
      <div
        className="flex w-full max-w-[390px] flex-col gap-3 overflow-y-auto rounded-[28px] border border-[#E8E2DC] bg-white px-5 pb-7 pt-5 max-h-[min(780px,calc(100dvh-5rem))]"
      >
        <ProgressDots step={screen.step} />

        {screen.step === 1 ? (
          <>
            <StepLabel>STEP 1 OF 5</StepLabel>
            <StepTitle>Ahoj! Jsem Honza.</StepTitle>
            <div className="mat-recess flex w-full flex-col items-center rounded-[16px] px-4 py-6">
              <HmatOrb state="idle" size={120} />
            </div>
            <StepBody>
              I&apos;ll write to you in Czech about real things. You reply. I fix your
              mistakes — kindly.
            </StepBody>
            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
          </>
        ) : null}

        {screen.step === 2 ? (
          <>
            <StepLabel>STEP 2 OF 5</StepLabel>
            <StepTitle>What&apos;s your level?</StepTitle>
            <StepBody>
              Honza adapts to where you are — from first sentences to almost fluent.
            </StepBody>
            <div className="flex flex-col gap-2">
              {LEVEL_OPTIONS.map((option) => {
                const selected = screen.level === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => screen.chooseLevel(option.id as LevelId)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[16px] border px-3.5 py-3.5 text-left transition",
                      selected
                        ? "border-accent bg-[#FFF4EE]"
                        : "border-[#E8E2DC] bg-[#F5F2EE]",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display text-[14px] font-bold",
                        selected ? "text-accent" : "text-[#9C9089]",
                      )}
                    >
                      {option.id}
                    </span>
                    <span className="font-sans text-[14px] text-[#2A2420]">
                      {ONBOARDING_LEVEL_DETAILS[option.id as LevelId]}
                    </span>
                  </button>
                );
              })}
            </div>
            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
          </>
        ) : null}

        {screen.step === 3 ? (
          <>
            <StepLabel>STEP 3 OF 5</StepLabel>
            <StepTitle>What do you want to talk about?</StepTitle>
            <StepBody>Pick topics you care about — not textbook phrases.</StepBody>
            <div className="flex flex-col gap-2">
              {TOPIC_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap gap-2">
                  {row.map((topicId) => {
                    const on = screen.topics.includes(topicId);
                    return (
                      <PillChip
                        key={topicId}
                        on={on}
                        pressed={on}
                        onClick={() => screen.toggleTopic(topicId)}
                      >
                        {ONBOARDING_TOPIC_LABELS[topicId]}
                      </PillChip>
                    );
                  })}
                </div>
              ))}
            </div>
            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
          </>
        ) : null}

        {screen.step === 4 ? (
          <>
            <StepLabel>STEP 4 OF 5</StepLabel>
            <StepTitle>When should Honza write?</StepTitle>
            <StepBody>
              Honza can message you 1–3 times a day. Pick a time or let it feel random.
            </StepBody>

            <SectionMicroLabel>HOW OFTEN</SectionMicroLabel>
            <div className="flex flex-wrap gap-2">
              {DAILY_MESSAGE_COUNTS.map((count) => (
                <PillChip
                  key={count}
                  on={screen.dailyMessageCount === count}
                  pressed={screen.dailyMessageCount === count}
                  onClick={() => screen.setDailyMessageCount(count)}
                >
                  {count}x
                </PillChip>
              ))}
            </div>

            <SectionMicroLabel>WHEN</SectionMicroLabel>
            <div className="flex flex-wrap gap-2">
              <PillChip
                on={screen.scheduleMode === "specific"}
                pressed={screen.scheduleMode === "specific"}
                onClick={() => screen.setScheduleMode("specific")}
              >
                Specific time
              </PillChip>
              <PillChip
                on={screen.scheduleMode === "random"}
                pressed={screen.scheduleMode === "random"}
                onClick={() => screen.setScheduleMode("random")}
              >
                Random
              </PillChip>
            </div>

            {screen.scheduleMode === "specific" ? (
              <div
                className="flex items-center justify-between rounded-[14px] border border-[#E8E2DC] bg-[#F5F2EE] px-3.5 py-2.5"
              >
                <span className="font-sans text-[15px] text-[#2A2420]">First message</span>
                <label className="relative">
                  <span className="font-sans text-[15px] font-semibold text-accent">
                    {formatDisplayTime(screen.firstMessageTime)}
                  </span>
                  <input
                    type="time"
                    value={screen.firstMessageTime}
                    onChange={(e) => screen.setFirstMessageTime(e.target.value)}
                    aria-label="First message time"
                    className="absolute inset-0 opacity-0"
                  />
                </label>
              </div>
            ) : null}

            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
          </>
        ) : null}

        {screen.step === 5 ? (
          <>
            <StepLabel>STEP 5 OF 5 · OPTIONAL</StepLabel>
            <StepTitle>Teach Honza about you</StepTitle>
            <StepBody>
              Add a Google Doc, file, or paste — or skip and add this later in Settings.
            </StepBody>

            <SectionMicroLabel>GOOGLE DOC</SectionMicroLabel>
            <StepBody>
              Set the doc to Share → Anyone with the link → Viewer so Honza can read it.
            </StepBody>
            <input
              value={screen.docUrl}
              onChange={(e) => screen.setDocUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/…"
              aria-label="Google Doc URL"
              className="mat-field w-full rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-foreground outline-none"
            />
            {screen.docError ? (
              <p className={cn(TYPE.helper, "text-accent")}>{screen.docError}</p>
            ) : null}
            <Button
              type="button"
              surface="mat-key"
              shape="card"
              size="md"
              className="w-full"
              onClick={screen.importGoogleDoc}
              disabled={screen.docLoading}
            >
              {screen.docLoading ? "Fetching…" : "Import document"}
            </Button>

            <SectionMicroLabel>FILE OR PASTE</SectionMicroLabel>
            <div className="space-y-1.5">
              <p className={TYPE.helper}>File (.txt, .md)</p>
              <HmatFileInput onFile={screen.onFile} />
            </div>
            <textarea
              value={screen.paste}
              onChange={(e) => screen.setPaste(e.target.value)}
              rows={3}
              placeholder="Anything Honza should know about you…"
              aria-label="Pasted text"
              className="mat-field w-full resize-none rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-foreground outline-none"
            />
            {screen.fileError ? (
              <p className={cn(TYPE.helper, "text-accent")}>{screen.fileError}</p>
            ) : null}

            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
            <button
              type="button"
              onClick={screen.skip}
              className="w-full py-3 text-center font-sans text-[15px] font-semibold text-[#2A2420] underline"
            >
              Skip for now
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
