"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { DESIGNS } from "@/lib/design/registry";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import {
  pushSupport,
  subscribeToPush,
  unsubscribeFromPush,
  type PushSupport,
} from "@/lib/push/client";
import { useDesignStore } from "@/stores/useDesignStore";

/**
 * Honest push opt-in — stores subscription when infra exists; no fake prompts.
 */
export function PushNotificationSettings() {
  const design = useDesignStore((s) => s.design);
  const isHmat = DESIGNS[design].family === "hmat";
  const { t } = useLocale();
  const s = t.settings;
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
    try {
      if (enabled) {
        await unsubscribeFromPush();
        setEnabled(false);
        setNote(s.notificationsTurnedOff);
      } else {
        const result = await subscribeToPush();
        if (result.ok) {
          setEnabled(true);
          setNote(s.notificationsReady);
        } else {
          setNote(result.reason ?? s.notificationsEnableFailed);
        }
      }
    } finally {
      setBusy(false);
    }
  }, [enabled, s]);

  if (support === "unsupported") return null;

  return (
    <div className={cn("space-y-2", isHmat ? "" : "rounded-card border border-border bg-card p-4")}>
      {isHmat ? (
        <p className={cn(TYPE.label, "text-muted-foreground")}>{s.sections.notifications}</p>
      ) : (
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {`// ${s.sections.notifications}`}
        </p>
      )}
      <p className={isHmat ? TYPE.subtitle : cn(TYPE.helper)}>{s.notificationsHint}</p>
      <Button
        type="button"
        disabled={busy || support === "denied"}
        onClick={() => void toggle()}
        surface={isHmat ? "mat-key" : "flat"}
        shape={isHmat ? "pill" : undefined}
        size={isHmat ? "sm" : undefined}
        haptic="light"
        className={isHmat ? undefined : "rounded-full px-4 py-2"}
      >
        {enabled ? s.notificationsOff : s.notificationsOn}
      </Button>
      {support === "denied" ? (
        <p className={cn(TYPE.helper, "text-accent")}>{s.notificationsDenied}</p>
      ) : null}
      {note ? <p className={TYPE.helper}>{note}</p> : null}
    </div>
  );
}
