import {interpolate} from "remotion";

import {dotoFamily} from "./fonts";
import {LEAVE} from "./scene";
import {PLACE} from "./copy";

const COLS = 44;
const ROWS = 30;
const CELL = 18;
const DOT = CELL * 0.78;
const PAD = (CELL - DOT) / 2;

const INK = "#243D2C";
const ROOF = "#E8432D";
const BLUE = "#3A7BD5";
const SKY = "#EEF2FF";
const TREE = "#2E7D32";
const WHITE = "#FFFFFF";

type Kind =
  | "stone"
  | "roof"
  | "wall"
  | "tree"
  | "bridge"
  | "water"
  | "waterLight"
  | "boat"
  | "sky"
  | "skyLight"
  | "flagBlue"
  | "flagWhite"
  | "flagRed";

const FILL: Record<Kind, string> = {
  stone: INK,
  wall: INK,
  bridge: INK,
  boat: INK,
  roof: ROOF,
  tree: TREE,
  water: BLUE,
  waterLight: SKY,
  sky: BLUE,
  skyLight: SKY,
  flagBlue: BLUE,
  flagWhite: WHITE,
  flagRed: ROOF,
};

/** Hill, then roofs, then the bridge, then the river. */
const LAYER: Record<Kind, 0 | 1 | 2 | 3> = {
  stone: 0,
  tree: 0,
  sky: 0,
  skyLight: 0,
  flagBlue: 0,
  flagWhite: 0,
  flagRed: 0,
  roof: 1,
  wall: 1,
  bridge: 2,
  water: 3,
  waterLight: 3,
  boat: 3,
};

const RANK: Record<Kind, number> = {
  flagBlue: 10,
  flagWhite: 10,
  flagRed: 10,
  boat: 9,
  bridge: 8,
  roof: 7,
  wall: 6,
  stone: 5,
  tree: 4,
  water: 3,
  waterLight: 3,
  sky: 1,
  skyLight: 1,
};

const LAYER_START = [0, 14, 28, 42];
const SPAN = 16;
const FADE = 5;

function buildGrid() {
  const grid: (Kind | null)[][] = Array.from({length: ROWS}, () => Array(COLS).fill(null));

  const put = (x: number, y: number, kind: Kind) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= COLS || yi >= ROWS) return;
    const prev = grid[yi][xi];
    if (prev && RANK[prev] >= RANK[kind]) return;
    grid[yi][xi] = kind;
  };

  const cloud = (cx: number, cy: number, rx: number, ry: number) => {
    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        if (nx * nx + ny * ny > 1) continue;
        if ((Math.round(x) + Math.round(y)) % 2 !== 0) continue;
        put(x, y, (Math.round(x) + Math.round(y) * 2) % 5 === 0 ? "sky" : "skyLight");
      }
    }
  };

  cloud(14, 2, 7, 2);
  cloud(36, 3, 6, 2);

  const tree = (x: number, y: number) => {
    put(x, y, "tree");
    put(x - 1, y + 1, "tree");
    put(x, y + 1, "tree");
    put(x + 1, y + 1, "tree");
    put(x - 1, y + 2, "tree");
    put(x, y + 2, "tree");
    put(x + 1, y + 2, "tree");
  };

  // Cathedral: two spires and a nave, left of center on the hill.
  for (let y = 2; y <= 7; y++) {
    put(16, y, "stone");
    put(17, y, "stone");
    put(20, y, "stone");
    put(21, y, "stone");
  }
  put(16, 1, "stone");
  put(21, 1, "stone");
  for (let x = 15; x <= 22; x++) {
    put(x, 7, "roof");
    put(x, 8, "stone");
  }

  // Palace wings. Windows stay empty so the hill is not one block.
  for (let x = 6; x <= 14; x++) {
    put(x, 7, "roof");
    if (x % 3 !== 0) put(x, 8, "stone");
    if (x % 3 !== 1) put(x, 9, "stone");
  }
  for (let x = 23; x <= 31; x++) {
    put(x, 7, "roof");
    if (x % 3 !== 0) put(x, 8, "stone");
    if (x % 3 !== 2) put(x, 9, "stone");
  }

  tree(8, 5);
  tree(27, 5);
  tree(39, 10);

  // Band of roofs across the town.
  for (let x = 2; x < COLS - 2; x++) {
    const gable = x % 4;
    if (gable === 1) put(x, 11, "roof");
    put(x, 12, "roof");
    if (gable !== 0) put(x, 13, "wall");
  }

  // Charles Bridge. The tall tower stands on the right half, clear of the spires.
  for (let y = 11; y <= 16; y++) {
    put(33, y, "bridge");
    put(34, y, "bridge");
    put(35, y, "bridge");
  }
  put(34, 10, "bridge");
  grid[12][34] = null;
  grid[14][34] = null;

  for (let y = 13; y <= 16; y++) {
    put(10, y, "bridge");
    put(11, y, "bridge");
  }
  put(10, 12, "bridge");
  put(11, 12, "bridge");

  for (let x = 2; x <= 41; x++) {
    put(x, 16, "bridge");
    if (x % 5 === 0) put(x, 15, "bridge");
  }
  for (let x = 4; x <= 40; x++) {
    const span = (x - 4) % 6;
    if (span < 2) {
      put(x, 17, "bridge");
      put(x, 18, "bridge");
      put(x, 19, "bridge");
    }
  }

  // River under the arches, with a lighter streak in it.
  for (let y = 17; y <= 28; y++) {
    for (let x = 0; x < COLS; x++) {
      if (y < 20 && grid[y][x] === "bridge") continue;
      if ((x + y) % 5 === 0) continue;
      put(x, y, y % 4 === 0 && x % 2 === 0 ? "waterLight" : "water");
    }
  }

  const boat = (x: number, y: number) => {
    put(x + 2, y - 2, "boat");
    put(x + 1, y - 1, "boat");
    put(x + 2, y - 1, "boat");
    put(x + 3, y - 1, "boat");
    for (let i = 0; i < 6; i++) put(x + i, y, "boat");
  };
  boat(6, 24);
  boat(20, 26);

  // Czech flag, hoist on the left, in the sky.
  const flag = ["BBWWWWWW", "BBBWWWWW", "BBBRRRRR", "BBRRRRRR", "BRRRRRRR"];
  flag.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      const ch = row[dx];
      const kind = ch === "B" ? "flagBlue" : ch === "W" ? "flagWhite" : "flagRed";
      put(1 + dx, 1 + dy, kind);
    }
  });

  return grid;
}

const GRID = buildGrid();

const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;

export function FilmPrague({frame, leave}: {frame: number; leave: number}) {
  const thin = interpolate(frame, [leave - 12, leave], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: LEAVE,
  });
  const thinScale = 1 - thin * 0.78;

  const cells: {key: string; x: number; y: number; size: number; rx: number; fill: string; opacity: number}[] = [];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const kind = GRID[y][x];
      const originX = x * CELL;
      const originY = y * CELL;

      if (!kind) {
        const d = DOT * 0.28 * thinScale;
        cells.push({
          key: `b-${x}-${y}`,
          x: originX + CELL / 2 - d / 2,
          y: originY + CELL / 2 - d / 2,
          size: d,
          rx: d * 0.35,
          fill: "rgba(0,0,0,0.10)",
          opacity: 1 - thin,
        });
        continue;
      }

      const start = LAYER_START[LAYER[kind]] + (x / (COLS - 1)) * SPAN;
      const reveal = interpolate(frame, [start, start + FADE], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

      if (reveal < 0.04) {
        const d = DOT * 0.28 * thinScale;
        cells.push({
          key: `i-${x}-${y}`,
          x: originX + CELL / 2 - d / 2,
          y: originY + CELL / 2 - d / 2,
          size: d,
          rx: d * 0.35,
          fill: "rgba(0,0,0,0.10)",
          opacity: 1 - thin,
        });
        continue;
      }

      const size = DOT * thinScale;
      const inset = (DOT - size) / 2;
      cells.push({
        key: `d-${x}-${y}`,
        x: originX + PAD + inset,
        y: originY + PAD + inset,
        size,
        rx: Math.min(size * 0.22, CELL * 0.28),
        fill: FILL[kind],
        opacity: reveal * (1 - thin),
      });
    }
  }

  return (
    <div style={{width: WIDTH}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden style={{display: "block"}}>
        {cells.map((cell) => (
          <rect
            key={cell.key}
            x={cell.x}
            y={cell.y}
            width={cell.size}
            height={cell.size}
            rx={cell.rx}
            fill={cell.fill}
            opacity={cell.opacity}
          />
        ))}
      </svg>
      <p
        style={{
          margin: "16px 0 0",
          textAlign: "center",
          fontFamily: dotoFamily,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: "0.12em",
          color: INK,
        }}
      >
        {PLACE}
      </p>
    </div>
  );
}
