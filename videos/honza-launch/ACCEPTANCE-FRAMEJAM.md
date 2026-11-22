# Honza launch v9 — FrameJam acceptance (rev_f7c10fd8c6)

**Source:** 18 pins on v7 review `rev_f7c10fd8c6` (v8 rail timing @ 30fps where noted).  
**Copy lock:** `SCRIPT-v8.md` only — marketing lines are not rewritten in code except where SCRIPT already matches a pin.  
**Grade still root:** `videos/honza-launch/renders/_review/` (pin stills + act checkpoints).  
**Final render:** `videos/honza-launch/renders/v9.mp4`

| id | time (v7) | ~frame @30fps | requirement (v9) | how to verify |
|----|-----------|---------------|-------------------|---------------|
| c_653a7e2fec | 0:04.59 | 138 | Act I skyline reads as **Prague**, not a generic block stack; **tram** visible on Charles Bridge; landmarks identifiable (castle left, bridge tower, domes). | Frame **138** (or Act I **90**); still `renders/_review/pin-c_653a7e2fec.png`; compare to `references/prague-panorama-outline.png` + `references/prague-art-direction-v1.png`. |
| c_d115a4cd74 | 0:06.76 | 203 | Left stage shows **Charles Bridge → Lower Town** vista with castle; no mystery shapes in mid-left void; built from reference silhouette language. | Frame **203** or Act I **230**; still `renders/_review/pin-c_d115a4cd74.png`; panorama + v1 refs in pixels. |
| c_9d0524290a | 0:06.76 | 203 | **Human** at embankment (coat, scarf, backpack, phone); **no snowman** figure; **no random “Ahoj” speech bubble**. | Frame **230**; still `renders/_review/pin-c_9d0524290a.png`; no bubble, proportions human. |
| c_72460ceb3b | 0:06.76 | 203 | Rail copy = SCRIPT v8 Act I (Prague life → real-world Czech pressure); not “good Czech teacher” opener. | Frame **165–280**; still `renders/_review/pin-c_72460ceb3b.png`; text matches `copy.ts` / SCRIPT lines 1–6. |
| c_3ec471e639 | 0:08.61 | 258 | Act I **motion/transitions** feel deliberate (draw-on, staggered fills); pace not sluggish; copy from SCRIPT. | Frame **258**; still `renders/_review/pin-c_3ec471e639.png`; motion continuous, no pops. |
| c_93ff5ed44b | 0:09.70 | 291 | Intro: **blank cream slate** → dots → colors → glyph → recess **in**; dominant **“Introducing Honza”**; **not** orb rolling over Prague. | Frame **360** (`BEATS.introTitle`); still `renders/_review/pin-c_93ff5ed44b.png`. |
| c_0b8955f90e | 0:10.28 | 308 | No **sticker/orb pasted on Prague**; Prague exits before intro build; intro motions polished (tokenized easing/duration). | Frame **308**; still `renders/_review/pin-c_0b8955f90e.png`; left stage intro only. |
| c_4a0b7dcd4f | 0:12.50 | 375 | Honza positioning line = SCRIPT intro #2–4 (practice after class; notes-driven); optional **tutor / friend** flip beat if motion supports it. | Frame **400–520**; still `renders/_review/pin-c_4a0b7dcd4f.png`. |
| c_caf395f62c | 0:12.50 | 375 | Intro screen is **marketing-worthy** (glyph build + headline), not raw app chrome square. | Frame **375**; still `renders/_review/pin-c_caf395f62c.png`. |
| c_dd4994da4d | 0:16.31 | 489 | Product chapter copy = SCRIPT Act III benefit story (notes → chat → call); no v7 teacher-generic lines. | Frame **540** (`BEATS.docIn`); still `renders/_review/pin-c_dd4994da4d.png`. |
| c_157ae4c74f | 0:17.66 | 530 | Doc beat copy matches SCRIPT (notes as source of truth); no “lesson ends in notes” weak line. | Frame **600**; still `renders/_review/pin-c_157ae4c74f.png`. |
| c_db3253d974 | 0:17.66 | 530 | **Google Doc full-height** on stage; **no Honza orb on doc**; text fill motion; knedlíky highlight when rail says so. | Frame **620** (`BEATS.knedlikyMark`); still `renders/_review/pin-c_db3253d974.png`. |
| c_bfad8af9f9 | 0:19.80 | 594 | Chat beat: corrections from **teacher notes** context; lines appear with motion, not jump cuts; SCRIPT chat/call story. | Frame **760–848**; still `renders/_review/pin-c_bfad8af9f9.png`. |
| c_b70587b3b7 | 0:28.83 | 865 | Call/chat phone stage: same polish as prior acts (enter/exit asymmetry, no orphan UI). | Frame **865**; still `renders/_review/pin-c_b70587b3b7.png`. |
| c_1d7d0574d0 | 0:49.29 | 1479 | Notify copy = SCRIPT (daily notifications, nudge when you forget — **not** “skip a day” misread). | Frame **1080–1150**; still `renders/_review/pin-c_1d7d0574d0.png`. |
| c_5b9039af46 | 0:52.31 | 1569 | **Lock → end card**: motivated transition; **no flying orange dot** bridge. | Frame **1280–1360**; still `renders/_review/pin-c_5b9039af46.png`. |
| c_dc91bdd407 | 0:55.40 | 1662 | End card layout like v7 (liked design); headline/sub per SCRIPT close. | Frame **1388** (`BEATS.endCta`); still `renders/_review/pin-c_dc91bdd407.png`. |
| c_411e6118b5 | 0:55.40 | 1662 | CTA text **“Say hi to Honza”** + URL per SCRIPT. | Frame **1388**; still `renders/_review/pin-c_411e6118b5.png`. |

## Act I checkpoint stills (phase B1)

| frame | file | pass criteria |
|-------|------|----------------|
| 0 | `renders/_review/act1-f0.png` | Draw begins; Prague silhouette + embankment staging. |
| 90 | `renders/_review/act1-f90.png` | Castle/bridge/towers readable; tram not yet or entering. |
| 230 | `renders/_review/act1-f230.png` | Human at embankment; obligated-reply vignettes; tram on bridge; no Ahoj bubble. |

## Call regression (phase B3)

| frame | file | pass criteria |
|-------|------|----------------|
| 840 | `renders/_review/f840-call.png` | Full **Call** UI visible when rail shows **Call Honza** (`BEATS.callIn`). |

## Self-grade column (fill after v9 render)

Add `pass` / `fail` + one-line note per row when grading `renders/v9.mp4`.