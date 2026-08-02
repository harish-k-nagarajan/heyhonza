"use client";

import { useEffect } from "react";

import { applyDesignToRoot } from "@/lib/design/apply";
import {
  SHIPPED_BODY_FONT,
  SHIPPED_DESIGN,
  SHIPPED_DISPLAY_FONT,
} from "@/lib/design/registry";

/** Stamps the shipped design onto `<html>` after hydration (idempotent). */
export function DesignRoot() {
  useEffect(() => {
    applyDesignToRoot(SHIPPED_DESIGN, SHIPPED_DISPLAY_FONT, SHIPPED_BODY_FONT);
  }, []);

  return null;
}
