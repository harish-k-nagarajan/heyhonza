import type { Metadata } from "next";
import Link from "next/link";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LEVEL_OPTIONS, ROUTES, TOPIC_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Honza — learn Czech by texting a friend",
  description:
    "Honza is a Czech tutor who opens the conversation. Short daily chats in real Czech, gently corrected.",
};

/**
 * The front door (BUILD_SPEC Phase 9): what a stranger sees before signing in.
 * Middleware sends signed-out visitors here from `/`, and bounces signed-in
 * users back to Home, so this page is only ever a first impression.
 *
 * The topic and level chips render from the same constants the onboarding and
 * settings screens use — the marketing surface can't drift from the product,
 * and nothing here is invented sample data (BUILD_SPEC §5).
 */
const STEPS = [
  {
    n: "01",
    title: "Honza starts",
    body: "Open the app and a message is already waiting — in Czech, about something you actually care about.",
  },
  {
    n: "02",
    title: "You reply in Czech",
    body: "Type it back. Badly is fine. Getting it wrong is the part where the learning happens.",
  },
  {
    n: "03",
    title: "He fixes it, kindly",
    body: "Honza corrects the slip, tells you why, and keeps the conversation going.",
  },
] as const;

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center gap-8 pb-4 text-center">
      <HonzaOrb state="idle" size="hero" className="shrink-0" />

      <div className="space-y-3">
        <SectionLabel as="p">AHOJ, JSEM HONZA</SectionLabel>
        <h1 className="font-sans text-[26px] leading-tight tracking-[0.08em] text-foreground">
          Learn Czech by
          <br />
          texting a friend
        </h1>
        <p className="mx-auto max-w-[min(320px,100%)] font-sans text-xs leading-relaxed tracking-[0.08em] text-muted-foreground">
          Not a streak. Not a leaderboard. Just Honza, writing to you in Czech
          every day — and waiting for you to write back.
        </p>
      </div>

      <Link
        href={ROUTES.signin}
        className="w-full max-w-[min(320px,100%)] rounded-full bg-accent py-3.5 font-sans text-xs uppercase tracking-[0.2em] text-accent-foreground shadow-sm shadow-black/10 transition hover:opacity-90 active:scale-[0.98]"
      >
        Start learning Czech
      </Link>
      <p className="-mt-5 font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Free. Takes a minute.
      </p>

      <Card className="w-full space-y-4 text-left">
        <SectionLabel>How it works</SectionLabel>
        <ol className="space-y-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span
                className="shrink-0 font-sans text-[11px] tracking-[0.2em] text-accent"
                aria-hidden
              >
                {s.n}
              </span>
              <div className="space-y-1">
                <p className="font-sans text-[13px] tracking-[0.08em] text-foreground">
                  {s.title}
                </p>
                <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="w-full space-y-3 text-left">
        <SectionLabel>What you&apos;ll talk about</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((t) => (
            <span
              key={t.id}
              className="rounded-full border border-border bg-muted px-3 py-1.5 font-sans text-xs text-muted-foreground"
            >
              {t.label}
            </span>
          ))}
        </div>
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          Pick your topics when you sign up — and paste in your own notes or a
          Google Doc so Honza talks about your Czech, not a textbook&apos;s.
        </p>
      </Card>

      <Card className="w-full space-y-3 text-left">
        <SectionLabel>Meets you at your level</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((l) => (
            <span
              key={l.id}
              className="rounded-full border border-border bg-muted px-3 py-1.5 font-sans text-xs text-muted-foreground"
            >
              {l.label}
            </span>
          ))}
        </div>
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          Honza scales his vocabulary and how hard he corrects you to match.
        </p>
      </Card>

      <div className="space-y-3 pt-2">
        <Link
          href={ROUTES.signin}
          className="inline-block font-sans text-xs uppercase tracking-[0.2em] text-accent underline underline-offset-4 transition hover:opacity-80"
        >
          Get started
        </Link>
        <p className="mx-auto max-w-[min(300px,100%)] font-sans text-[10px] leading-relaxed tracking-[0.1em] text-muted-foreground">
          Add Honza to your home screen and he lives on your phone like any
          other app.
        </p>
      </div>
    </div>
  );
}
