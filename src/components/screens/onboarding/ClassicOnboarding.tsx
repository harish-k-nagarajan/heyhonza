"use client";

import Link from "next/link";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Textarea } from "@/components/ui/Textarea";
import { LEVEL_OPTIONS, ROUTES, TOPIC_OPTIONS } from "@/lib/constants";
import type { LevelId } from "@/lib/constants";
import type { OnboardingScreen } from "@/hooks/useOnboardingScreen";

/** Classic onboarding — the shipped flow, byte-for-byte. */
export function ClassicOnboarding({ screen }: { screen: OnboardingScreen }) {
  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-app flex-col gap-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <HonzaOrb state="idle" size="hero" className="shrink-0" />
        <SectionLabel as="p">WELCOME</SectionLabel>
        <h1 className="font-sans text-lg tracking-[0.12em]">Ahoj! I&apos;m Honza</h1>
        <p className="mx-auto max-w-[min(320px,100%)] font-sans text-xs leading-relaxed tracking-[0.08em] text-muted-foreground">
          Tell me what you want to talk about and how much Czech you have — then
          I&apos;ll write to you first.
        </p>
      </header>

      <Card className="space-y-3">
        <SectionLabel>Your Czech level</SectionLabel>
        <p className="text-xs text-muted-foreground">
          Honza scales vocabulary and corrections to this.
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((l) => {
            const on = screen.level === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => screen.chooseLevel(l.id as LevelId)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Topics</SectionLabel>
        <p className="text-xs text-muted-foreground">Pick areas you care about.</p>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((t) => {
            const on = screen.topics.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => screen.toggleTopic(t.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Context · Google Doc</SectionLabel>
        <p className="text-xs text-muted-foreground">
          Notes, vocab, anything you&apos;re studying. Set the doc to Share →
          Anyone with the link → Viewer so Honza can read it.
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
          disabled={screen.docLoading}
          onClick={screen.importGoogleDoc}
        >
          {screen.docLoading ? "Fetching…" : "Import document"}
        </Button>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>File or pasted text</SectionLabel>
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
          rows={4}
        />
        {screen.fileError ? <p className="text-xs text-accent">{screen.fileError}</p> : null}
        <Button type="button" variant="secondary" onClick={screen.addPaste}>
          Add pasted text
        </Button>
      </Card>

      <Button type="button" className="w-full" onClick={screen.finish}>
        Start talking to Honza
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already set up?{" "}
        <Link href={ROUTES.settings} className="text-accent underline">
          Settings
        </Link>
      </p>
    </div>
  );
}
