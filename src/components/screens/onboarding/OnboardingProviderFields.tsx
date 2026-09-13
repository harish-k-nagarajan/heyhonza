"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { ProviderUiStatus } from "@/hooks/useSettingsScreen";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

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
  variant: "hmat" | "classic";
};

function ProviderBlock({
  title,
  description,
  status,
  busy,
  pasteLabel,
  saveLabel,
  disconnectLabel,
  onSave,
  onDisconnect,
  variant,
}: ProviderBlockProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hasUserKey = status?.source === "user";
  const connected = status?.connected ?? false;

  const inputClass =
    variant === "hmat"
      ? "mat-field w-full rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-foreground outline-none"
      : "w-full";

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
        <p
          className={cn(
            variant === "hmat"
              ? "font-display text-[9px] font-bold uppercase tracking-[0.16em] text-[#9C9089]"
              : "font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground",
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "mt-1 text-sm",
            variant === "hmat" ? "text-[#9C9089]" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
        {connected && !hasUserKey ? (
          <p className={cn(TYPE.helper, "mt-1 text-emerald-700")}>
            {variant === "hmat" ? "Connected via server" : "Connected via server"}
          </p>
        ) : null}
      </div>

      {hasUserKey ? (
        <div className="flex gap-2">
          <input
            readOnly
            value=""
            placeholder="••••••••••••"
            aria-label={pasteLabel}
            className={inputClass}
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
            className={inputClass}
          />
          <Button
            type="button"
            variant={variant === "hmat" ? undefined : "secondary"}
            surface={variant === "hmat" ? "mat-key" : undefined}
            shape={variant === "hmat" ? "card" : undefined}
            size="md"
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
  };
  variant: "hmat" | "classic";
}) {
  return (
    <div className="flex flex-col gap-5">
      <ProviderBlock
        title={labels.openRouterName}
        description={labels.openRouterDesc}
        status={llm}
        busy={busy}
        pasteLabel={labels.pasteApiKey}
        saveLabel={labels.saveKey}
        disconnectLabel={labels.disconnect}
        onSave={(key) => onSave("openrouter", key)}
        onDisconnect={() => onDisconnect("openrouter")}
        variant={variant}
      />
      <ProviderBlock
        title={labels.elevenLabsName}
        description={labels.elevenLabsDesc}
        status={tts}
        busy={busy}
        pasteLabel={labels.pasteApiKey}
        saveLabel={labels.saveKey}
        disconnectLabel={labels.disconnect}
        onSave={(key) => onSave("elevenlabs", key)}
        onDisconnect={() => onDisconnect("elevenlabs")}
        variant={variant}
      />
    </div>
  );
}
