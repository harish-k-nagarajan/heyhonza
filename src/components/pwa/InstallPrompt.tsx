"use client";

import { useCallback, useEffect, useState } from "react";

import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/cn";
import { DESIGNS } from "@/lib/design/registry";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { useDesignStore } from "@/stores/useDesignStore";

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

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as Mac; disambiguate by touch
    (/Macintosh/.test(ua) && "ontouchend" in document)
  );
}

/** Chrome, Firefox, Edge, Opera on iOS — no beforeinstallprompt, no reliable A2HS. */
function isIosNonSafari(): boolean {
  if (!isIosDevice()) return false;
  return /CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
}

function isIosSafari(): boolean {
  return isIosDevice() && !isIosNonSafari();
}

/**
 * iOS-only install hints. Chromium/Android get the browser's own install UI —
 * we never call `preventDefault()` on `beforeinstallprompt`, so Chrome can show
 * its default banner / menu item instead of our in-app card over the CTA.
 */
export function InstallPrompt() {
  const design = useDesignStore((s) => s.design);
  const isHmat = DESIGNS[design].family === "hmat";
  const { t } = useLocale();
  const c = t.install;

  const [iosHint, setIosHint] = useState(false);
  const [iosOtherBrowserHint, setIosOtherBrowserHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    let revealTimer: number | undefined;

    const onInstalled = () => {
      setIosHint(false);
      setIosOtherBrowserHint(false);
      rememberDismissal();
    };

    window.addEventListener("appinstalled", onInstalled);

    if (isIosNonSafari()) {
      revealTimer = window.setTimeout(
        () => setIosOtherBrowserHint(true),
        REVEAL_DELAY_MS,
      );
    } else if (isIosSafari()) {
      revealTimer = window.setTimeout(() => setIosHint(true), REVEAL_DELAY_MS);
    }

    return () => {
      window.removeEventListener("appinstalled", onInstalled);
      if (revealTimer) window.clearTimeout(revealTimer);
    };
  }, []);

  const dismiss = useCallback(() => {
    setIosHint(false);
    setIosOtherBrowserHint(false);
    rememberDismissal();
  }, []);

  if (!iosHint && !iosOtherBrowserHint) return null;

  const iosLead = iosOtherBrowserHint ? c.iosOtherLead : c.iosLead;

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

        <p className={cn("mt-2", TYPE.bodySm, "text-foreground")}>
          {iosLead}{" "}
          <span className="text-accent">{c.iosShare}</span>
          {", "}
          {c.iosThen}{" "}
          <span className="text-accent">{c.iosAdd}</span>
          {c.iosTail}
        </p>
      </div>
    </div>
  );
}
