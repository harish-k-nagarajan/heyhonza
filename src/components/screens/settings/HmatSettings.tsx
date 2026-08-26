"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import {
  HmatSettingsCard,
  HmatSettingsDangerButton,
  HmatSettingsField,
  HmatSettingsHint,
  HmatSettingsIconWrap,
  HmatSettingsLevelTile,
  HmatSettingsMicroLabel,
  HmatSettingsPill,
  HmatSettingsPrimaryButton,
  HmatSettingsRowSubtitle,
  HmatSettingsRowTitle,
  HmatSettingsSecondaryButton,
  HmatSettingsSection,
  HmatSettingsSegment,
  HmatSettingsStatusBadge,
  HmatSettingsTextarea,
  HmatSettingsToggle,
  HmatSettingsTopicChip,
} from "@/components/screens/settings/HmatSettingsUi";
import { HmatSettingsHeader } from "@/components/screens/hmat/HmatUi";
import {
  DAILY_MESSAGE_COUNTS,
  MODEL_OPTIONS,
  ROUTES,
  type LevelId,
  type TopicId,
} from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { ProviderUiStatus, SettingsScreen } from "@/hooks/useSettingsScreen";
import { useLocale } from "@/lib/i18n/useLocale";

const TOPIC_ROWS: TopicId[][] = [
  ["daily", "travel", "food"],
  ["work", "grammar", "smalltalk"],
];

const LEVEL_ROWS: LevelId[][] = [
  ["A1", "A2"],
  ["B1", "B2"],
];

function formatDisplayTime(value: string): string {
  const [h, m] = value.split(":");
  if (!h || !m) return value;
  return `${h}:${m}`;
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="#E8432D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"
        stroke="#FF6B4A"
        strokeWidth="2"
      />
      <path
        d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"
        stroke="#FF6B4A"
        strokeWidth="2"
      />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" stroke="#FF6B4A" strokeWidth="2" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 10v4" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6v12" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 3v18" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 8v8" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 5v14" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 10v4" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m9 18 6-6-6-6"
        stroke="#9c9089"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v12" stroke="#9c9089" strokeWidth="2" strokeLinecap="round" />
      <path
        d="m7 8 5-5 5 5"
        stroke="#9c9089"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 21h14" stroke="#9c9089" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#9c9089" strokeWidth="2" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="#9c9089" strokeWidth="2" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" stroke="#9c9089" strokeWidth="2" />
    </svg>
  );
}

function SettingsFileDrop({
  hint,
  fileName,
  onFile,
}: {
  hint: string;
  fileName: string | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-14 w-full items-center gap-2.5 rounded-[14px] border border-black/10 bg-white px-3.5 text-left"
      >
        <UploadIcon />
        <span className="truncate font-sans text-sm text-[#243D2C]">
          {fileName ?? hint}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </>
  );
}

function providerBadge(
  status: ProviderUiStatus | null,
  s: ReturnType<typeof useLocale>["t"]["settings"],
) {
  if (!status || !status.connected) {
    return { connected: false, label: s.disconnected, tone: "off" as const };
  }
  if (status.source === "env") {
    return { connected: true, label: s.serverKey, tone: "ok" as const };
  }
  return { connected: true, label: s.yourKey, tone: "ok" as const };
}

function ProviderKeyEditor({
  status,
  busy,
  onSave,
  onDisconnect,
  pasteLabel,
  saveLabel,
  disconnectLabel,
}: {
  status: ProviderUiStatus | null;
  busy: boolean;
  onSave: (key: string) => Promise<string | null>;
  onDisconnect: () => Promise<void>;
  pasteLabel: string;
  saveLabel: string;
  disconnectLabel: string;
}) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <HmatSettingsField
        type="password"
        autoComplete="off"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder={pasteLabel}
        aria-label={pasteLabel}
      />
      {error ? <p className={cn(TYPE.helper, "text-accent")}>{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <HmatSettingsPrimaryButton
          disabled={busy || !key.trim()}
          onClick={() => {
            void (async () => {
              setError(null);
              const reason = await onSave(key.trim());
              if (reason) setError(reason);
              else setKey("");
            })();
          }}
        >
          {saveLabel}
        </HmatSettingsPrimaryButton>
        {status?.source === "user" ? (
          <HmatSettingsSecondaryButton
            disabled={busy}
            onClick={() => {
              void onDisconnect();
            }}
          >
            {disconnectLabel}
          </HmatSettingsSecondaryButton>
        ) : null}
      </div>
    </div>
  );
}

export function HmatSettings({ screen }: { screen: SettingsScreen }) {
  const { expression, contextChunks, lastSynced } = screen;
  const { locale, setLocale, t } = useLocale();
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

  const syncedDate =
    lastSynced > 0
      ? new Date(lastSynced).toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US")
      : "";

  const accountEmail = screen.accountEmail || s.accountEmailFallback;
  const accountCard = (
    <HmatSettingsCard className="flex items-center gap-3 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FFE5DC]">
        <span className="font-display text-[13px] font-bold text-accent">
          {(screen.accountName || "TY").slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[15px] font-bold text-[#243D2C]">{s.accountTitle}</p>
        <p className="font-sans text-[13px] text-[#9c9089]">
          {screen.accountName ? `${screen.accountName} · ${accountEmail}` : accountEmail}
        </p>
      </div>
      <ChevronRightIcon />
    </HmatSettingsCard>
  );

  const llmBadge = providerBadge(screen.llm, s);
  const ttsBadge = providerBadge(screen.tts, s);
  const modelOptions = [
    ...(screen.models.length > 0
      ? screen.models
      : MODEL_OPTIONS.map((m) => ({ id: m.id, label: m.label, free: false }))),
  ];
  if (!modelOptions.some((m) => m.id === screen.model)) {
    modelOptions.unshift({ id: screen.model, label: screen.model, free: false });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-2 [-webkit-overflow-scrolling:touch]">
      <HmatSettingsHeader orbState={expression.mood} kicker={s.kicker} title={s.title} />

      {screen.authConfigured ? (
        <Link href={ROUTES.account} className="block">
          {accountCard}
        </Link>
      ) : (
        accountCard
      )}

      <HmatSettingsSection label={s.sections.schedule}>
        <HmatSettingsCard className="p-1">
          <div className="flex items-center justify-between gap-3 px-3.5 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <HmatSettingsIconWrap>
                <MessageIcon />
              </HmatSettingsIconWrap>
              <div className="min-w-0">
                <p className="font-sans text-[15px] font-semibold text-[#2A2420]">
                  {s.scheduleTitle}
                </p>
                <HmatSettingsRowSubtitle>
                  {s.scheduleSubtitle(screen.dailyMessageCount)}
                </HmatSettingsRowSubtitle>
              </div>
            </div>
            <HmatSettingsToggle
              on={screen.scheduleEnabled}
              onChange={screen.setScheduleEnabled}
              ariaLabel={s.scheduleTitle}
            />
          </div>
          <p className="px-3.5 pb-3 font-sans text-[11px] leading-relaxed text-[#9c9089]">
            {s.scheduleHint}
          </p>
          {screen.pushHint ? (
            <p className="px-3.5 pb-3 font-sans text-[11px] text-accent">{screen.pushHint}</p>
          ) : null}

          {screen.scheduleEnabled ? (
            <>
              <div className="space-y-2 px-3.5 pb-3">
                <p className="font-sans text-xs font-semibold text-[#2A2420]">
                  {s.scheduleHowOften}
                </p>
                <div className="flex flex-wrap gap-2">
                  {DAILY_MESSAGE_COUNTS.map((count) => (
                    <HmatSettingsPill
                      key={count}
                      on={screen.dailyMessageCount === count}
                      onClick={() => screen.setDailyMessageCount(count)}
                    >
                      {count}×
                    </HmatSettingsPill>
                  ))}
                </div>
              </div>

              <div className="space-y-2 px-3.5 pb-3.5">
                <p className="font-sans text-xs font-semibold text-[#2A2420]">{s.scheduleWhen}</p>
                <div className="flex flex-wrap gap-2">
                  <HmatSettingsPill
                    on={screen.scheduleMode === "specific"}
                    onClick={() => screen.setScheduleMode("specific")}
                  >
                    {s.scheduleSpecificTime}
                  </HmatSettingsPill>
                  <HmatSettingsPill
                    on={screen.scheduleMode === "random"}
                    onClick={() => screen.setScheduleMode("random")}
                  >
                    {s.scheduleRandom}
                  </HmatSettingsPill>
                </div>

                {screen.scheduleMode === "specific" ? (
                  <div className="flex items-center justify-between rounded-[14px] border border-[#E8E2DC] bg-white px-4 py-3">
                    <span className="font-sans text-sm text-[#2A2420]">{s.scheduleFirstMessage}</span>
                    <label className="relative">
                      <span className="font-display text-base font-bold text-accent">
                        {formatDisplayTime(screen.firstMessageTime)}
                      </span>
                      <input
                        type="time"
                        value={screen.firstMessageTime}
                        onChange={(e) => screen.setFirstMessageTime(e.target.value)}
                        aria-label={s.scheduleFirstMessageAria}
                        className="absolute inset-0 opacity-0"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.appLanguage}>
        <HmatSettingsCard className="space-y-3 p-4">
          <HmatSettingsHint>{s.appLanguageHint}</HmatSettingsHint>
          <HmatSettingsSegment
            value={locale}
            options={[
              { value: "cs", label: s.languageCs },
              { value: "en", label: s.languageEn },
            ]}
            onChange={setLocale}
            ariaLabel={s.appLanguage}
          />
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.aiText}>
        <HmatSettingsCard className="space-y-3.5 p-4">
          <HmatSettingsHint>{s.aiTextHint}</HmatSettingsHint>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <HmatSettingsIconWrap>
                <BrainIcon />
              </HmatSettingsIconWrap>
              <div>
                <HmatSettingsRowTitle>{s.openRouterName}</HmatSettingsRowTitle>
                <HmatSettingsRowSubtitle>{s.openRouterDesc}</HmatSettingsRowSubtitle>
              </div>
            </div>
            <HmatSettingsStatusBadge
              connected={llmBadge.connected}
              connectedLabel={llmBadge.label}
              disconnectedLabel={s.disconnected}
              tone={llmBadge.tone}
            />
          </div>
          <ProviderKeyEditor
            status={screen.llm}
            busy={screen.providerBusy}
            onSave={(key) => screen.saveProviderKey("openrouter", key)}
            onDisconnect={() => screen.disconnectProvider("openrouter")}
            pasteLabel={s.pasteApiKey}
            saveLabel={s.saveKey}
            disconnectLabel={s.disconnect}
          />
          <div className="space-y-2">
            <HmatSettingsMicroLabel>{s.modelLabel}</HmatSettingsMicroLabel>
            <div className="relative">
              <select
                aria-label={s.modelLabel}
                className="h-12 w-full appearance-none rounded-[14px] border border-black/10 bg-white px-3.5 font-sans text-sm text-[#243D2C] outline-none"
                value={screen.model}
                onChange={(e) => screen.chooseModel(e.target.value)}
              >
                {modelOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.free ? `${m.label} · free` : m.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c9089]">
                ▾
              </span>
            </div>
          </div>
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.aiVoice}>
        <HmatSettingsCard className="space-y-3.5 p-4">
          <HmatSettingsHint>{s.aiVoiceHint}</HmatSettingsHint>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <HmatSettingsIconWrap className="bg-[#FFF0E8]">
                <AudioIcon />
              </HmatSettingsIconWrap>
              <div>
                <HmatSettingsRowTitle>{s.elevenLabsName}</HmatSettingsRowTitle>
                <HmatSettingsRowSubtitle>{s.elevenLabsDesc}</HmatSettingsRowSubtitle>
              </div>
            </div>
            <HmatSettingsStatusBadge
              connected={ttsBadge.connected}
              connectedLabel={ttsBadge.label}
              disconnectedLabel={s.disconnected}
              tone={ttsBadge.tone}
            />
          </div>
          <ProviderKeyEditor
            status={screen.tts}
            busy={screen.providerBusy}
            onSave={(key) => screen.saveProviderKey("elevenlabs", key)}
            onDisconnect={() => screen.disconnectProvider("elevenlabs")}
            pasteLabel={s.pasteApiKey}
            saveLabel={s.saveKey}
            disconnectLabel={s.disconnect}
          />
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.level}>
        <HmatSettingsCard className="space-y-3 p-4">
          <HmatSettingsHint>{s.levelHint}</HmatSettingsHint>
          <div className="flex flex-col gap-2">
            {LEVEL_ROWS.map((row) => (
              <div key={row.join("-")} className="flex gap-2">
                {row.map((id) => (
                  <HmatSettingsLevelTile
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
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.topics}>
        <HmatSettingsCard className="space-y-3 p-4">
          <HmatSettingsHint>{s.topicsHint}</HmatSettingsHint>
          {TOPIC_ROWS.map((row, i) => (
            <div key={i} className="flex gap-2">
              {row.map((topic) => (
                <HmatSettingsTopicChip
                  key={topic}
                  on={screen.topics.includes(topic)}
                  onClick={() => screen.toggleTopic(topic)}
                >
                  {t.topics[topic]}
                </HmatSettingsTopicChip>
              ))}
            </div>
          ))}
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.formality}>
        <HmatSettingsCard className="space-y-3 p-4">
          <HmatSettingsHint>{s.formalityHint}</HmatSettingsHint>
          <HmatSettingsSegment
            value={screen.formality}
            options={[
              { value: "ty", label: s.formalityTy },
              { value: "vy", label: s.formalityVy },
            ]}
            onChange={screen.setFormality}
            ariaLabel={s.sections.formality}
          />
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.context}>
        <HmatSettingsCard className="space-y-3.5 p-4">
          <HmatSettingsHint>{s.contextHint}</HmatSettingsHint>
          <p className="font-sans text-xs text-[#9c9089]">
            {lastSynced > 0
              ? s.contextSynced(syncedDate, contextChunks.length)
              : s.contextEmpty}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <HmatSettingsMicroLabel>{s.instructionsLabel}</HmatSettingsMicroLabel>
              {screen.pasteLoaded ? (
                <HmatSettingsStatusBadge
                  connected
                  connectedLabel={s.textLoaded}
                  disconnectedLabel={s.disconnected}
                />
              ) : null}
            </div>
            <HmatSettingsTextarea
              value={screen.paste}
              onChange={(e) => screen.setPaste(e.target.value)}
              placeholder={s.pastePlaceholder}
              aria-label={s.pastedTextAria}
            />
            <HmatSettingsSecondaryButton onClick={screen.savePaste} disabled={!screen.paste.trim() && !screen.pasteLoaded}>
              {screen.pasteLoaded ? s.updateText : s.addText}
            </HmatSettingsSecondaryButton>
          </div>

          <div className="space-y-2">
            <HmatSettingsMicroLabel>{s.googleDocLabel}</HmatSettingsMicroLabel>
            <HmatSettingsField
              value={screen.docUrl}
              onChange={(e) => screen.setDocUrl(e.target.value)}
              placeholder={s.googleDocPlaceholder}
              aria-label={s.googleDocAria}
            />
            {screen.docError ? (
              <p className={cn(TYPE.helper, "text-accent")}>{screen.docError}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <HmatSettingsPrimaryButton
                onClick={screen.importGoogleDoc}
                disabled={screen.docLoading || !screen.docUrl.trim()}
              >
                {screen.docLoading ? s.fetching : s.connectGoogleDoc}
              </HmatSettingsPrimaryButton>
              {screen.docError ? (
                <HmatSettingsStatusBadge
                  connected={false}
                  connectedLabel={s.googleDocConnected}
                  disconnectedLabel={s.googleDocFailed}
                  tone="warn"
                />
              ) : screen.docConnected ? (
                <HmatSettingsStatusBadge
                  connected
                  connectedLabel={s.googleDocConnected}
                  disconnectedLabel={s.disconnected}
                />
              ) : null}
              {screen.docConnected ? (
                <button
                  type="button"
                  className="font-sans text-[11px] font-bold text-accent"
                  onClick={screen.disconnectGoogleDoc}
                >
                  {s.disconnect}
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <HmatSettingsMicroLabel>{s.fileLabel}</HmatSettingsMicroLabel>
            <SettingsFileDrop
              hint={s.fileUploadHint}
              fileName={screen.fileName}
              onFile={screen.onFile}
            />
            {screen.fileName ? (
              <button
                type="button"
                className="font-sans text-[11px] font-bold text-accent"
                onClick={screen.disconnectFile}
              >
                {s.disconnect}
              </button>
            ) : null}
          </div>

          {contextChunks.length > 0 ? (
            <div className="space-y-2">
              <HmatSettingsMicroLabel>{s.activeSources}</HmatSettingsMicroLabel>
              <ul className="space-y-2">
                {contextChunks.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-[13px] font-bold text-[#243D2C]">
                        {c.meta.kind === "google_doc"
                          ? s.googleDocKind
                          : c.meta.kind === "file"
                            ? c.meta.name
                            : s.pastedText}
                      </p>
                      <p className="line-clamp-2 font-sans text-[11px] text-[#9c9089]">
                        {c.meta.kind === "google_doc" ? c.meta.url : c.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 font-sans text-[11px] font-bold text-accent"
                      onClick={() => screen.removeContext(c.id)}
                    >
                      {s.remove}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </HmatSettingsCard>
      </HmatSettingsSection>

      <HmatSettingsSection label={s.sections.deviceData}>
        <div className="space-y-2.5">
          <HmatSettingsDangerButton onClick={screen.resetData} icon={<DatabaseIcon />}>
            {s.resetData}
          </HmatSettingsDangerButton>
          <form action="/auth/signout" method="post" className="w-full">
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-black/10 bg-white font-display text-sm font-bold text-[#243D2C] transition active:scale-[0.99]"
            >
              {s.signOut}
            </button>
          </form>
        </div>
      </HmatSettingsSection>
    </div>
  );
}
