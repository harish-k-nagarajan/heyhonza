// Generates Honza PWA icons — ceramic orb (idle / waiting face).
// Geometry follows src/components/honza/HmatOrb.tsx + globals.css (.hmat-orb-*).
// Face pixels follow ceramic-faces.ts WAITING. Palette: ORB_LED + cream canvas.
// Renders SVG -> PNG via rsvg-convert.
// Run: node scripts/generate-icons.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const TMP = join(ROOT, "public", "icons", ".tmp");

const CREAM = "#F5F2EE";
const LED = "#E8432D";
const GLOW = "#FF6B4A";

/** Waiting face — keep in sync with ceramic-faces.ts WAITING. */
const CELL = 4.92;
const STEP = 6;
const FACE_VIEW = 96;

const p = (x, y, o = 1) => ({ x, y, o });
const rect = (x0, y0, cols, rows, o = 1) => {
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) out.push(p(x0 + c * STEP, y0 + r * STEP, o));
  }
  return out;
};

const FACE = [
  ...rect(28, 34, 2, 2),
  ...rect(58, 34, 2, 2),
  p(16, 52, 0.42),
  p(76, 52, 0.42),
  p(28, 58),
  p(64, 58),
  ...rect(34, 64, 5, 1),
];

const CANVAS = 512;
/** Body as a fraction of the canvas at contentScale 1. */
const BODY_RATIO = 0.8;

function faceMarkup(mx, my, mw, mh) {
  const sx = mw / FACE_VIEW;
  const sy = mh / FACE_VIEW;
  const rx = CELL * 0.14;
  return FACE.map(
    (px) =>
      `<rect x="${mx + px.x * sx}" y="${my + px.y * sy}" width="${CELL * sx}" height="${CELL * sy}" rx="${rx * sx}" fill="${LED}" opacity="${px.o}"/>`,
  ).join("");
}

function dotGrid(mx, my, mw, mh) {
  const cols = 13;
  const rows = 13;
  const padX = mw * 0.08;
  const padY = mh * 0.08;
  const d = Math.min(mw, mh) * 0.018;
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = mx + padX + ((mw - padX * 2) * c) / (cols - 1);
      const cy = my + padY + ((mh - padY * 2) * r) / (rows - 1);
      out += `<circle cx="${cx}" cy="${cy}" r="${d}" fill="#5a3a2a" opacity="0.16"/>`;
    }
  }
  return out;
}

/**
 * Cream tile with the ceramic orb. contentScale shrinks the body into the
 * maskable / Apple safe zone; the cream field always fills the canvas.
 */
function svg({ contentScale = 1 }) {
  const body = CANVAS * BODY_RATIO * contentScale;
  const bx = (CANVAS - body) / 2;
  const by = (CANVAS - body) / 2 - body * 0.012;
  const rad = body * 0.3472;

  const porX = bx + body * 0.014;
  const porY = by + body * 0.02;
  const porW = body * 0.972;
  const porH = body * 0.98;

  const cerX = bx + body * 0.012;
  const cerY = by;
  const cerW = body * 0.976;
  const cerH = body * 0.955;

  const bezX = bx + body * 0.145;
  const bezY = by + body * 0.135;
  const bezW = body * 0.71;
  const bezH = body * 0.7;
  const bezR = Math.min(bezW, bezH) * 0.28;

  const mx = bx + body * 0.178;
  const my = by + body * 0.168;
  const mw = body * 0.644;
  const mh = body * 0.635;
  const mr = Math.min(mw, mh) * 0.24;

  const glowCx = bx + body * 0.5;
  const glowCy = by + body * 0.92;
  const glowRx = body * 0.42;
  const glowRy = body * 0.1;

  const sheenRx = cerW * 0.34;
  const sheenRy = cerH * 0.07;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
<defs>
  <linearGradient id="porcelain" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f8f2ed"/>
    <stop offset="60%" stop-color="#efe3da"/>
    <stop offset="100%" stop-color="#f2d7cb"/>
  </linearGradient>
  <radialGradient id="ceramic" cx="38%" cy="30%" r="85%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="45%" stop-color="#fcf8f5"/>
    <stop offset="80%" stop-color="#f3e9e1"/>
    <stop offset="100%" stop-color="#eddfd5"/>
  </radialGradient>
  <linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e2d2c5"/>
    <stop offset="40%" stop-color="#f1e7df"/>
    <stop offset="80%" stop-color="#fbf6f2"/>
    <stop offset="100%" stop-color="#ffffff"/>
  </linearGradient>
  <radialGradient id="matrix" cx="50%" cy="54%" r="62%">
    <stop offset="0%" stop-color="#f8e4dc"/>
    <stop offset="62%" stop-color="#f5eee8"/>
    <stop offset="100%" stop-color="#efe4dc"/>
  </radialGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
    <stop offset="45%" stop-color="#ffffff" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="halo" cx="50%" cy="70%" r="50%">
    <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.28"/>
    <stop offset="55%" stop-color="${GLOW}" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="${GLOW}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="${body * 0.012}"/>
  </filter>
</defs>
<rect width="${CANVAS}" height="${CANVAS}" fill="${CREAM}"/>
<ellipse cx="${glowCx}" cy="${by + body * 0.62}" rx="${body * 0.48}" ry="${body * 0.42}" fill="url(#halo)"/>
<ellipse cx="${glowCx}" cy="${glowCy}" rx="${glowRx}" ry="${glowRy}" fill="${GLOW}" opacity="0.22" filter="url(#soft)"/>
<rect x="${porX}" y="${porY}" width="${porW}" height="${porH}" rx="${rad}" fill="url(#porcelain)"/>
<rect x="${cerX}" y="${cerY}" width="${cerW}" height="${cerH}" rx="${rad * 0.98}" fill="url(#ceramic)" stroke="#fff4ee" stroke-width="${Math.max(1.2, body * 0.008)}"/>
<ellipse cx="${cerX + cerW * 0.5}" cy="${cerY + cerH * 0.1}" rx="${sheenRx}" ry="${sheenRy}" fill="url(#sheen)"/>
<ellipse cx="${cerX + cerW * 0.32}" cy="${cerY + cerH * 0.07}" rx="${cerW * 0.11}" ry="${cerH * 0.028}" fill="#ffffff" opacity="0.8" transform="rotate(14 ${cerX + cerW * 0.32} ${cerY + cerH * 0.07})"/>
<rect x="${bezX}" y="${bezY}" width="${bezW}" height="${bezH}" rx="${bezR}" fill="url(#bezel)"/>
<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="${mr}" fill="url(#matrix)"/>
<rect x="${mx}" y="${my}" width="${mw}" height="${mh * 0.22}" rx="${mr}" fill="#5a382a" opacity="0.08"/>
${dotGrid(mx, my, mw, mh)}
${faceMarkup(mx, my, mw, mh)}
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
  { file: "icon-maskable-192.png", px: 192, contentScale: 0.78 },
  { file: "icon-maskable-512.png", px: 512, contentScale: 0.78 },
  { file: "apple-touch-icon.png", px: 180, contentScale: 0.92, dir: "public" },
];

console.log("Generating Honza icons (ceramic orb)…");
for (const t of targets) {
  const dir = t.dir ? join(ROOT, t.dir) : ICONS_DIR;
  render(svg({ contentScale: t.contentScale }), join(dir, t.file), t.px);
}

const appIcon = join(ROOT, "src", "app", "icon.png");
copyFileSync(join(ICONS_DIR, "icon-512.png"), appIcon);
console.log(`  ✓ ${appIcon.replace(ROOT + "/", "")} (512px, from icon-512)`);

rmSync(TMP, { recursive: true, force: true });
console.log("Done.");
