"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { LEVEL_OPTIONS, MODEL_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";
import type { LevelId, ModelId } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { SettingsScreen } from "@/hooks/useSettingsScreen";
import { HmatBadge, HmatFileInput } from "@/components/screens/hmat/HmatChrome";

import { PushNotificationSettings } from "@/components/pwa/PushNotificationSettings";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/useLocale";

/**
 * Hmat Settings — the profile form and context documents in tactile material,
 * led by Honza. Same behaviour as Classic Settings (`useSettingsScreen`).
 */

function Chip({
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
        "rounded-full border px-3.5 py-1.5 font-sans text-xs transition",
        on
          ? "border-accent bg-accent/[0.12] text-accent"
          : "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className={cn(TYPE.label, "text-muted-foreground")}>{children}</p>;
}

export function HmatSettings({ screen }: { screen: SettingsScreen }) {
  const { expression, contextChunks, lastSynced } = screen;
  const { t } = useLocale();

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

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <HmatOrb state={expression.mood} size={44} breathe={false} />
          <div>
            <p className={cn(TYPE.label, "text-muted-foreground")}>{"// Nastavení"}</p>
            <p className={cn(TYPE.body, "text-foreground")}>Jak s tebou Honza mluví</p>
          </div>
        </div>
        <HmatBadge label={expression.czLabel} />
      </header>

      <section className="mat px-4 py-4">
        <PushNotificationSettings />
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <FieldLabel>{t.settings.appLanguage}</FieldLabel>
        <LanguageSwitcher />
      </section>

      <section className="mat space-y-2 px-4 py-4">
        <FieldLabel>Server</FieldLabel>
        <p className={TYPE.subtitle}>
          OpenRouter:{" "}
          {screen.serverOk === null
            ? "…"
            : screen.serverOk
              ? "připojeno"
              : "chybí OPENROUTER_API_KEY"}
        </p>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <FieldLabel>Úroveň češtiny</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((l) => (
            <Chip
              key={l.id}
              on={screen.level === l.id}
              pressed={screen.level === l.id}
              onClick={() => screen.chooseLevel(l.id as LevelId)}
            >
              {l.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <FieldLabel>Model</FieldLabel>
        <select
          aria-label="Model"
          className="h-11 w-full rounded-[14px] border border-border bg-card px-3 font-sans text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
          value={screen.model}
          onChange={(e) => screen.chooseModel(e.target.value as ModelId)}
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <FieldLabel>Témata</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((topic) => (
            <Chip
              key={topic.id}
              on={screen.topics.includes(topic.id)}
              onClick={() => screen.toggleTopic(topic.id)}
            >
              {topic.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <FieldLabel>Kontext</FieldLabel>
        <p className={TYPE.helper}>
          {lastSynced > 0
            ? `Naposledy ${new Date(lastSynced).toLocaleDateString()} · ${contextChunks.length} zdroj${contextChunks.length === 1 ? "" : "ů"}, ze kterých Honza čte.`
            : "Zatím nic. Přidej Google Doc, soubor nebo text, ať Honza ví, co se učíš."}
        </p>
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
        <button
          type="button"
          onClick={screen.importGoogleDoc}
          disabled={screen.docLoading}
          className={cn(
            "mat-key press w-full rounded-[14px] py-2.5 text-accent disabled:opacity-40",
            TYPE.button,
          )}
        >
          {screen.docLoading ? "Načítám…" : "Přidat z Google Docs"}
        </button>
        <textarea
          value={screen.paste}
          onChange={(e) => screen.setPaste(e.target.value)}
          rows={3}
          placeholder="…nebo vlož text"
          aria-label="Pasted text"
          className="mat-field w-full resize-none rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={screen.addPaste}
          className={cn("mat-key press w-full rounded-[14px] py-2.5 text-accent", TYPE.button)}
        >
          Přidat text
        </button>
        <div className="space-y-1.5">
          <p className={TYPE.helper}>Soubor (.txt, .md)</p>
          <HmatFileInput onFile={screen.onFile} />
        </div>
        <ul className="space-y-2">
          {contextChunks.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-2 rounded-[12px] border border-border bg-card px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p className="font-sans font-medium text-foreground">
                  {c.meta.kind === "google_doc"
                    ? "Google Doc"
                    : c.meta.kind === "file"
                      ? c.meta.name
                      : c.meta.label}
                </p>
                <p className="line-clamp-2 font-sans text-muted-foreground">{c.text}</p>
              </div>
              <button
                type="button"
                className="shrink-0 font-sans text-accent underline"
                onClick={() => screen.removeContext(c.id)}
              >
                Odebrat
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <FieldLabel>Data zařízení</FieldLabel>
        <button
          type="button"
          onClick={screen.resetData}
          className={cn("mat-key press w-full rounded-[14px] py-2.5 text-accent", TYPE.button)}
        >
          Smazat data a projít onboarding znovu
        </button>
        {/* Hmat Home leads with the character, not chrome — so sign-out lives
            here (Classic keeps it on Home). No dead ends. */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className={cn(
              "w-full py-1 underline text-muted-foreground",
              TYPE.label,
            )}
          >
            Odhlásit se
          </button>
        </form>
      </section>
    </div>
  );
}
