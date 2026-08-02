"use client";

import { useState } from "react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import {
  activeFontPreset,
  bodyFontsInGroup,
  DESIGNS,
  DESIGN_IDS,
  FONT_PAIRING_PRESETS,
  FONTS,
  fontFamilyVar,
  LAB_BODY_GROUPS,
  LAB_DISPLAY_FONTS,
  PENDING_USER_FONTS,
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
  const bodyMeta = FONTS[bodyFont];

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

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          <span className="text-foreground">Step 1 — Surface.</span> Classic flat cream, or Hmat metal /
          ceramic.
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

      <div className="space-y-2">
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          <span className="text-foreground">Step 2 — Font pairing.</span> Two fonts:{" "}
          <strong className="font-normal text-foreground">short labels</strong> (buttons, titles) and{" "}
          <strong className="font-normal text-foreground">long Czech</strong> (chat). Doto labels use a{" "}
          <strong className="font-normal text-foreground">bolder cut on buttons</strong> automatically.
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
                <span className="flex flex-wrap items-center gap-2">
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
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[14px] border border-border/80 bg-muted/25 p-3 space-y-2">
        <p className="font-sans text-xs text-foreground">Fonts you mentioned</p>
        <ul className="space-y-1.5 font-sans text-[11px] leading-snug text-muted-foreground">
          <li>
            <span className="text-foreground">Alan Sans</span> — in the body list below (partial Czech).
          </li>
          {PENDING_USER_FONTS.map((item) => (
            <li key={item.name}>
              <span className="text-foreground">{item.name}</span> — {item.note}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="font-sans text-xs text-muted-foreground underline"
          aria-expanded={showCustom}
        >
          {showCustom ? "Hide custom split" : "Mix your own (labels + reading font)"}
        </button>

        {showCustom ? (
          <div className="space-y-3 rounded-[14px] border border-border bg-muted/30 p-3">
            <div>
              <label htmlFor="dl-display" className="mb-1 block font-sans text-sm text-foreground">
                Short labels
              </label>
              <p className="mb-1.5 font-sans text-[11px] text-muted-foreground">
                Buttons, titles, {"//"} tags. Doto is boldest on buttons.
              </p>
              <select
                id="dl-display"
                value={displayFont}
                onChange={(e) => setDisplayFont(e.target.value as FontId)}
                className="h-10 w-full rounded-[12px] border border-border bg-card px-3 font-sans text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
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
              <p className="mb-1.5 font-sans text-[11px] text-muted-foreground">
                Chat bubbles and lessons — pick from easy sans, mono, or your suggested faces.
              </p>
              <select
                id="dl-body"
                value={bodyFont}
                onChange={(e) => setBodyFont(e.target.value as FontId)}
                className="h-10 w-full rounded-[12px] border border-border bg-card px-3 font-sans text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
              >
                {LAB_BODY_GROUPS.map((group) => (
                  <optgroup key={group.id} label={group.label}>
                    {bodyFontsInGroup(group.id).map((f) => (
                      <option key={f} value={f}>
                        {FONTS[f].label}
                        {FONTS[f].userPick ? " ★" : ""} — {FONTS[f].roleHint}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {!bodyMeta.coversCzech ? (
                <p className="mt-1.5 font-sans text-[11px] text-accent">
                  Partial Czech — some letters may fall back. Watch the preview.
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

      <div
        className={cn(
          "rounded-[14px] p-3.5 space-y-2",
          isHmat ? "mat-recess" : "border border-border bg-muted/40",
        )}
      >
        <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Preview
        </p>
        <button
          type="button"
          className={cn(
            "font-display-ui rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]",
            isHmat
              ? "mat-key text-accent"
              : "bg-accent text-accent-foreground shadow-sm shadow-black/10",
          )}
        >
          Sample button
        </button>
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
