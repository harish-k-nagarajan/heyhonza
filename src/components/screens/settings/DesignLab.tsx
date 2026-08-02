"use client";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import {
  DESIGNS,
  DESIGN_IDS,
  FONTS,
  FONT_GROUPS,
  fontFamilyVar,
  fontsInGroup,
  weightLabel,
} from "@/lib/design/registry";
import type { DesignId, FontId } from "@/lib/design/registry";
import { TYPE } from "@/lib/design/typography";
import { useDesignStore } from "@/stores/useDesignStore";

/**
 * The Design Lab — the shared Settings section that switches the whole app
 * between Classic, Hmat Metal, and Hmat Ceramic live, and lets the display and
 * body faces be chosen independently. Reads/writes `useDesignStore`; `DesignRoot`
 * + the persisted store carry the choice to the DOM and across reloads.
 *
 * Styled off design tokens so it reads natively inside either family's Settings
 * (material card on Hmat, plain card on Classic). The live Czech specimen uses
 * the full diacritic set so a body-face pick that can't render Czech fails in
 * front of you.
 */

const SPECIMEN = "Těší mě! Čeština je krásná řeč — ďábelsky těžká, ale růžová.";

/** A small representative tile for each design in the picker. */
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

function FontSelect({
  id,
  label,
  value,
  onChange,
  warn,
  displaySuffix,
}: {
  id: string;
  label: string;
  value: FontId;
  onChange: (f: FontId) => void;
  warn?: string;
  /** Suffix shown after display-only faces (localized per design). */
  displaySuffix: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as FontId)}
        className="h-10 w-full rounded-[12px] border border-border bg-card px-3 font-sans text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
      >
        {FONT_GROUPS.map((group) => (
          <optgroup key={group.id} label={group.label}>
            {fontsInGroup(group.id).map((f) => (
              <option key={f} value={f}>
                {FONTS[f].label}
                {FONTS[f].displayOnly ? displaySuffix : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {warn ? <p className="font-sans text-[11px] leading-snug text-accent">{warn}</p> : null}
    </div>
  );
}

function WeightPreview({ fontId }: { fontId: FontId }) {
  const meta = FONTS[fontId];
  const unique = [...new Set(meta.weights)];

  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Weights — {meta.label}
      </p>
      <div className="flex flex-wrap gap-2">
        {unique.map((w) => (
          <span
            key={w}
            className="rounded-[10px] border border-border bg-card px-2.5 py-1.5 font-sans text-xs text-foreground"
            style={{ fontFamily: fontFamilyVar(fontId), fontWeight: w }}
          >
            {weightLabel(w)}
          </span>
        ))}
      </div>
      {unique.length === 1 ? (
        <p className="font-sans text-[10px] leading-snug text-muted-foreground">
          Single weight — use size and tracking for hierarchy, not bold.
        </p>
      ) : null}
    </div>
  );
}

function CzechBadge({ covers }: { covers: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.14em]",
        covers
          ? "border border-[#2E7D32]/30 bg-[#EEFFEE]/80 text-[#2E7D32]"
          : "border border-accent/30 bg-accent/[0.08] text-accent",
      )}
    >
      {covers ? "Czech OK" : "Czech partial"}
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

  const isHmat = DESIGNS[design].family === "hmat";
  const bodyIsDisplayFace = FONTS[bodyFont].displayOnly;
  const bodyMeta = FONTS[bodyFont];

  // Hmat leads in full Czech; Classic keeps its shipped English chrome.
  const t = isHmat
    ? {
        display: "Nadpisy",
        body: "Text (čeština)",
        reset: "Zpět na výchozí písmo",
        displaySuffix: " · nadpisové",
        warn: "Nadpisové písmo jako text — pixelové řezy se v odstavcích čtou špatně. Sleduj ukázku.",
        specimenTitle: "Ukázka typografie",
        hierarchy: "Hierarchie",
      }
    : {
        display: "Display",
        body: "Body (Czech)",
        reset: "Reset to design default",
        displaySuffix: " · display",
        warn: "Display face as body — pixel faces are hard to read in prose. Watch the specimen.",
        specimenTitle: "Typography specimen",
        hierarchy: "Hierarchy",
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
          <p className="font-sans text-[13px] text-foreground">
            Vzhled a písmo · {FONT_GROUPS.reduce((n, g) => n + fontsInGroup(g.id).length, 0)} fonts
          </p>
        </div>
      </div>

      {/* Design picker. */}
      <div className="flex flex-col gap-2">
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
              <span
                className={cn(
                  "h-[9px] w-[9px] shrink-0 rounded-full border",
                  active ? "border-accent bg-accent" : "border-border bg-transparent",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {/* Font axis. */}
      <div className="grid grid-cols-2 gap-3">
        <FontSelect
          id="dl-display"
          label={t.display}
          value={displayFont}
          onChange={setDisplayFont}
          displaySuffix={t.displaySuffix}
        />
        <FontSelect
          id="dl-body"
          label={t.body}
          value={bodyFont}
          onChange={setBodyFont}
          displaySuffix={t.displaySuffix}
          warn={bodyIsDisplayFace ? t.warn : undefined}
        />
      </div>

      <WeightPreview fontId={bodyFont} />

      <button
        type="button"
        onClick={resetFonts}
        className="font-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground underline"
      >
        {t.reset}
      </button>

      {/* Live specimen — full Czech diacritics + hierarchy preview. */}
      <div
        className={cn(
          "rounded-[14px] p-3.5 space-y-3",
          isHmat ? "mat-recess" : "border border-border bg-muted/40",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t.specimenTitle}
          </p>
          <CzechBadge covers={bodyMeta.coversCzech} />
        </div>

        <div className="space-y-2.5 border-b border-border/60 pb-3">
          <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t.hierarchy}
          </p>
          <p className={TYPE.kicker} style={{ fontFamily: fontFamilyVar(displayFont) }}>
            {"// SECTION"}
          </p>
          <p className={TYPE.display} style={{ fontFamily: fontFamilyVar(displayFont) }}>
            Screen Title
          </p>
          <p
            className="font-sans text-[15px] leading-relaxed text-foreground"
            style={{ fontFamily: fontFamilyVar(bodyFont) }}
          >
            {SPECIMEN}
          </p>
          <p
            className="font-sans text-xs leading-relaxed text-muted-foreground"
            style={{ fontFamily: fontFamilyVar(bodyFont) }}
          >
            Helper text — settings and hints.
          </p>
        </div>

        <div>
          <p
            className="mb-1.5 text-[15px] tracking-[0.02em] text-foreground"
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
      </div>
    </section>
  );
}
