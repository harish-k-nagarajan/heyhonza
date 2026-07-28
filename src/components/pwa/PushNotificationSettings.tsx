"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { DESIGNS } from "@/lib/design/registry";
import {
  pushSupport,
  subscribeToPush,
  unsubscribeFromPush,
  type PushSupport,
} from "@/lib/push/client";
import { tapLight } from "@/lib/interaction/haptic";
import { useDesignStore } from "@/stores/useDesignStore";

/**
 * Honest push opt-in — stores subscription when infra exists; no fake prompts.
 */
export function PushNotificationSettings() {
  const design = useDesignStore((s) => s.design);
  const isHmat = DESIGNS[design].family === "hmat";
  const [support, setSupport] = useState<PushSupport>("unsupported");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setSupport(pushSupport());
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setEnabled(!!sub);
      });
    }
  }, []);

  const toggle = useCallback(async () => {
    setBusy(true);
    setNote(null);
    tapLight();
    try {
      if (enabled) {
        await unsubscribeFromPush();
        setEnabled(false);
        setNote(isHmat ? "Oznámení vypnuta." : "Notifications turned off.");
      } else {
        const result = await subscribeToPush();
        if (result.ok) {
          setEnabled(true);
          setNote(
            isHmat
              ? "Připraveno — až bude plán aktivní, Honza ti napíše."
              : "Ready — when scheduling ships, Honza can reach you.",
          );
        } else {
          setNote(result.reason ?? "Could not enable notifications.");
        }
      }
    } finally {
      setBusy(false);
    }
  }, [enabled, isHmat]);

  if (support === "unsupported") return null;

  return (
    <div className={cn("space-y-2", isHmat ? "" : "rounded-card border border-border bg-card p-4")}>
      {isHmat ? (
        <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Oznámení
        </p>
      ) : (
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {"// NOTIFICATIONS"}
        </p>
      )}
      <p className={cn("text-sm text-muted-foreground", isHmat ? "font-sans" : "font-sans text-xs")}>
        {isHmat
          ? "Upozornění, až bude Honza připraven psát ti první — zatím jen příprava."
          : "Get notified when Honza is ready to write first — foundation only until scheduling ships."}
      </p>
      <button
        type="button"
        disabled={busy || support === "denied"}
        onClick={() => void toggle()}
        className={cn(
          "rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition disabled:opacity-40",
          isHmat
            ? "mat-key press font-display text-accent"
            : "bg-accent font-sans text-accent-foreground",
        )}
      >
        {enabled
          ? isHmat
            ? "Vypnout"
            : "Turn off"
          : isHmat
            ? "Zapnout"
            : "Turn on"}
      </button>
      {support === "denied" ? (
        <p className="font-sans text-xs text-accent">
          {isHmat ? "Povol oznámení v nastavení prohlížeče." : "Allow notifications in browser settings."}
        </p>
      ) : null}
      {note ? <p className="font-sans text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
