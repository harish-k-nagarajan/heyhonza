"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex max-w-app items-center gap-3 rounded-card border border-border bg-card px-4 py-3 shadow-lg shadow-black/10">
        <p className="text-sm text-muted-foreground">
          Install Honza on your home screen for quicker access.
        </p>
        <Button
          type="button"
          className="shrink-0"
          onClick={async () => {
            await deferred.prompt();
            setVisible(false);
            setDeferred(null);
          }}
        >
          Install
        </Button>
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => setVisible(false)}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
