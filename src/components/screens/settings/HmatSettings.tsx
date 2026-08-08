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
  hint,
  selected,
  onClick,
}: {
  id: LevelId;
  hint: string;
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
        {hint}
      </span>
    </button>
  );
}

export function HmatSettings({ screen }: { screen: SettingsScreen }) {
  const { expression, contextChunks, lastSynced } = screen;
  const { locale, t } = useLocale();
  const s = t.settings;

  if (!screen.ready) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center uppercase text-muted-foreground",
          TYPE.meta,
        )}
      >
        {s.loading}
      </div>
    );
  }

  const levelRows: LevelId[][] = [
    ["A1", "A2"],
    ["B1", "B2"],
  ];

  const topicRows = [TOPIC_OPTIONS.slice(0, 3), TOPIC_OPTIONS.slice(3, 6)];

  const syncedDate =
    lastSynced > 0
      ? new Date(lastSynced).toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US")
      : "";

  return (
    <div className="flex flex-1 flex-col gap-5 pb-2">
      <HmatSettingsHeader orbState={expression.mood} kicker={s.kicker} title={s.title} />

      <HmatFrostCard className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FFE5DC]">
          <span className="font-display text-[13px] font-bold text-accent">TY</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-bold text-[#243D2C]">{s.accountTitle}</p>
          <p className="font-sans text-[13px] text-[#9c9089]">ahoj@honza.app</p>
        </div>
      </HmatFrostCard>

      <section className="space-y-2.5">
        <HmatSectionLabel>{s.sections.notifications}</HmatSectionLabel>
        <HmatFrostCard className="p-1">
          <PushNotificationSettings />
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>{s.sections.appLanguage}</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>{s.appLanguage}</p>
          <LanguageSwitcher />
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>{s.sections.server}</HmatSectionLabel>
        <HmatFrostCard className="p-4">
          <p className={TYPE.subtitle}>
            OpenRouter:{" "}
            {screen.serverOk === null
              ? s.serverChecking
              : screen.serverOk
                ? s.serverConfigured
                : s.serverMissing}
          </p>
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>{s.sections.level}</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>{s.levelHint}</p>
          <div className="flex flex-col gap-2">
            {levelRows.map((row) => (
              <div key={row.join("-")} className="flex gap-2">
                {row.map((id) => (
                  <LevelTile
                    key={id}
                    id={id}
                    hint={s.levelHints[id]}
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
        <HmatSectionLabel>{s.sections.model}</HmatSectionLabel>
        <HmatFrostCard className="p-4">
          <select
            aria-label={s.sections.model}
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
        <HmatSectionLabel>{s.sections.topics}</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>{s.topicsHint}</p>
          {topicRows.map((row, i) => (
            <div key={i} className="flex gap-2">
              {row.map((topic) => (
                <TopicChip
                  key={topic.id}
                  on={screen.topics.includes(topic.id)}
                  onClick={() => screen.toggleTopic(topic.id)}
                >
                  {t.topics[topic.id]}
                </TopicChip>
              ))}
            </div>
          ))}
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>{s.sections.context}</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <p className={cn(TYPE.helper, "text-[#9c9089]")}>
            {lastSynced > 0
              ? s.contextSynced(syncedDate, contextChunks.length)
              : s.contextEmpty}
          </p>
          <input
            value={screen.docUrl}
            onChange={(e) => screen.setDocUrl(e.target.value)}
            placeholder={s.googleDocPlaceholder}
            aria-label={s.googleDocAria}
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
            {screen.docLoading ? s.fetching : s.addFromGoogleDocs}
          </Button>
          <textarea
            value={screen.paste}
            onChange={(e) => screen.setPaste(e.target.value)}
            rows={3}
            placeholder={s.pastePlaceholder}
            aria-label={s.pastedTextAria}
            className="hmat-frost-field w-full resize-none rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-[#243D2C] outline-none"
          />
          <Button type="button" surface="mat-key" shape="card" size="md" onClick={screen.addPaste}>
            {s.addText}
          </Button>
          <div className="space-y-1.5">
            <p className={TYPE.helper}>{s.fileLabel}</p>
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
                      ? s.googleDocKind
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
                  {s.remove}
                </button>
              </li>
            ))}
          </ul>
        </HmatFrostCard>
      </section>

      <section className="space-y-2.5">
        <HmatSectionLabel>{s.sections.deviceData}</HmatSectionLabel>
        <HmatFrostCard className="space-y-3 p-4">
          <Button type="button" surface="mat-key" shape="card" size="md" onClick={screen.resetData}>
            {s.resetData}
          </Button>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className={cn("w-full py-1 underline text-[#9c9089]", TYPE.label)}
            >
              {s.signOut}
            </button>
          </form>
        </HmatFrostCard>
      </section>
    </div>
  );
}
