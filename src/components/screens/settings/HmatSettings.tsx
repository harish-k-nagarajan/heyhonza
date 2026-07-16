"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { LEVEL_OPTIONS, MODEL_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";
import type { LevelId, ModelId } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { SettingsScreen } from "@/hooks/useSettingsScreen";
import { HmatBadge } from "@/components/screens/hmat/HmatChrome";

import { DesignLab } from "./DesignLab";

/**
 * Hmat Settings — the profile form and context documents in tactile material,
 * led by Honza and hosting the Design Lab. Same behaviour as Classic Settings
 * (`useSettingsScreen`).
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

export function HmatSettings({ screen }: { screen: SettingsScreen }) {
  const { expression, contextChunks, lastSynced } = screen;

  if (!screen.ready) {
    return (
      <div className="flex flex-1 items-center justify-center font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Načítání…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <header className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <HmatOrb state={expression.mood} size={44} breathe={false} />
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {"// Nastavení"}
            </p>
            <p className="font-sans text-[15px] text-foreground">Jak s tebou Honza mluví</p>
          </div>
        </div>
        <HmatBadge label={expression.czLabel} />
      </header>

      <DesignLab />

      <section className="mat space-y-2 px-4 py-4">
        <Label>Server</Label>
        <p className="font-sans text-sm text-muted-foreground">
          OpenRouter:{" "}
          {screen.serverOk === null
            ? "…"
            : screen.serverOk
              ? "připojeno"
              : "chybí OPENROUTER_API_KEY"}
        </p>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <Label>Úroveň češtiny</Label>
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
        <Label>Model</Label>
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
        <Label>Témata</Label>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((t) => (
            <Chip
              key={t.id}
              on={screen.topics.includes(t.id)}
              onClick={() => screen.toggleTopic(t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <Label>Kontext</Label>
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
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
          <p className="font-sans text-xs text-accent">{screen.docError}</p>
        ) : null}
        <button
          type="button"
          onClick={screen.importGoogleDoc}
          disabled={screen.docLoading}
          className="mat-key press w-full rounded-[14px] py-2.5 font-display text-[11px] uppercase tracking-[0.14em] text-accent disabled:opacity-40"
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
          className="mat-key press w-full rounded-[14px] py-2.5 font-display text-[11px] uppercase tracking-[0.14em] text-accent"
        >
          Přidat text
        </button>
        <label className="font-sans text-xs text-muted-foreground">
          Soubor (.txt, .md)
          <input
            type="file"
            accept=".txt,.md,text/plain"
            onChange={(e) => screen.onFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full font-sans text-xs text-muted-foreground"
          />
        </label>
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
        <Label>Data zařízení</Label>
        <button
          type="button"
          onClick={screen.resetData}
          className="mat-key press w-full rounded-[14px] py-2.5 font-display text-[11px] uppercase tracking-[0.14em] text-accent"
        >
          Smazat data a projít onboarding znovu
        </button>
      </section>
    </div>
  );
}
