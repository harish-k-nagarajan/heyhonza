"use client";

import { useEffect } from "react";

import { applyDesignToRoot } from "@/lib/design/apply";
import { useDesignStore } from "@/stores/useDesignStore";

/**
 * Keeps `<html>` in sync with the design store *after* hydration. The pre-paint
 * script already painted the correct design before React ran, so on a cold load
 * this only re-applies the identical value (idempotent — no flash). Its real job
 * is live switching: when the Lab changes design or a font, the DOM follows
 * immediately, on the very page you're standing on.
 *
 * Renders nothing.
 */
export function DesignRoot() {
  const design = useDesignStore((s) => s.design);
  const displayFont = useDesignStore((s) => s.displayFont);
  const bodyFont = useDesignStore((s) => s.bodyFont);

  useEffect(() => {
    applyDesignToRoot(design, displayFont, bodyFont);
  }, [design, displayFont, bodyFont]);

  return null;
}
