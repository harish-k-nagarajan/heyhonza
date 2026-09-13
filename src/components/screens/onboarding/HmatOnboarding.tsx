"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { Button } from "@/components/ui/Button";
import { HmatFileInput } from "@/components/screens/hmat/HmatChrome";
import {
  DAILY_MESSAGE_COUNTS,
  LEVEL_OPTIONS,
  type LevelId,
  type TopicId,
} from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { OnboardingProviderFields } from "@/components/screens/onboarding/OnboardingProviderFields";
import type { OnboardingScreen } from "@/hooks/useOnboardingScreen";
import { useLocale } from "@/lib/i18n/useLocale";

const TOPIC_ROWS: TopicId[][] = [
  ["daily", "travel", "food"],
  ["work", "grammar", "smalltalk"],
];

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex w-full justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((dot) => (
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

/** Hmat onboarding — 6-step flow. */
export function HmatOnboarding({ screen }: { screen: OnboardingScreen }) {
  const { t } = useLocale();
  const o = t.onboarding;
  const s = t.settings;
  const total = screen.totalSteps;

  if (!screen.ready) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center uppercase text-muted-foreground",
          TYPE.meta,
        )}
      >
        {o.loading}
      </div>
    );
  }

  const ctaLabel = screen.step === total ? o.startChatting : o.continue;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-4 py-10">
      <div
        className="flex w-full max-w-[390px] flex-col gap-3 overflow-y-auto rounded-[28px] border border-[#E8E2DC] bg-white px-5 pb-7 pt-5 max-h-[min(780px,calc(100dvh-5rem))]"
      >
        <ProgressDots step={screen.step} total={total} />

        {screen.step === 1 ? (
          <>
            <StepLabel>{o.stepOf(1, total)}</StepLabel>
            <StepTitle>{o.step1Title}</StepTitle>
            <div className="mat-recess flex w-full flex-col items-center rounded-[16px] px-4 py-6">
              <HmatOrb state="idle" size={120} />
            </div>
            <StepBody>{o.step1Body}</StepBody>
            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
          </>
        ) : null}

        {screen.step === 2 ? (
          <>
            <StepLabel>{o.stepOf(2, total)}</StepLabel>
            <StepTitle>{o.step2Title}</StepTitle>
            <StepBody>{o.step2Body}</StepBody>
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
                      {t.levels.detail[option.id as LevelId]}
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
            <StepLabel>{o.stepOf(3, total)}</StepLabel>
            <StepTitle>{o.step3Title}</StepTitle>
            <StepBody>{o.step3Body}</StepBody>
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
                        {t.topics[topicId]}
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
            <StepLabel>{o.stepOf(4, total)}</StepLabel>
            <StepTitle>{o.step4Title}</StepTitle>
            <StepBody>{o.step4Body}</StepBody>

            <SectionMicroLabel>{o.howOften}</SectionMicroLabel>
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

            <SectionMicroLabel>{o.when}</SectionMicroLabel>
            <div className="flex flex-wrap gap-2">
              <PillChip
                on={screen.scheduleMode === "specific"}
                pressed={screen.scheduleMode === "specific"}
                onClick={() => screen.setScheduleMode("specific")}
              >
                {o.specificTime}
              </PillChip>
              <PillChip
                on={screen.scheduleMode === "random"}
                pressed={screen.scheduleMode === "random"}
                onClick={() => screen.setScheduleMode("random")}
              >
                {o.random}
              </PillChip>
            </div>

            {screen.scheduleMode === "specific" ? (
              <div
                className="flex items-center justify-between rounded-[14px] border border-[#E8E2DC] bg-[#F5F2EE] px-3.5 py-2.5"
              >
                <span className="font-sans text-[15px] text-[#2A2420]">{o.firstMessage}</span>
                <label className="relative">
                  <span className="font-sans text-[15px] font-semibold text-accent">
                    {formatDisplayTime(screen.firstMessageTime)}
                  </span>
                  <input
                    type="time"
                    value={screen.firstMessageTime}
                    onChange={(e) => screen.setFirstMessageTime(e.target.value)}
                    aria-label={o.firstMessageTimeAria}
                    className="absolute inset-0 opacity-0"
                  />
                </label>
              </div>
            ) : null}

            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
            <button
              type="button"
              onClick={screen.skipScheduleSetup}
              className="w-full py-3 text-center font-sans text-[15px] font-semibold text-[#2A2420] underline"
            >
              {o.setupLater}
            </button>
          </>
        ) : null}

        {screen.step === 5 ? (
          <>
            <StepLabel>{o.stepOf(5, total)}</StepLabel>
            <StepTitle>{o.step5Title}</StepTitle>
            <StepBody>{o.step5Body}</StepBody>
            <OnboardingProviderFields
              llm={screen.llm}
              tts={screen.tts}
              busy={screen.providerBusy}
              onSave={screen.saveProviderKey}
              onDisconnect={screen.disconnectProvider}
              variant="hmat"
              labels={{
                openRouterName: s.openRouterName,
                openRouterDesc: s.openRouterDesc,
                elevenLabsName: s.elevenLabsName,
                elevenLabsDesc: s.elevenLabsDesc,
                pasteApiKey: s.pasteApiKey,
                saveKey: s.saveKey,
                disconnect: s.disconnect,
              }}
            />
            <OnboardingCta onClick={screen.continue}>{ctaLabel}</OnboardingCta>
            <button
              type="button"
              onClick={screen.continue}
              className="w-full py-3 text-center font-sans text-[15px] font-semibold text-[#2A2420] underline"
            >
              {o.skip}
            </button>
          </>
        ) : null}

        {screen.step === 6 ? (
          <>
            <StepLabel>{o.stepOptional}</StepLabel>
            <StepTitle>{o.step6Title}</StepTitle>
            <StepBody>{o.step6Body}</StepBody>

            <SectionMicroLabel>{o.googleDoc}</SectionMicroLabel>
            <StepBody>{o.googleDocShare}</StepBody>
            <input
              value={screen.docUrl}
              onChange={(e) => screen.setDocUrl(e.target.value)}
              placeholder={t.settings.googleDocPlaceholder}
              aria-label={t.settings.googleDocAria}
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
              {screen.docLoading ? t.settings.fetching : t.settings.addFromGoogleDocs}
            </Button>

            <SectionMicroLabel>{o.fileOrPaste}</SectionMicroLabel>
            <div className="space-y-1.5">
              <p className={TYPE.helper}>{t.settings.fileLabel}</p>
              <HmatFileInput onFile={screen.onFile} />
            </div>
            <textarea
              value={screen.paste}
              onChange={(e) => screen.setPaste(e.target.value)}
              rows={3}
              placeholder={t.settings.pastePlaceholder}
              aria-label={t.settings.pastedTextAria}
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
              {o.skip}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
