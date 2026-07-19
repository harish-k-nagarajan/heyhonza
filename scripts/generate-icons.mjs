// Generates Honza PWA icons — Hmat recess + idle HonzaOrb face (Concept C).
// Mirrors geometry in src/components/honza/HonzaOrb.tsx; palette in honza/theme.ts
// and .mat-recess in globals.css. Renders SVG -> PNG via rsvg-convert.
// Run: node scripts/generate-icons.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const TMP = join(ROOT, "public", "icons", ".tmp");

// --- Palette — keep in sync with honza/theme.ts + DESIGN.md ---
const CREAM = "#F5F2EE";
const IDLE_BG = "#FFF4EE";
const ACCENT = "#E8432D";
/** Approximates `.mat-recess` top stop (idle bg × 42% + #e7ded3). */
const RECESS_TOP = "#f1e7de";
const RECESS_BOTTOM = "#ffffff";

// --- Face geometry — keep in sync with HonzaOrb.tsx ---
const GRID = 15;
const FACE_VIEW = 90;
const CELL = FACE_VIEW / GRID;
const DOT = CELL * 0.82;
const PAD = (CELL - DOT) / 2;
const BG_DOT_ALPHA = 0.1;
const FAINT_OPACITY = 0.42;

const CANVAS = 512;

const k = (x, y) => `${x},${y}`;

// Idle face — copied from HonzaOrb IDLE_ACCENT / IDLE_FAINT.
const ACCENT_CELLS = new Set([
  k(3, 4), k(4, 4), k(3, 5), k(4, 5),
  k(10, 4), k(11, 4), k(10, 5), k(11, 5),
  k(4, 10), k(5, 11), k(6, 11), k(7, 11), k(8, 11), k(9, 11), k(10, 10),
]);
const FAINT_CELLS = new Set([k(1, 7), k(13, 7)]);

/** Pixel-frame border on the grid perimeter (Concept C). */
const BORDER_CELLS = new Set();
for (let x = 0; x < GRID; x++) {
  BORDER_CELLS.add(k(x, 0));
  BORDER_CELLS.add(k(x, GRID - 1));
}
for (let y = 1; y < GRID - 1; y++) {
  BORDER_CELLS.add(k(0, y));
  BORDER_CELLS.add(k(GRID - 1, y));
}

function faceCells() {
  const rx = Math.min(DOT * 0.22, CELL * 0.28);
  const bgD = DOT * 0.28;
  let out = "";
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const key = k(x, y);
      const xi = x * CELL + PAD;
      const yi = y * CELL + PAD;
      if (ACCENT_CELLS.has(key) || BORDER_CELLS.has(key)) {
        out += `<rect x="${xi}" y="${yi}" width="${DOT}" height="${DOT}" rx="${rx}" fill="${ACCENT}"/>`;
      } else if (FAINT_CELLS.has(key)) {
        out += `<rect x="${xi}" y="${yi}" width="${DOT}" height="${DOT}" rx="${rx}" fill="${ACCENT}" opacity="${FAINT_OPACITY}"/>`;
      } else {
        const cx = x * CELL + CELL / 2 - bgD / 2;
        const cy = y * CELL + CELL / 2 - bgD / 2;
        out += `<rect x="${cx}" y="${cy}" width="${bgD}" height="${bgD}" rx="${bgD * 0.35}" fill="rgba(0,0,0,${BG_DOT_ALPHA})"/>`;
      }
    }
  }
  return out;
}

/**
 * Hmat recess icon (Concept C): cream canvas, inset ceramic well, framed orb.
 * @param {number} contentScale — 1 = full bleed; ~0.72 keeps maskable safe zone.
 */
function svg({ contentScale = 1 }) {
  const recessSize = 392 * contentScale;
  const recessX = (CANVAS - recessSize) / 2;
  const recessY = recessX;
  const recessRx = recessSize * 0.14;
  const faceScale = (recessSize * 0.62) / FACE_VIEW;
  const facePx = FACE_VIEW * faceScale;
  const faceX = recessX + (recessSize - facePx) / 2;
  const faceY = recessY + (recessSize - facePx) / 2;
  const glowR = facePx * 0.58;
  const glowCx = faceX + facePx / 2;
  const glowCy = faceY + facePx / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
<defs>
  <linearGradient id="recess" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${RECESS_TOP}"/>
    <stop offset="100%" stop-color="${RECESS_BOTTOM}"/>
  </linearGradient>
  <filter id="inset" x="-20%" y="-20%" width="140%" height="140%">
    <feOffset dx="0" dy="3"/>
    <feGaussianBlur stdDeviation="5" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="out" result="inverse"/>
    <feFlood flood-color="rgba(120,90,70,0.22)" result="color"/>
    <feComposite in="color" in2="inverse" operator="in" result="shadow"/>
    <feComposite in="SourceGraphic" in2="shadow" operator="over"/>
  </filter>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.14"/>
    <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="${CANVAS}" height="${CANVAS}" fill="${CREAM}"/>
<rect x="${recessX}" y="${recessY}" width="${recessSize}" height="${recessSize}" rx="${recessRx}" fill="url(#recess)" filter="url(#inset)"/>
<rect x="${recessX}" y="${recessY + recessSize - 2}" width="${recessSize}" height="2" rx="1" fill="rgba(255,255,255,0.75)"/>
<ellipse cx="${glowCx}" cy="${glowCy}" rx="${glowR}" ry="${glowR}" fill="url(#glow)"/>
<g transform="translate(${faceX} ${faceY}) scale(${faceScale})">${faceCells()}</g>
</svg>`;
}

function render(svgStr, outPath, px) {
  const tmpSvg = join(TMP, "icon.svg");
  writeFileSync(tmpSvg, svgStr);
  execFileSync("rsvg-convert", ["-w", String(px), "-h", String(px), "-o", outPath, tmpSvg]);
  console.log(`  ✓ ${outPath.replace(ROOT + "/", "")} (${px}px)`);
}

mkdirSync(ICONS_DIR, { recursive: true });
mkdirSync(TMP, { recursive: true });

const targets = [
  { file: "icon-192.png", px: 192, contentScale: 1 },
  { file: "icon-512.png", px: 512, contentScale: 1 },
  { file: "icon-maskable-192.png", px: 192, contentScale: 0.72 },
  { file: "icon-maskable-512.png", px: 512, contentScale: 0.72 },
  { file: "apple-touch-icon.png", px: 180, contentScale: 0.88, dir: "public" },
];

console.log("Generating Honza icons (Hmat recess)…");
for (const t of targets) {
  const dir = t.dir ? join(ROOT, t.dir) : ICONS_DIR;
  render(svg({ contentScale: t.contentScale }), join(dir, t.file), t.px);
}

const appIcon = join(ROOT, "src", "app", "icon.png");
copyFileSync(join(ICONS_DIR, "icon-512.png"), appIcon);
console.log(`  ✓ ${appIcon.replace(ROOT + "/", "")} (512px, from icon-512)`);

rmSync(TMP, { recursive: true, force: true });
console.log("Done.");
