"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { HmatProviderKeyRow } from "@/components/screens/settings/HmatProviderKeyEditor";
import { HmatSettingsIconWrap } from "@/components/screens/settings/HmatSettingsUi";
import type { ProviderUiStatus } from "@/hooks/useSettingsScreen";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h10M4 18h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type ProviderBlockProps = {
  title: string;
  description: string;
  status: ProviderUiStatus | null;
  busy: boolean;
  pasteLabel: string;
  saveLabel: string;
  disconnectLabel: string;
  onSave: (key: string) => Promise<string | null>;
  onDisconnect: () => Promise<void>;
};

function ClassicProviderBlock({
  title,
  description,
  status,
  busy,
  pasteLabel,
  saveLabel,
  disconnectLabel,
  onSave,
  onDisconnect,
}: ProviderBlockProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hasUserKey = status?.source === "user";

  const save = () => {
    void (async () => {
      setError(null);
      const reason = await onSave(key.trim());
      if (reason) setError(reason);
      else setKey("");
    })();
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {hasUserKey ? (
        <div className="flex gap-2">
          <input
            readOnly
            value=""
            placeholder="••••••••••••"
            aria-label={pasteLabel}
            className="w-full"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => {
              if (busy) return;
              void onDisconnect();
            }}
          >
            {disconnectLabel}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && key.trim() && !busy) {
                e.preventDefault();
                save();
              }
            }}
            placeholder={pasteLabel}
            aria-label={pasteLabel}
            className="w-full"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            disabled={busy || !key.trim()}
            onClick={save}
          >
            {saveLabel}
          </Button>
        </div>
      )}
      {error ? <p className={cn(TYPE.helper, "text-accent")}>{error}</p> : null}
    </div>
  );
}

export function OnboardingProviderFields({
  llm,
  tts,
  busy,
  onSave,
  onDisconnect,
  labels,
  variant,
}: {
  llm: ProviderUiStatus | null;
  tts: ProviderUiStatus | null;
  busy: boolean;
  onSave: (provider: "openrouter" | "elevenlabs", key: string) => Promise<string | null>;
  onDisconnect: (provider: "openrouter" | "elevenlabs") => Promise<void>;
  labels: {
    openRouterName: string;
    openRouterDesc: string;
    elevenLabsName: string;
    elevenLabsDesc: string;
    pasteApiKey: string;
    saveKey: string;
    disconnect: string;
    connected: string;
    disconnected: string;
    invalidApiKey: string;
  };
  variant: "hmat" | "classic";
}) {
  if (variant === "hmat") {
    return (
      <div className="flex flex-col gap-6">
        <HmatProviderKeyRow
          title={labels.openRouterName}
          description={labels.openRouterDesc}
          status={llm}
          busy={busy}
          connectedLabel={labels.connected}
          disconnectedLabel={labels.disconnected}
          invalidKeyLabel={labels.invalidApiKey}
          pasteLabel={labels.pasteApiKey}
          saveLabel={labels.saveKey}
          disconnectLabel={labels.disconnect}
          onSave={(key) => onSave("openrouter", key)}
          onDisconnect={() => onDisconnect("openrouter")}
          icon={
            <HmatSettingsIconWrap>
              <TextIcon />
            </HmatSettingsIconWrap>
          }
        />
        <HmatProviderKeyRow
          title={labels.elevenLabsName}
          description={labels.elevenLabsDesc}
          status={tts}
          busy={busy}
          connectedLabel={labels.connected}
          disconnectedLabel={labels.disconnected}
          invalidKeyLabel={labels.invalidApiKey}
          pasteLabel={labels.pasteApiKey}
          saveLabel={labels.saveKey}
          disconnectLabel={labels.disconnect}
          onSave={(key) => onSave("elevenlabs", key)}
          onDisconnect={() => onDisconnect("elevenlabs")}
          icon={
            <HmatSettingsIconWrap className="bg-[#FFF0E8]">
              <AudioIcon />
            </HmatSettingsIconWrap>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ClassicProviderBlock
        title={labels.openRouterName}
        description={labels.openRouterDesc}
        status={llm}
        busy={busy}
        pasteLabel={labels.pasteApiKey}
        saveLabel={labels.saveKey}
        disconnectLabel={labels.disconnect}
        onSave={(key) => onSave("openrouter", key)}
        onDisconnect={() => onDisconnect("openrouter")}
      />
      <ClassicProviderBlock
        title={labels.elevenLabsName}
        description={labels.elevenLabsDesc}
        status={tts}
        busy={busy}
        pasteLabel={labels.pasteApiKey}
        saveLabel={labels.saveKey}
        disconnectLabel={labels.disconnect}
        onSave={(key) => onSave("elevenlabs", key)}
        onDisconnect={() => onDisconnect("elevenlabs")}
      />
    </div>
  );
}
