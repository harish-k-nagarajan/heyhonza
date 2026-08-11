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

import { PushNotificationSettings } from "@/components/pwa/PushNotificationSettings";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/useLocale";

/**
 * Classic Settings presentation. Behaviour comes from `useSettingsScreen`.
 */
export function ClassicSettings({ screen }: { screen: SettingsScreen }) {
  const { expression, contextChunks, lastSynced } = screen;
  const { locale, t } = useLocale();
  const s = t.settings;

  if (!screen.ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {s.loading}
      </div>
    );
  }

  const syncedDate =
    lastSynced > 0
      ? new Date(lastSynced).toLocaleString(locale === "cs" ? "cs-CZ" : "en-US")
      : "";

  return (
    <div className="mx-auto flex max-w-app flex-col gap-6">
      {/* Settings was the one primary surface with no Honza on it at all, which
          breaks DESIGN.md's "every screen leads with the character". */}
      <header className="flex items-center gap-3">
        <HonzaOrb state={expression.mood} size="avatar" className="shrink-0" />
        <div className="space-y-1">
          <SectionLabel as="p">{s.kicker}</SectionLabel>
          <h1 className="font-sans text-lg leading-tight tracking-[0.12em]">{s.title}</h1>
        </div>
      </header>
      <p className="-mt-3 font-sans text-xs leading-relaxed tracking-[0.08em] text-muted-foreground">
        {s.subtitle}
      </p>

      <Card className="space-y-3">
        <SectionLabel as="p">{s.appLanguage}</SectionLabel>
        <LanguageSwitcher />
      </Card>

      <Card className="space-y-3">
        <PushNotificationSettings />
      </Card>

      <Card className="space-y-2">
        <SectionLabel>{s.serverStatus}</SectionLabel>
        <p className="text-sm text-muted-foreground">
          OpenRouter env on server:{" "}
          {screen.llmOk === null
            ? s.serverChecking
            : screen.llmOk
              ? s.serverConfigured
              : s.serverMissing}
        </p>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>{s.sections.level}</SectionLabel>
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
                {t.levels.option[l.id as LevelId]}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>{s.modelLabel}</SectionLabel>
        <Label htmlFor="model" className="sr-only">
          {s.modelLabel}
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
        <SectionLabel>{s.sections.topics}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((topic) => {
            const on = screen.topics.includes(topic.id);
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => screen.toggleTopic(topic.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {t.topics[topic.id]}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>{s.sections.context}</SectionLabel>
        <p className="text-xs text-muted-foreground">
          {lastSynced > 0
            ? s.contextSynced(syncedDate, contextChunks.length)
            : s.contextEmpty}
        </p>
        <Label htmlFor="s-doc">{s.googleDocLabel}</Label>
        <Input
          id="s-doc"
          value={screen.docUrl}
          onChange={(e) => screen.setDocUrl(e.target.value)}
          placeholder={s.googleDocPlaceholder}
        />
        {screen.docError ? <p className="text-xs text-accent">{screen.docError}</p> : null}
        <Button
          type="button"
          variant="secondary"
          disabled={screen.docLoading}
          onClick={screen.importGoogleDoc}
        >
          {screen.docLoading ? s.fetching : s.addFromGoogleDocs}
        </Button>
        <Label htmlFor="s-paste">{s.pastedText}</Label>
        <Textarea
          id="s-paste"
          value={screen.paste}
          onChange={(e) => screen.setPaste(e.target.value)}
          rows={3}
        />
        <Button type="button" variant="secondary" onClick={screen.addPaste}>
          {s.addText}
        </Button>
        <Label htmlFor="s-file">{s.fileLabel}</Label>
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
                    ? s.googleDocKind
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
                {s.remove}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>{s.sections.deviceData}</SectionLabel>
        <Button type="button" variant="secondary" onClick={screen.resetData}>
          {s.resetData}
        </Button>
      </Card>
    </div>
  );
}
