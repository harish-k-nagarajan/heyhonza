# Phase 0 — Setup checklist

## Done in this phase

- [x] Branch `cursor/design-elevation-1034` created
- [x] Plan stored in `design update/DESIGN_ELEVATION_PLAN.md`
- [x] This audit checklist

## Manual test notes (before / after)

Capture at **430px** width on: Welcome, Chat, Call, Settings → Design Lab.

| Screen | Before screenshot | After screenshot | Notes |
|--------|-------------------|------------------|-------|
| Settings → Design Lab | | | Font count, grouped picker |
| Chat (Hmat) | | | Body + display faces |
| Welcome (Classic) | | | Default fonts unchanged |

## ui-ux-pro-max skill

Optional install for future agent queries:

```bash
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
```

Search example:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "monospace pixel" --domain typography
```
