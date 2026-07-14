// Generates Honza PWA icons from the exact idle HonzaOrb dot-matrix face.
// Mirrors geometry + palette in src/components/honza/HonzaOrb.tsx (idle state).
// Renders SVG -> PNG via rsvg-convert. Run: node scripts/generate-icons.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const TMP = join(ROOT, "public", "icons", ".tmp");

// --- Palette (idle state) — keep in sync with HONZA_STATE_COLORS.idle ---
const BG = "#FFF4EE";
const ACCENT = "#E8432D";

// --- Geometry — keep in sync with HonzaOrb.tsx ---
const GRID = 15;
const VIEW = 90;
const CELL = VIEW / GRID;
const DOT = CELL * 0.82;
const PAD = (CELL - DOT) / 2;
const BG_DOT_ALPHA = 0.1;
const FAINT_OPACITY = 0.42;

const k = (x, y) => `${x},${y}`;

// Idle face — copied from HonzaOrb IDLE_ACCENT / IDLE_FAINT.
const ACCENT_CELLS = new Set([
  k(3, 4), k(4, 4), k(3, 5), k(4, 5),
  k(10, 4), k(11, 4), k(10, 5), k(11, 5),
  k(4, 10), k(5, 11), k(6, 11), k(7, 11), k(8, 11), k(9, 11), k(10, 10),
]);
const FAINT_CELLS = new Set([k(1, 7), k(13, 7)]);

function faceCells() {
  const rx = Math.min(DOT * 0.22, CELL * 0.28);
  const bgD = DOT * 0.28;
  let out = "";
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const key = k(x, y);
      const xi = x * CELL + PAD;
      const yi = y * CELL + PAD;
      if (ACCENT_CELLS.has(key)) {
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

// scale: fraction of canvas the face grid occupies (1 = full-bleed).
// Maskable icons keep content inside the ~80% safe zone.
function svg({ scale = 1 }) {
  const face = faceCells();
  const faceSize = VIEW * scale;
  const offset = (VIEW - faceSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEW}" height="${VIEW}" viewBox="0 0 ${VIEW} ${VIEW}">
<rect x="0" y="0" width="${VIEW}" height="${VIEW}" fill="${BG}"/>
<g transform="translate(${offset} ${offset}) scale(${scale})">${face}</g>
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
  { file: "icon-192.png", px: 192, scale: 1 },
  { file: "icon-512.png", px: 512, scale: 1 },
  { file: "icon-maskable-192.png", px: 192, scale: 0.58 },
  { file: "icon-maskable-512.png", px: 512, scale: 0.58 },
  // apple-touch-icon: opaque, modest padding (iOS rounds corners itself).
  { file: "apple-touch-icon.png", px: 180, scale: 0.72, dir: "public" },
];

console.log("Generating Honza icons…");
for (const t of targets) {
  const dir = t.dir ? join(ROOT, t.dir) : ICONS_DIR;
  render(svg({ scale: t.scale }), join(dir, t.file), t.px);
}

rmSync(TMP, { recursive: true, force: true });
console.log("Done.");
