"use client";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Textarea } from "@/components/ui/Textarea";
import { LEVEL_OPTIONS, MODEL_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";
import type { LevelId, ModelId } from "@/lib/constants";
import type { SettingsScreen } from "@/hooks/useSettingsScreen";

import { DesignLab } from "./DesignLab";
import { PushNotificationSettings } from "@/components/pwa/PushNotificationSettings";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/useLocale";

/**
 * Classic Settings presentation — the shipped app, byte-for-byte, plus the
 * Design Lab section (Phase 6). Behaviour comes from `useSettingsScreen`.
 */
export function ClassicSettings({ screen }: { screen: SettingsScreen }) {
  const { expression, contextChunks, lastSynced } = screen;
  const { t } = useLocale();

  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-app flex-col gap-6">
      {/* Settings was the one primary surface with no Honza on it at all, which
          breaks DESIGN.md's "every screen leads with the character". */}
      <header className="flex items-center gap-3">
        <HonzaOrb state={expression.mood} size="avatar" className="shrink-0" />
        <div className="space-y-1">
          <SectionLabel as="p">Settings</SectionLabel>
          <h1 className="font-sans text-lg leading-tight tracking-[0.12em]">
            How Honza talks to you
          </h1>
        </div>
      </header>
      <p className="-mt-3 font-sans text-xs leading-relaxed tracking-[0.08em] text-muted-foreground">
        Change your level, your topics, and what Honza knows about you.
      </p>

      <DesignLab />

      <Card className="space-y-3">
        <SectionLabel as="p">{t.settings.appLanguage}</SectionLabel>
        <LanguageSwitcher />
      </Card>

      <Card className="space-y-3">
        <PushNotificationSettings />
      </Card>

      <Card className="space-y-2">
        <SectionLabel>Server status</SectionLabel>
        <p className="text-sm text-muted-foreground">
          OpenRouter env on server:{" "}
          {screen.serverOk === null
            ? "…"
            : screen.serverOk
              ? "configured"
              : "missing OPENROUTER_API_KEY"}
        </p>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Czech level</SectionLabel>
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
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Model</SectionLabel>
        <Label htmlFor="model" className="sr-only">
          Model
        </Label>
        <select
          id="model"
          className="h-11 w-full rounded-card border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
          value={screen.model}
          onChange={(e) => screen.chooseModel(e.target.value as ModelId)}
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Topics</SectionLabel>
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
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Context documents</SectionLabel>
        <p className="text-xs text-muted-foreground">
          {lastSynced > 0
            ? `Last synced ${new Date(lastSynced).toLocaleString()} · ${contextChunks.length} source${contextChunks.length === 1 ? "" : "s"} Honza reads from.`
            : "No context yet. Add a Google Doc, file, or paste to teach Honza what you're learning."}
        </p>
        <Label htmlFor="s-doc">Google Doc (public link)</Label>
        <Input
          id="s-doc"
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
          {screen.docLoading ? "Fetching…" : "Add from Google Docs"}
        </Button>
        <Label htmlFor="s-paste">Pasted text</Label>
        <Textarea
          id="s-paste"
          value={screen.paste}
          onChange={(e) => screen.setPaste(e.target.value)}
          rows={3}
        />
        <Button type="button" variant="secondary" onClick={screen.addPaste}>
          Add text
        </Button>
        <Label htmlFor="s-file">File (.txt, .md)</Label>
        <Input
          id="s-file"
          type="file"
          accept=".txt,.md,text/plain"
          onChange={(e) => screen.onFile(e.target.files?.[0] ?? null)}
        />
        <ul className="space-y-2">
          {contextChunks.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {c.meta.kind === "google_doc"
                    ? "Google Doc"
                    : c.meta.kind === "file"
                      ? c.meta.name
                      : c.meta.label}
                </p>
                <p className="line-clamp-2 text-muted-foreground">{c.text}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-accent underline"
                onClick={() => screen.removeContext(c.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Device data</SectionLabel>
        <Button type="button" variant="secondary" onClick={screen.resetData}>
          Reset data and run onboarding again
        </Button>
      </Card>
    </div>
  );
}
