"use client";

import { Button } from "@/components/ui/Button";
import { MODEL_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";
import type { LevelId, ModelId } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { SettingsScreen } from "@/hooks/useSettingsScreen";
import { HmatFileInput } from "@/components/screens/hmat/HmatChrome";
import {
  HmatFrostCard,
  HmatSectionLabel,
  HmatSettingsHeader,
} from "@/components/screens/hmat/HmatUi";

import { PushNotificationSettings } from "@/components/pwa/PushNotificationSettings";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/useLocale";

const LEVEL_HINTS: Record<LevelId, string> = {
  A1: "Start",
  A2: "Základ",
  B1: "Dál",
  B2: "Pokroč.",
};

function TopicChip({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex-1 rounded-full px-3 py-2.5 text-center font-sans text-xs transition",
        on
          ? "bg-[#FFE5DC] font-bold text-accent outline outline-1 outline-accent/30"
          : "bg-white text-[#243D2C] outline outline-1 outline-black/10",
      )}
    >
      {children}
    </button>
  );
}

function LevelTile({
  id,
  selected,
  onClick,
}: {
  id: LevelId;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 flex-col items-center rounded-[14px] px-2.5 py-3 transition",
        selected
          ? "bg-[#FFE5DC] outline outline-1 outline-accent/30"
          : "bg-white outline outline-1 outline-black/10",
      )}
    >
      <span
        className={cn(
          "font-display text-base font-bold",
          selected ? "text-accent" : "text-[#243D2C]",
        )}
      >
        {id}
      </span>
      <span
        className={cn(
          "mt-0.5 font-sans text-[11px]",
          selected ? "text-accent" : "text-[#9c9089]",
        )}
      >
        {LEVEL_HINTS[id]}
      </span>
    </button>
  );
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

  const levelRows: LevelId[][] = [
    ["A1", "A2"],
    ["B1", "B2"],
  ];

  const topicRows = [TOPIC_OPTIONS.slice(0, 3), TOPIC_OPTIONS.slice(3, 6)];

  return (
    <div className="flex flex-1 flex-col gap-5 pb-2">
      <HmatSettingsHeader
        orbState={expression.mood}
        kicker="NASTAVENÍ"
        title="Jak s tebou Honza mluví"
      />

      <HmatFrostCard className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FFE5DC]">
          <span className="font-display text-[13px] font-bold text-accent">TY</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-bold text-[#243D2C]">Tvůj účet</p>
          <p className="font-sans text-[13px] text-[#9c9089]">ahoj@honza.app</p>
        </div>
      </HmatFrostCard>

      <section className="space-y-2.5">
        <HmatSectionLabel>OZNÁMENÍ</HmatSectionLabel>
        <HmatFrostCard className="p-1">
          <PushNotificationSettings />
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>JAZYK APLIKACE</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>{t.settings.appLanguage}</p>
          <LanguageSwitcher />
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>SERVER</HmatSectionLabel>
        <HmatFrostCard className="p-4">
          <p className={TYPE.subtitle}>
            OpenRouter:{" "}
            {screen.serverOk === null
              ? "…"
              : screen.serverOk
                ? "připojeno"
                : "chybí OPENROUTER_API_KEY"}
          </p>
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>ÚROVEŇ UČENÍ</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>
            Honza přizpůsobí tempo, slovní zásobu a obtížnost.
          </p>
          <div className="flex flex-col gap-2">
            {levelRows.map((row) => (
              <div key={row.join("-")} className="flex gap-2">
                {row.map((id) => (
                  <LevelTile
                    key={id}
                    id={id}
                    selected={screen.level === id}
                    onClick={() => screen.chooseLevel(id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>MODEL</HmatSectionLabel>
        <HmatFrostCard className="p-4">
          <select
            aria-label="Model"
            className="hmat-frost-field h-11 w-full rounded-[14px] bg-transparent px-3 font-sans text-sm text-[#243D2C] outline-none"
            value={screen.model}
            onChange={(e) => screen.chooseModel(e.target.value as ModelId)}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>TÉMATA</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>
            Vyber témata, o kterých chceš s Honzou mluvit.
          </p>
          {topicRows.map((row, i) => (
            <div key={i} className="flex gap-2">
              {row.map((topic) => (
                <TopicChip
                  key={topic.id}
                  on={screen.topics.includes(topic.id)}
                  onClick={() => screen.toggleTopic(topic.id)}
                >
                  {topic.label}
                </TopicChip>
              ))}
            </div>
          ))}
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>KONTEXT</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>
            {lastSynced > 0
              ? `Naposledy ${new Date(lastSynced).toLocaleDateString()} · ${contextChunks.length} zdroj${contextChunks.length === 1 ? "" : "ů"}, ze kterých Honza čte.`
              : "Zatím nic. Přidej Google Doc, soubor nebo text, ať Honza ví, co se učíš."}
          </p>
          <input
            value={screen.docUrl}
            onChange={(e) => screen.setDocUrl(e.target.value)}
            placeholder="https://docs.google.com/document/d/…"
            aria-label="Google Doc URL"
            className="hmat-frost-field w-full rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-[#243D2C] outline-none"
          />
          {screen.docError ? (
            <p className={cn(TYPE.helper, "text-accent")}>{screen.docError}</p>
          ) : null}
          <Button
            type="button"
            surface="mat-key"
            shape="card"
            size="md"
            onClick={screen.importGoogleDoc}
            disabled={screen.docLoading}
          >
            {screen.docLoading ? "Načítám…" : "Přidat z Google Docs"}
          </Button>
          <textarea
            value={screen.paste}
            onChange={(e) => screen.setPaste(e.target.value)}
            rows={3}
            placeholder="…nebo vlož text"
            aria-label="Pasted text"
            className="hmat-frost-field w-full resize-none rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-[#243D2C] outline-none"
          />
          <Button type="button" surface="mat-key" shape="card" size="md" onClick={screen.addPaste}>
            Přidat text
          </Button>
          <div className="space-y-1.5">
            <p className={TYPE.helper}>Soubor (.txt, .md)</p>
            <HmatFileInput onFile={screen.onFile} />
          </div>
          <ul className="space-y-2">
            {contextChunks.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-2 rounded-[12px] border border-black/10 bg-white px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-sans font-medium text-[#243D2C]">
                    {c.meta.kind === "google_doc"
                      ? "Google Doc"
                      : c.meta.kind === "file"
                        ? c.meta.name
                        : c.meta.label}
                  </p>
                  <p className="line-clamp-2 font-sans text-[#9c9089]">{c.text}</p>
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
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>DATA ZAŘÍZENÍ</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <Button type="button" surface="mat-key" shape="card" size="md" onClick={screen.resetData}>
            Smazat data a projít onboarding znovu
          </Button>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className={cn("w-full py-1 underline text-[#9c9089]", TYPE.label)}
            >
              Odhlásit se
            </button>
          </form>
        </HmatFrostCard>
      </section>
    </div>
  );
}
