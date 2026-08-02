# Phase 1 — Font expansion + Design Lab UX

## Shipped in this phase

- **10 new Google Fonts** added to the Design Lab pipeline (18 total):
  - Pixel: Doto, Press Start 2P
  - Mono: Syne Mono, JetBrains Mono, Space Mono, Roboto Mono
  - Sans: IBM Plex Sans, DM Sans, Space Grotesk, Alan Sans
- **Grouped font picker** — Dot-matrix & pixel · Monospace · Sans-serif
- **Weight preview row** for the selected body font
- **Czech badge** — green "Czech OK" vs amber "Czech partial"
- **Typography hierarchy specimen** — kicker, display title, body, helper

## Manual test steps

1. Open **Settings** → scroll to **Design Lab**
2. Confirm header shows **18 fonts**
3. Open **Body** dropdown — verify three optgroups
4. Pick **JetBrains Mono** or **IBM Plex Sans** — weight chips should show multiple weights
5. Pick **Share Tech Mono** — single weight + helper note about hierarchy
6. Pick **Alan Sans** for body — badge should say **Czech partial**; inspect specimen for fallback glyphs
7. Switch **Display** to **Doto** or **Press Start 2P** — display line should update
8. **Reload** the page — fonts should apply without flash (pre-paint script)
9. Navigate to **Chat** — body copy should use selected body font

## Not in Phase 1 (deferred)

- Freedom Forever, Onder, Monólito (commercial / license)
- App-wide TYPE migration (Phase 2)
- Button depth overhaul (Phase 3)
