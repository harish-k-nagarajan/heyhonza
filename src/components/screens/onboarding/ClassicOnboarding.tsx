"use client";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  DAILY_MESSAGE_COUNTS,
  LEVEL_OPTIONS,
  type LevelId,
  type TopicId,
} from "@/lib/constants";
import { OnboardingProviderFields } from "@/components/screens/onboarding/OnboardingProviderFields";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import type { OnboardingScreen } from "@/hooks/useOnboardingScreen";
import { specificMessageTimes } from "@/lib/schedule-times";
import { useLocale } from "@/lib/i18n/useLocale";

const TOPIC_ROWS: TopicId[][] = [
  ["daily", "travel", "food"],
  ["work", "grammar", "smalltalk"],
];

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((dot) => (
        <span
          key={dot}
          className={`h-2 w-2 rounded-full ${dot === step ? "bg-accent" : "bg-border"}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

function formatDisplayTime(value: string): string {
  const [hour, minute] = value.split(":");
  if (!hour || !minute) return value;
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/** Classic onboarding — same 6-step flow with legacy flat chrome. */
export function ClassicOnboarding({ screen }: { screen: OnboardingScreen }) {
  const { t } = useLocale();
  const o = t.onboarding;
  const s = t.settings;
  const total = screen.totalSteps;

  if (!screen.ready || screen.finishing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {o.loading}
      </div>
    );
  }

  const ctaLabel = screen.step === total ? o.startChatting : o.continue;

  return (
    <div className="relative mx-auto flex max-w-app flex-col gap-5">
      <LanguageSwitcher className="absolute right-0 top-0 z-10" />
      <ProgressDots step={screen.step} total={total} />

      {screen.step === 1 ? (
        <>
          <header className="flex flex-col items-center gap-4 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.stepOf(1, total)}
            </p>
            <HonzaOrb state="idle" size="hero" className="shrink-0" />
            <h1 className="font-sans text-lg tracking-tight">{o.step1Title}</h1>
            <p className="mx-auto max-w-[min(320px,100%)] font-sans text-sm leading-relaxed text-muted-foreground">
              {o.step1Body}
            </p>
          </header>
          <Button type="button" className="w-full" onClick={screen.continue}>
            {ctaLabel}
          </Button>
        </>
      ) : null}

      {screen.step === 2 ? (
        <>
          <div className="space-y-2 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.stepOf(2, total)}
            </p>
            <h1 className="font-sans text-lg tracking-tight">{o.step2Title}</h1>
            <p className="text-sm text-muted-foreground">{o.step2Body}</p>
          </div>
          <div className="flex flex-col gap-2">
            {LEVEL_OPTIONS.map((option) => {
              const selected = screen.level === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => screen.chooseLevel(option.id as LevelId)}
                  aria-pressed={selected}
                  className={`flex items-center gap-3 rounded-card border px-4 py-3 text-left transition ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`text-sm font-bold ${selected ? "text-accent" : ""}`}>
                    {option.id}
                  </span>
                  <span className="text-sm text-foreground">
                    {t.levels.detail[option.id as LevelId]}
                  </span>
                </button>
              );
            })}
          </div>
          <Button type="button" className="w-full" onClick={screen.continue}>
            {ctaLabel}
          </Button>
        </>
      ) : null}

      {screen.step === 3 ? (
        <>
          <div className="space-y-2 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.stepOf(3, total)}
            </p>
            <h1 className="font-sans text-lg tracking-tight">{o.step3Title}</h1>
            <p className="text-sm text-muted-foreground">{o.step3Body}</p>
          </div>
          <div className="flex flex-col gap-2">
            {TOPIC_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-2">
                {row.map((topicId) => {
                  const on = screen.topics.includes(topicId);
                  return (
                    <button
                      key={topicId}
                      type="button"
                      onClick={() => screen.toggleTopic(topicId)}
                      aria-pressed={on}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        on
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.topics[topicId]}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <Button type="button" className="w-full" onClick={screen.continue}>
            {ctaLabel}
          </Button>
        </>
      ) : null}

      {screen.step === 4 ? (
        <>
          <div className="space-y-2 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.stepOf(4, total)}
            </p>
            <h1 className="font-sans text-lg tracking-tight">{o.step4Title}</h1>
            <p className="text-sm text-muted-foreground">{o.step4Body}</p>
          </div>

          <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {o.howOften}
          </p>
          <div className="flex flex-wrap gap-2">
            {DAILY_MESSAGE_COUNTS.map((count) => {
              const on = screen.dailyMessageCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => screen.setDailyMessageCount(count)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    on
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {count}x
                </button>
              );
            })}
          </div>

          <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {o.when}
          </p>
          <div className="flex flex-wrap gap-2">
            {(["specific", "random"] as const).map((mode) => {
              const on = screen.scheduleMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => screen.setScheduleMode(mode)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    on
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {mode === "specific" ? o.specificTime : o.random}
                </button>
              );
            })}
          </div>

          {screen.scheduleMode === "specific" ? (
            <div className="flex flex-col gap-2">
              {(
                [
                  {
                    label: o.firstMessage,
                    aria: o.firstMessageTimeAria,
                    set: screen.setFirstMessageTime,
                  },
                  {
                    label: o.secondMessage,
                    aria: o.secondMessageTimeAria,
                    set: screen.setSecondMessageTime,
                  },
                  {
                    label: o.thirdMessage,
                    aria: o.thirdMessageTimeAria,
                    set: screen.setThirdMessageTime,
                  },
                ] as const
              )
                .slice(0, screen.dailyMessageCount)
                .map((row, index) => {
                  const time = specificMessageTimes({
                    count: screen.dailyMessageCount,
                    first: screen.firstMessageTime,
                    second: screen.secondMessageTime,
                    third: screen.thirdMessageTime,
                  })[index];
                  return (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-card border border-border bg-muted px-4 py-3"
                    >
                      <span className="text-sm text-foreground">{row.label}</span>
                      <label className="relative">
                        <span className="text-sm font-semibold text-accent">
                          {formatDisplayTime(time)}
                        </span>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => row.set(e.target.value)}
                          aria-label={row.aria}
                          className="absolute inset-0 opacity-0"
                        />
                      </label>
                    </div>
                  );
                })}
            </div>
          ) : null}

          <Button type="button" className="w-full" onClick={screen.continue}>
            {ctaLabel}
          </Button>
          <button
            type="button"
            onClick={screen.skipScheduleSetup}
            className="w-full py-3 text-center text-[15px] font-semibold text-foreground underline"
          >
            {o.setupLater}
          </button>
        </>
      ) : null}

      {screen.step === 5 ? (
        <>
          <div className="space-y-2 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.stepOf(5, total)}
            </p>
            <h1 className="font-sans text-lg tracking-tight">{o.step5Title}</h1>
            <p className="text-sm text-muted-foreground">{o.step5Body}</p>
          </div>
          <OnboardingProviderFields
            llm={screen.llm}
            tts={screen.tts}
            busy={screen.providerBusy}
            onSave={screen.saveProviderKey}
            onDisconnect={screen.disconnectProvider}
            variant="classic"
            labels={{
              openRouterName: s.openRouterName,
              openRouterDesc: s.openRouterDesc,
              elevenLabsName: s.elevenLabsName,
              elevenLabsDesc: s.elevenLabsDesc,
              pasteApiKey: s.pasteApiKey,
              saveKey: s.saveKey,
              disconnect: s.disconnect,
              connected: s.connected,
              disconnected: s.disconnected,
              invalidApiKey: s.invalidApiKey,
            }}
          />
          <Button type="button" className="w-full" onClick={screen.continue}>
            {ctaLabel}
          </Button>
          <button
            type="button"
            onClick={screen.continue}
            className="w-full py-3 text-center text-[15px] font-semibold text-foreground underline"
          >
            {o.skip}
          </button>
        </>
      ) : null}

      {screen.step === 6 ? (
        <>
          <div className="space-y-2 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.stepOptional}
            </p>
            <h1 className="font-sans text-lg tracking-tight">{o.step6Title}</h1>
            <p className="text-sm text-muted-foreground">{o.step6Body}</p>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.googleDoc}
            </p>
            <p className="text-xs text-muted-foreground">{o.googleDocShare}</p>
            <Label htmlFor="doc-url">{o.documentUrl}</Label>
            <Input
              id="doc-url"
              value={screen.docUrl}
              onChange={(e) => screen.setDocUrl(e.target.value)}
              placeholder={t.settings.googleDocPlaceholder}
            />
            {screen.docError ? <p className="text-xs text-accent">{screen.docError}</p> : null}
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={screen.docLoading}
              onClick={screen.importGoogleDoc}
            >
              {screen.docLoading ? t.settings.fetching : t.settings.addFromGoogleDocs}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {o.fileOrPaste}
            </p>
            <Label htmlFor="file">{t.settings.fileLabel}</Label>
            <Input
              id="file"
              type="file"
              accept=".txt,.md,text/plain"
              onChange={(e) => screen.onFile(e.target.files?.[0] ?? null)}
            />
            <Label htmlFor="paste">{o.orPasteText}</Label>
            <Textarea
              id="paste"
              value={screen.paste}
              onChange={(e) => screen.setPaste(e.target.value)}
              placeholder={t.settings.pastePlaceholder}
              rows={3}
            />
            {screen.fileError ? <p className="text-xs text-accent">{screen.fileError}</p> : null}
          </div>

          <Button type="button" className="w-full" onClick={screen.continue}>
            {ctaLabel}
          </Button>
          <button
            type="button"
            onClick={screen.skip}
            className="w-full py-3 text-center text-[15px] font-semibold text-foreground underline"
          >
            {o.skip}
          </button>
        </>
      ) : null}
    </div>
  );
}
