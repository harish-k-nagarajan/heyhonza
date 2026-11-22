"""Trace Prague references into drawable strokes + transparent plates.

Panorama plate keeps the stock skyline pixels (wordmark and watermark removed).
Strokes are the ink boundary, so the draw-on follows the picture instead of a
medial-axis skeleton of the filled roofs.

Traveler plate is the v1 figure only: coat, scarf, backpack, phone.
The Ahoj bubble, statue, and bridge are masked out.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = ROOT / "src" / "prague-trace.ts"


def zhang_suen(img: np.ndarray) -> np.ndarray:
    """Thin a mask. Neighbor counts must be Python ints; numpy bools OR instead of add."""
    skel = img.astype(bool).copy()
    h, w = skel.shape
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            ys, xs = np.where(skel)
            remove = []
            for y, x in zip(ys.tolist(), xs.tolist()):
                if y == 0 or x == 0 or y == h - 1 or x == w - 1:
                    continue
                p = (
                    skel[y - 1, x],
                    skel[y - 1, x + 1],
                    skel[y, x + 1],
                    skel[y + 1, x + 1],
                    skel[y + 1, x],
                    skel[y + 1, x - 1],
                    skel[y, x - 1],
                    skel[y - 1, x - 1],
                )
                n = sum(int(v) for v in p)
                if n < 2 or n > 6:
                    continue
                seq = p + (p[0],)
                trans = sum(int(seq[i]) == 0 and int(seq[i + 1]) == 1 for i in range(8))
                if trans != 1:
                    continue
                if step == 0:
                    if p[0] and p[2] and p[4]:
                        continue
                    if p[2] and p[4] and p[6]:
                        continue
                else:
                    if p[0] and p[2] and p[6]:
                        continue
                    if p[0] and p[4] and p[6]:
                        continue
                remove.append((y, x))
            if remove:
                changed = True
                for y, x in remove:
                    skel[y, x] = False
    return skel


def neighbors(y: int, x: int, h: int, w: int):
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy == 0 and dx == 0:
                continue
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                yield ny, nx


def trace_paths(mask: np.ndarray, min_len: int) -> list[list[tuple[float, float]]]:
    h, w = mask.shape
    pixels = {(int(y), int(x)) for y, x in zip(*np.where(mask))}
    visited: set[tuple] = set()
    paths: list[list[tuple[float, float]]] = []

    def walk(start, nxt):
        path = [start, nxt]
        prev, cur = start, nxt
        seen = {start, nxt}
        while True:
            nbs = [p for p in neighbors(cur[0], cur[1], h, w) if p in pixels and p != prev]
            if len(nbs) != 1:
                break
            nxt_p = nbs[0]
            if nxt_p in seen:
                path.append(nxt_p)
                break
            prev, cur = cur, nxt_p
            seen.add(cur)
            path.append(cur)
            if len(path) > 8000:
                break
        return path

    def consume(path):
        for a, b in zip(path, path[1:]):
            visited.add(tuple(sorted((a, b))))
        if len(path) >= min_len:
            paths.append([(float(x), float(y)) for y, x in path])

    endpoints = [
        p
        for p in pixels
        if sum(q in pixels for q in neighbors(p[0], p[1], h, w)) == 1
    ]
    for ep in endpoints:
        nbs = [q for q in neighbors(ep[0], ep[1], h, w) if q in pixels]
        if not nbs:
            continue
        edge = tuple(sorted((ep, nbs[0])))
        if edge in visited:
            continue
        consume(walk(ep, nbs[0]))

    for p in pixels:
        for q in neighbors(p[0], p[1], h, w):
            if q not in pixels:
                continue
            edge = tuple(sorted((p, q)))
            if edge in visited:
                continue
            consume(walk(p, q))
    return paths


def rdp(points: list[tuple[float, float]], eps: float) -> list[tuple[float, float]]:
    if len(points) < 3:
        return points
    ax, ay = points[0]
    bx, by = points[-1]
    vx, vy = bx - ax, by - ay
    den = (vx * vx + vy * vy) ** 0.5 or 1.0
    worst_i, worst = 0, -1.0
    for i, (x, y) in enumerate(points[1:-1], 1):
        dist = abs((x - ax) * vy - (y - ay) * vx) / den
        if dist > worst:
            worst, worst_i = dist, i
    if worst > eps:
        return rdp(points[: worst_i + 1], eps)[:-1] + rdp(points[worst_i:], eps)
    return [points[0], points[-1]]


def to_d(points: list[tuple[float, float]]) -> str:
    parts = [f"M{points[0][0]:.1f} {points[0][1]:.1f}"]
    for x, y in points[1:]:
        parts.append(f"L{x:.1f} {y:.1f}")
    return " ".join(parts)


def length(points: list[tuple[float, float]]) -> float:
    return sum(
        ((points[i + 1][0] - points[i][0]) ** 2 + (points[i + 1][1] - points[i][1]) ** 2) ** 0.5
        for i in range(len(points) - 1)
    )


def boundary(ink: np.ndarray) -> np.ndarray:
    edge = ink.copy()
    inner = (
        ink[1:-1, 1:-1]
        & ink[:-2, 1:-1]
        & ink[2:, 1:-1]
        & ink[1:-1, :-2]
        & ink[1:-1, 2:]
    )
    edge[1:-1, 1:-1] &= ~inner
    return edge


def close_and_fill(mask: np.ndarray, radius: int) -> np.ndarray:
    h, w = mask.shape
    dil = mask.copy()
    ys, xs = np.where(mask)
    for y, x in zip(ys.tolist(), xs.tolist()):
        dil[max(0, y - radius) : min(h, y + radius + 1), max(0, x - radius) : min(w, x + radius + 1)] = True
    outside = np.zeros_like(dil)
    stack = [(0, 0)]
    outside[0, 0] = True
    while stack:
        y, x = stack.pop()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and not dil[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = True
                stack.append((ny, nx))
    return ~outside & ~mask


def runs(mask: np.ndarray, min_len: int = 1) -> list[tuple[int, int, int]]:
    """Horizontal ink runs as (x0, x1, y), x1 exclusive."""
    found = []
    h, w = mask.shape
    for y in range(h):
        row = mask[y]
        x = 0
        while x < w:
            if not row[x]:
                x += 1
                continue
            x0 = x
            while x < w and row[x]:
                x += 1
            if x - x0 >= min_len:
                found.append((x0, x, y))
            x += 1
    return found


def panorama():
    im = Image.open(ROOT / "references" / "prague-panorama-outline.png").convert("RGB")
    a = np.asarray(im).astype(np.uint8)
    lum = a.mean(axis=2)
    ink = lum < 168
    # Stock script wordmark and the bottom credit line are not the skyline.
    ink[0:50, 40:330] = False
    ink[248:, :] = False

    plate = np.zeros((*a.shape[:2], 4), np.uint8)
    plate[ink, :3] = a[ink]
    plate[ink, 3] = 255
    PUBLIC.mkdir(exist_ok=True)
    Image.fromarray(plate, "RGBA").save(PUBLIC / "prague-panorama.png")

    grouped: dict[int, list[str]] = {i: [] for i in range(7)}
    width = a.shape[1]
    count = 0
    for x0, x1, y in runs(ink, 1):
        mid = (x0 + x1) / 2
        # Arches and the deck baseline draw with the opening, so the bridge
        # is readable before the right-hand tower finishes.
        if y > 186:
            band = 0
        else:
            band = 1 + min(5, int((mid / width) * 6))
        grouped[band].append(f"M{x0:.1f} {y:.1f} L{x1 - 0.2:.1f} {y:.1f}")
        count += 1
    print("panorama runs", count)
    return [{"d": " ".join(grouped[b]), "band": b} for b in range(7) if grouped[b]]


def traveler():
    im = Image.open(ROOT / "references" / "prague-art-direction-v1.png").convert("RGB")
    a = np.asarray(im).astype(np.uint8)
    r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
    dark = (r < 105) & (g < 120) & (b < 110)
    red = (r > 175) & (g < 145) & (b < 135)
    y0, y1, x0, x1 = 430, 941, 80, 450
    dark_c = dark[y0:y1, x0:x1].copy()
    red_c = red[y0:y1, x0:x1].copy()
    # Bubble is up-right of the hair. Phone sits lower, so this cut misses it.
    dark_c[0:130, 200:] = False
    red_c[0:130, 200:] = False
    # Statue column, and bridge dashes that sit past the phone.
    dark_c[0:210, 0:55] = False
    dark_c[:, 300:] = False
    red_c[:, 300:] = False

    crop = a[y0:y1, x0:x1]
    keep = dark_c | red_c
    plate = np.zeros((*crop.shape[:2], 4), np.uint8)
    # Ink and scarf only. The coat interior is a cream shape in FilmPrague,
    # because the dashed outline does not close well enough to flood-fill.
    plate[keep, :3] = crop[keep]
    plate[keep, 3] = 255
    Image.fromarray(plate, "RGBA").save(PUBLIC / "prague-traveler.png")

    grouped: dict[tuple[int, str], list[str]] = {}
    for ink_name, mask in (("line", dark_c), ("scarf", red_c)):
        for rx0, rx1, y in runs(mask, 1):
            # Head to feet, four beats, so the coat draws after the hair.
            band = min(3, int((y / max(1, mask.shape[0])) * 4))
            grouped.setdefault((band, ink_name), []).append(
                f"M{rx0:.1f} {y:.1f} L{rx1 - 0.2:.1f} {y:.1f}"
            )
    strokes = [
        {"d": " ".join(parts), "band": band, "ink": ink_name}
        for (band, ink_name), parts in sorted(grouped.items())
    ]
    box = {"w": int(crop.shape[1]), "h": int(crop.shape[0])}
    return strokes, box


def preview(_pano_n: int) -> None:
    pano = Image.open(PUBLIC / "prague-panorama.png").convert("RGBA")
    trav = Image.open(PUBLIC / "prague-traveler.png").convert("RGBA")
    canvas = Image.new("RGBA", (1100, 720), (245, 242, 238, 255))
    canvas.paste(pano.resize((780, 420), Image.NEAREST), (20, 10), pano.resize((780, 420), Image.NEAREST))
    t = trav.resize((280, 400), Image.BILINEAR)
    canvas.paste(t, (30, 300), t)
    canvas.convert("RGB").save("/tmp/prague-inspect/trace-preview.png")
    print("preview", _pano_n)


def main() -> None:
    strokes = panorama()
    traveler_strokes, box = traveler()
    preview(len(strokes))
    OUT.write_text(
        "/** Generated by scripts/trace-prague.py from the reference plates. Re-run to refresh. */\n"
        "export type PanoramaStroke = {d: string; band: number};\n"
        "export type TravelerStroke = {d: string; band: number; ink: \"line\" | \"scarf\"};\n"
        f"export const PANORAMA_STROKES: PanoramaStroke[] = {json.dumps(strokes)};\n\n"
        f"export const TRAVELER_STROKES: TravelerStroke[] = {json.dumps(traveler_strokes)};\n\n"
        f"export const TRAVELER_BOX = {json.dumps(box)} as const;\n"
        "export const PANORAMA_BOX = {w: 520, h: 280} as const;\n"
    )
    print("pano", len(strokes), "traveler", len(traveler_strokes), "box", box)


if __name__ == "__main__":
    main()
