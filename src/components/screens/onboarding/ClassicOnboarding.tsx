"use client";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  DAILY_MESSAGE_COUNTS,
  LEVEL_OPTIONS,
  ONBOARDING_LEVEL_DETAILS,
  ONBOARDING_TOPIC_LABELS,
  type LevelId,
  type TopicId,
} from "@/lib/constants";
import type { OnboardingScreen } from "@/hooks/useOnboardingScreen";

const TOPIC_ROWS: TopicId[][] = [
  ["daily", "travel", "food"],
  ["work", "grammar", "smalltalk"],
];

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {[1, 2, 3, 4, 5].map((dot) => (
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

/** Classic onboarding — same 5-step flow with legacy flat chrome. */
export function ClassicOnboarding({ screen }: { screen: OnboardingScreen }) {
  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const ctaLabel = screen.step === 5 ? "Start chatting" : "Continue";

  return (
    <div className="mx-auto flex max-w-app flex-col gap-5">
      <ProgressDots step={screen.step} />

      {screen.step === 1 ? (
        <>
          <header className="flex flex-col items-center gap-4 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              STEP 1 OF 5
            </p>
            <HonzaOrb state="idle" size="hero" className="shrink-0" />
            <h1 className="font-sans text-lg tracking-[0.12em]">Ahoj! Jsem Honza.</h1>
            <p className="mx-auto max-w-[min(320px,100%)] font-sans text-sm leading-relaxed text-muted-foreground">
              I&apos;ll write to you in Czech about real things. You reply. I fix your
              mistakes — kindly.
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
              STEP 2 OF 5
            </p>
            <h1 className="font-sans text-lg tracking-[0.12em]">What&apos;s your level?</h1>
            <p className="text-sm text-muted-foreground">
              Honza adapts to where you are — from first sentences to almost fluent.
            </p>
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
                    {ONBOARDING_LEVEL_DETAILS[option.id as LevelId]}
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
              STEP 3 OF 5
            </p>
            <h1 className="font-sans text-lg tracking-[0.12em]">What do you want to talk about?</h1>
            <p className="text-sm text-muted-foreground">
              Pick topics you care about — not textbook phrases.
            </p>
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
                      {ONBOARDING_TOPIC_LABELS[topicId]}
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
              STEP 4 OF 5
            </p>
            <h1 className="font-sans text-lg tracking-[0.12em]">When should Honza write?</h1>
            <p className="text-sm text-muted-foreground">
              Honza can message you 1–3 times a day. Pick a time or let it feel random.
            </p>
          </div>

          <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            HOW OFTEN
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
            WHEN
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
                  {mode === "specific" ? "Specific time" : "Random"}
                </button>
              );
            })}
          </div>

          {screen.scheduleMode === "specific" ? (
            <div className="flex items-center justify-between rounded-card border border-border bg-muted px-4 py-3">
              <span className="text-sm text-foreground">First message</span>
              <label className="relative">
                <span className="text-sm font-semibold text-accent">
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

          <Button type="button" className="w-full" onClick={screen.continue}>
            {ctaLabel}
          </Button>
        </>
      ) : null}

      {screen.step === 5 ? (
        <>
          <div className="space-y-2 text-center">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              STEP 5 OF 5 · OPTIONAL
            </p>
            <h1 className="font-sans text-lg tracking-[0.12em]">Teach Honza about you</h1>
            <p className="text-sm text-muted-foreground">
              Add a Google Doc, file, or paste — or skip and add this later in Settings.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              GOOGLE DOC
            </p>
            <p className="text-xs text-muted-foreground">
              Set the doc to Share → Anyone with the link → Viewer so Honza can read it.
            </p>
            <Label htmlFor="doc-url">Document URL</Label>
            <Input
              id="doc-url"
              value={screen.docUrl}
              onChange={(e) => screen.setDocUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/…"
            />
            {screen.docError ? <p className="text-xs text-accent">{screen.docError}</p> : null}
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={screen.docLoading}
              onClick={screen.importGoogleDoc}
            >
              {screen.docLoading ? "Fetching…" : "Import document"}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              FILE OR PASTE
            </p>
            <Label htmlFor="file">File (.txt, .md)</Label>
            <Input
              id="file"
              type="file"
              accept=".txt,.md,text/plain"
              onChange={(e) => screen.onFile(e.target.files?.[0] ?? null)}
            />
            <Label htmlFor="paste">Or paste text</Label>
            <Textarea
              id="paste"
              value={screen.paste}
              onChange={(e) => screen.setPaste(e.target.value)}
              placeholder="Anything Honza should know about you…"
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
            Skip for now
          </button>
        </>
      ) : null}
    </div>
  );
}
