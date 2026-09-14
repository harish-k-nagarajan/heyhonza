"use client";

import { useRef } from "react";

import {
  HmatSettingsGlyphButton,
  HmatSettingsHint,
  HmatSettingsInlineField,
  HmatSettingsMicroLabel,
  HmatSettingsStatusBadge,
  HmatSettingsTextarea,
} from "@/components/screens/settings/HmatSettingsUi";
import { removeContext } from "@/lib/client/context-actions";
import type { OnboardingScreen } from "@/hooks/useOnboardingScreen";
import { useSettingsStore } from "@/stores/useSettingsStore";

function ConnectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 0 0 7.07 7.07L14 18.07"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type SettingsCopy = {
  googleDocLabel: string;
  googleDocPlaceholder: string;
  googleDocAria: string;
  googleDocShare: string;
  connectGoogleDoc: string;
  fetching: string;
  googleDocConnected: string;
  googleDocFailed: string;
  disconnected: string;
  remove: string;
  fileLabel: string;
  fileUploadHint: string;
  pastePlaceholder: string;
  pastedTextAria: string;
  fileOrPaste: string;
};

export function OnboardingContextFields({
  screen,
  s,
}: {
  screen: OnboardingScreen;
  s: SettingsCopy;
}) {
  const contextChunks = useSettingsStore((st) => st.contextChunks);
  const docChunk = contextChunks.find((c) => c.meta.kind === "google_doc");
  const fileChunk = contextChunks.find((c) => c.meta.kind === "file");
  const docConnected = Boolean(docChunk);
  const fileName = fileChunk?.meta.kind === "file" ? fileChunk.meta.name : null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const disconnectDoc = () => {
    if (docChunk) void removeContext(docChunk.id);
    screen.setDocUrl("");
  };

  const disconnectFile = () => {
    if (fileChunk) void removeContext(fileChunk.id);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <HmatSettingsMicroLabel>{s.googleDocLabel}</HmatSettingsMicroLabel>
        <HmatSettingsHint>{s.googleDocShare}</HmatSettingsHint>
        <HmatSettingsInlineField
          value={screen.docUrl}
          onChange={(e) => screen.setDocUrl(e.target.value)}
          placeholder={s.googleDocPlaceholder}
          aria-label={s.googleDocAria}
          invalid={Boolean(screen.docError)}
          actionVisible={docConnected || Boolean(screen.docUrl.trim())}
          action={
            docConnected ? (
              <HmatSettingsGlyphButton ariaLabel={s.remove} tone="danger" onClick={disconnectDoc}>
                <UnlinkIcon />
              </HmatSettingsGlyphButton>
            ) : (
              <HmatSettingsGlyphButton
                ariaLabel={screen.docLoading ? s.fetching : s.connectGoogleDoc}
                disabled={screen.docLoading || !screen.docUrl.trim()}
                onClick={screen.importGoogleDoc}
              >
                <ConnectIcon />
              </HmatSettingsGlyphButton>
            )
          }
        />
        {screen.docError ? (
          <HmatSettingsStatusBadge
            connected={false}
            connectedLabel={s.googleDocFailed}
            disconnectedLabel={s.googleDocFailed}
            tone="warn"
            marker="x"
          />
        ) : docConnected ? (
          <HmatSettingsStatusBadge
            connected
            connectedLabel={s.googleDocConnected}
            disconnectedLabel={s.disconnected}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <HmatSettingsMicroLabel>{s.fileLabel}</HmatSettingsMicroLabel>
        <div className="hmat-frost-field relative flex min-h-[52px] items-center">
          <span className="min-w-0 flex-1 truncate px-3.5 font-sans text-sm text-[#243D2C]">
            {fileName ?? s.fileUploadHint}
          </span>
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <div className="hmat-inline-action hmat-inline-action--in">
              {fileName ? (
                <HmatSettingsGlyphButton ariaLabel={s.remove} tone="danger" onClick={disconnectFile}>
                  <UnlinkIcon />
                </HmatSettingsGlyphButton>
              ) : (
                <HmatSettingsGlyphButton
                  ariaLabel={s.fileUploadHint}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                </HmatSettingsGlyphButton>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain"
            className="hidden"
            onChange={(e) => screen.onFile(e.target.files?.[0] ?? null)}
          />
        </div>
        {screen.fileError ? (
          <HmatSettingsStatusBadge
            connected={false}
            connectedLabel={screen.fileError}
            disconnectedLabel={screen.fileError}
            tone="warn"
            marker="x"
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <HmatSettingsMicroLabel>{s.fileOrPaste}</HmatSettingsMicroLabel>
        <div className="hmat-frost-field relative">
          <HmatSettingsTextarea
            embedded
            value={screen.paste}
            onChange={(e) => screen.setPaste(e.target.value)}
            placeholder={s.pastePlaceholder}
            aria-label={s.pastedTextAria}
            className="min-h-[88px]"
          />
        </div>
      </div>
    </div>
  );
}
