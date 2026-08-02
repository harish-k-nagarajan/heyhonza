"use client";

import { useState } from "react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import {
  activeFontPreset,
  DESIGNS,
  DESIGN_IDS,
  FONT_PAIRING_PRESETS,
  FONTS,
  fontFamilyVar,
  LAB_BODY_FONTS,
  LAB_DISPLAY_FONTS,
} from "@/lib/design/registry";
import type { DesignId, FontId } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

const SPECIMEN = "Těší mě! Čeština je krásná řeč — ďábelsky těžká, ale růžová.";

function Swatch({ id, active }: { id: DesignId; active: boolean }) {
  const isHmat = DESIGNS[id].family === "hmat";
  const ceramic = id === "hmat-ceramic";
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border",
        active ? "border-accent" : "border-border",
      )}
      style={{
        background: isHmat
          ? ceramic
            ? "linear-gradient(180deg,#fbf7f2,#efe6db)"
            : "linear-gradient(180deg,#fbf8f4,#e9e0d6)"
          : "#F5F2EE",
        boxShadow: isHmat
          ? "inset 0 1px 0 #fff, 0 2px 4px rgba(90,60,45,0.18)"
          : "inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <span
        className={cn(isHmat ? "font-display" : "font-sans", "text-[13px]")}
        style={{ color: "#E8432D" }}
      >
        {isHmat ? "▦" : "Aa"}
      </span>
    </span>
  );
}

export function DesignLab() {
  const design = useDesignStore((s) => s.design);
  const displayFont = useDesignStore((s) => s.displayFont);
  const bodyFont = useDesignStore((s) => s.bodyFont);
  const setDesign = useDesignStore((s) => s.setDesign);
  const setDisplayFont = useDesignStore((s) => s.setDisplayFont);
  const setBodyFont = useDesignStore((s) => s.setBodyFont);
  const resetFonts = useDesignStore((s) => s.resetFonts);

  const [showCustom, setShowCustom] = useState(false);

  const isHmat = DESIGNS[design].family === "hmat";
  const activePreset = activeFontPreset(displayFont, bodyFont);
  const bodyIsDisplayFace = FONTS[bodyFont].displayOnly;

  const applyPreset = (display: FontId, body: FontId) => {
    setDisplayFont(display);
    setBodyFont(body);
  };

  return (
    <section
      className={cn(
        isHmat ? "mat px-4 py-4" : "rounded-card border border-border bg-card p-4 shadow-sm shadow-black/[0.04]",
        "space-y-4",
      )}
      aria-label="Design Lab"
    >
      <div className="flex items-center gap-2">
        <span className="text-accent">
          <HardwareIcon name="settings" size={18} emboss={isHmat} />
        </span>
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Design Lab
          </p>
          <p className="font-sans text-[13px] text-foreground">Look & fonts</p>
        </div>
      </div>

      {/* Visual design (Classic / Hmat). */}
      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          <span className="text-foreground">Step 1 — Surface.</span> Cream flat (Classic) or brushed
          metal / ceramic (Hmat).
        </p>
        {DESIGN_IDS.map((id) => {
          const meta = DESIGNS[id];
          const active = design === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setDesign(id)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-3 rounded-[14px] border px-3 py-2.5 text-left transition",
                active
                  ? "border-accent bg-accent/[0.06]"
                  : "border-border bg-transparent hover:bg-muted/40",
              )}
            >
              <Swatch id={id} active={active} />
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-sm text-foreground">{meta.label}</span>
                <span className="block font-sans text-[11px] leading-snug text-muted-foreground">
                  {meta.tagline}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Font pairings. */}
      <div className="space-y-2">
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          <span className="text-foreground">Step 2 — Font pairing.</span> Honza uses{" "}
          <strong className="font-normal text-foreground">two</strong> fonts:{" "}
          <strong className="font-normal text-foreground">short labels</strong> (buttons, titles,{" "}
          {"//"} sections) and <strong className="font-normal text-foreground">long Czech text</strong>{" "}
          (chat bubbles, lessons). Pick a ready-made pair below — you usually do not need the custom
          row.
        </p>

        <div className="flex flex-col gap-2">
          {FONT_PAIRING_PRESETS.map((preset) => {
            const active = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.displayFont, preset.bodyFont)}
                aria-pressed={active}
                className={cn(
                  "rounded-[14px] border px-3 py-2.5 text-left transition",
                  active
                    ? "border-accent bg-accent/[0.06]"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-sans text-sm text-foreground">{preset.label}</span>
                  {preset.recommended ? (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.12em] text-accent">
                      Recommended
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block font-sans text-[11px] leading-snug text-muted-foreground">
                  {preset.description}
                </span>
                <span className="mt-1 block font-sans text-[10px] text-muted-foreground">
                  Labels: {FONTS[preset.displayFont].label} · Reading:{" "}
                  {FONTS[preset.bodyFont].label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional custom split — replaces confusing Nadpisy / Text dropdowns. */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="font-sans text-xs text-muted-foreground underline"
          aria-expanded={showCustom}
        >
          {showCustom ? "Hide custom font split" : "Custom font split (advanced)"}
        </button>

        {showCustom ? (
          <div className="space-y-3 rounded-[14px] border border-border bg-muted/30 p-3">
            <div>
              <label
                htmlFor="dl-display"
                className="mb-1 block font-sans text-sm text-foreground"
              >
                Short labels
              </label>
              <p className="mb-1.5 font-sans text-[11px] leading-snug text-muted-foreground">
                Buttons, screen titles, {"//"} section tags, timers.
              </p>
              <select
                id="dl-display"
                value={displayFont}
                onChange={(e) => setDisplayFont(e.target.value as FontId)}
                className="h-10 w-full rounded-[12px] border border-border bg-card px-3 font-sans text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
              >
                {LAB_DISPLAY_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {FONTS[f].label} — {FONTS[f].roleHint}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dl-body" className="mb-1 block font-sans text-sm text-foreground">
                Long Czech text
              </label>
              <p className="mb-1.5 font-sans text-[11px] leading-snug text-muted-foreground">
                Chat messages, corrections, onboarding copy — must read well in paragraphs.
              </p>
              <select
                id="dl-body"
                value={bodyFont}
                onChange={(e) => setBodyFont(e.target.value as FontId)}
                className="h-10 w-full rounded-[12px] border border-border bg-card px-3 font-sans text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
              >
                {LAB_BODY_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {FONTS[f].label} — {FONTS[f].roleHint}
                  </option>
                ))}
              </select>
              {bodyIsDisplayFace ? (
                <p className="mt-1.5 font-sans text-[11px] leading-snug text-accent">
                  Pixel fonts are hard to read in long Czech text — try Geist Sans or IBM Plex.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={resetFonts}
        className="font-sans text-xs text-muted-foreground underline"
      >
        Reset fonts to this design&apos;s default
      </button>

      {/* Live preview. */}
      <div
        className={cn(
          "rounded-[14px] p-3.5 space-y-2",
          isHmat ? "mat-recess" : "border border-border bg-muted/40",
        )}
      >
        <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Preview
        </p>
        <p
          className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          style={{ fontFamily: fontFamilyVar(displayFont) }}
        >
          {"// CHAT"}
        </p>
        <p
          className="text-lg tracking-[0.06em] text-foreground"
          style={{ fontFamily: fontFamilyVar(displayFont) }}
        >
          Ahoj, jsem Honza
        </p>
        <p
          className="text-[15px] leading-relaxed text-foreground"
          style={{ fontFamily: fontFamilyVar(bodyFont) }}
        >
          {SPECIMEN}
        </p>
      </div>
    </section>
  );
}
