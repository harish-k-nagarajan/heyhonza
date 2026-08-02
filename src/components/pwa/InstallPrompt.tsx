"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/cn";
import { DESIGNS } from "@/lib/design/registry";
import { TYPE } from "@/lib/design/typography";
import { useDesignStore } from "@/stores/useDesignStore";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "honza-install-dismissed-at";
/** Don't nag again for this long after a dismissal. */
const SUPPRESS_DAYS = 14;
/** Let the user settle in before surfacing the prompt. */
const REVEAL_DELAY_MS = 4000;

function recentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — dismissal just won't persist */
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as Mac; disambiguate by touch
    (/Macintosh/.test(ua) && "ontouchend" in document);
  // Non-Safari iOS browsers can't add to home screen from the share sheet.
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return iOS && !otherBrowser;
}

function copy(isHmat: boolean) {
  return isHmat
    ? {
        label: "Instalace",
        dismiss: "Teď ne",
        body: "Nainstaluj Honzu pro rychlejší každodenní procvičování.",
        install: "Instalovat",
        ios: (
          <>
            Přidej Honzu na plochu: klepni na{" "}
            <span className="text-accent">Sdílet</span>, pak{" "}
            <span className="text-accent">Přidat na plochu</span>.
          </>
        ),
      }
    : {
        label: "INSTALL",
        dismiss: "Not now",
        body: "Install Honza for quicker daily practice.",
        install: "Install",
        ios: (
          <>
            Add Honza to your home screen: tap{" "}
            <span className="text-accent">Share</span>, then{" "}
            <span className="text-accent">Add to Home Screen</span>.
          </>
        ),
      };
}

export function InstallPrompt() {
  const design = useDesignStore((s) => s.design);
  const isHmat = DESIGNS[design].family === "hmat";
  const c = copy(isHmat);

  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    let revealTimer: number | undefined;

    const onBip = (e: Event) => {
      // Chromium: stash the event and reveal after a short delay.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      revealTimer = window.setTimeout(() => setVisible(true), REVEAL_DELAY_MS);
    };

    const onInstalled = () => {
      // Installed (any path) — clear UI and stop future nags.
      setVisible(false);
      setIosHint(false);
      setDeferred(null);
      rememberDismissal();
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt — offer a manual hint instead.
    if (isIosSafari()) {
      revealTimer = window.setTimeout(() => setIosHint(true), REVEAL_DELAY_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      if (revealTimer) window.clearTimeout(revealTimer);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setIosHint(false);
    rememberDismissal();
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    // The event is single-use; drop it either way.
    setVisible(false);
    setDeferred(null);
    rememberDismissal();
  }, [deferred]);

  if (!visible && !iosHint) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div
        className={cn(
          "w-full max-w-app px-4 py-3",
          isHmat
            ? "mat shadow-lg shadow-black/10"
            : "rounded-card border border-border bg-card shadow-lg shadow-black/10",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {isHmat ? (
            <p className={cn(TYPE.label, "text-muted-foreground")}>{c.label}</p>
          ) : (
            <SectionLabel as="p">{c.label}</SectionLabel>
          )}
          <button
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground",
              isHmat ? TYPE.label : "font-sans text-[11px] uppercase tracking-[0.2em]",
            )}
            onClick={dismiss}
          >
            {c.dismiss}
          </button>
        </div>

        {iosHint ? (
          <p className={cn("mt-2", TYPE.bodySm, "text-foreground")}>{c.ios}</p>
        ) : (
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className={cn(TYPE.bodySm, "text-foreground")}>{c.body}</p>
            {isHmat ? (
              <button
                type="button"
                className={cn(
                  "mat-key press shrink-0 rounded-full px-4 py-2 text-accent",
                  TYPE.button,
                )}
                onClick={install}
              >
                {c.install}
              </button>
            ) : (
              <Button type="button" className="shrink-0" onClick={install}>
                {c.install}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
