"use client";

import { useState, type ReactNode } from "react";

import {
  HmatSettingsGlyphButton,
  HmatSettingsInlineField,
  HmatSettingsRowSubtitle,
  HmatSettingsRowTitle,
  HmatSettingsStatusBadge,
} from "@/components/screens/settings/HmatSettingsUi";
import type { ProviderUiStatus } from "@/hooks/useSettingsScreen";

export function providerBadgeFromStatus(
  status: ProviderUiStatus | null,
  labels: { connected: string; disconnected: string },
) {
  if (status?.source === "user") {
    return { connected: true, label: labels.connected, tone: "ok" as const };
  }
  return { connected: false, label: labels.disconnected, tone: "off" as const };
}

function isInvalidKeyError(reason: string): boolean {
  return /rejected|invalid/i.test(reason);
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UnlinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 15 6.5 17.5a3.5 3.5 0 0 1-5-5L4 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m15 9 2.5-2.5a3.5 3.5 0 0 1 5 5L20 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m4 4 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Settings-only editor when the row header lives elsewhere (prefer HmatProviderKeyRow). */
export function HmatProviderKeyEditor({
  status,
  busy,
  onSave,
  onDisconnect,
  pasteLabel,
  saveLabel,
  disconnectLabel,
  onInvalidChange,
}: {
  status: ProviderUiStatus | null;
  busy: boolean;
  onSave: (key: string) => Promise<string | null>;
  onDisconnect: () => Promise<void>;
  pasteLabel: string;
  saveLabel: string;
  disconnectLabel: string;
  onInvalidChange?: (invalid: boolean) => void;
}) {
  const [key, setKey] = useState("");
  const [keyInvalid, setKeyInvalid] = useState(false);
  const hasUserKey = status?.source === "user";
  const showInvalid = keyInvalid && !hasUserKey;

  const save = () => {
    void (async () => {
      setKeyInvalid(false);
      onInvalidChange?.(false);
      const reason = await onSave(key.trim());
      if (reason) {
        const invalid = isInvalidKeyError(reason);
        setKeyInvalid(invalid);
        onInvalidChange?.(invalid);
      } else {
        setKey("");
      }
    })();
  };

  if (hasUserKey) {
    return (
      <HmatSettingsInlineField
        readOnly
        value=""
        placeholder="••••••••••••"
        aria-label={pasteLabel}
        actionVisible
        action={
          <HmatSettingsGlyphButton
            ariaLabel={disconnectLabel}
            tone="danger"
            onClick={() => {
              if (busy) return;
              void onDisconnect();
            }}
          >
            <UnlinkIcon />
          </HmatSettingsGlyphButton>
        }
      />
    );
  }

  return (
    <HmatSettingsInlineField
      type="password"
      autoComplete="off"
      value={key}
      invalid={showInvalid}
      onChange={(e) => {
        setKey(e.target.value);
        if (showInvalid) {
          setKeyInvalid(false);
          onInvalidChange?.(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && key.trim() && !busy) {
          e.preventDefault();
          save();
        }
      }}
      placeholder={pasteLabel}
      aria-label={pasteLabel}
      actionVisible={Boolean(key.trim())}
      action={
        <HmatSettingsGlyphButton
          ariaLabel={saveLabel}
          disabled={busy || !key.trim()}
          onClick={save}
        >
          <SaveIcon />
        </HmatSettingsGlyphButton>
      }
    />
  );
}

export function HmatProviderKeyRow({
  title,
  description,
  status,
  busy,
  connectedLabel,
  disconnectedLabel,
  invalidKeyLabel,
  pasteLabel,
  saveLabel,
  disconnectLabel,
  onSave,
  onDisconnect,
  icon,
}: {
  title: string;
  description: string;
  status: ProviderUiStatus | null;
  busy: boolean;
  connectedLabel: string;
  disconnectedLabel: string;
  invalidKeyLabel: string;
  pasteLabel: string;
  saveLabel: string;
  disconnectLabel: string;
  onSave: (key: string) => Promise<string | null>;
  onDisconnect: () => Promise<void>;
  icon?: ReactNode;
}) {
  const [keyInvalid, setKeyInvalid] = useState(false);
  const hasUserKey = status?.source === "user";
  const showInvalid = keyInvalid && !hasUserKey;
  const baseBadge = providerBadgeFromStatus(status, {
    connected: connectedLabel,
    disconnected: disconnectedLabel,
  });

  const badge = showInvalid
    ? { connected: false, label: invalidKeyLabel, tone: "error" as const, marker: "x" as const }
    : { ...baseBadge, marker: "dot" as const };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon}
          <div className="min-w-0">
            <HmatSettingsRowTitle>{title}</HmatSettingsRowTitle>
            <HmatSettingsRowSubtitle>{description}</HmatSettingsRowSubtitle>
          </div>
        </div>
        <HmatSettingsStatusBadge
          connected={badge.connected}
          connectedLabel={badge.label}
          disconnectedLabel={badge.label}
          tone={badge.tone}
          marker={badge.marker}
        />
      </div>
      <HmatProviderKeyEditor
        status={status}
        busy={busy}
        onSave={onSave}
        onDisconnect={onDisconnect}
        pasteLabel={pasteLabel}
        saveLabel={saveLabel}
        disconnectLabel={disconnectLabel}
        onInvalidChange={setKeyInvalid}
      />
    </div>
  );
}
