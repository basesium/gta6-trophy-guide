# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/basesium/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/basesium/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that guides and tracks all 55 Grand Theft Auto VI
trophies on PlayStation 5: 1 platinum, 2 gold, 6 silver and 46 bronze,
28 of them hidden until earned. Every trophy shows its official name,
description and grade exactly as PlayStation publishes them, plus a guide
written in our own words that names its sources.

## What it does

- **Checklist tracker** — tick trophies as you earn them; progress saves in
  the browser (localStorage) and survives reloads. Export it to a JSON file
  and import it back later.
- **Filters** — by kind: Story (17), Missable (1), Collectibles (6),
  Activities (31), Online (0 — GTA VI has no online trophies, the whole
  list is single-player). Plus free-text search across names, descriptions
  and guides.
- **Spoiler setting** — hides the names and descriptions of unearned story
  trophies until you earn them. Earned story trophies reveal themselves.
- **6-stage roadmap to the platinum** — story first, then side stories,
  partner feats, robberies & money, collectibles & exploration, and
  clean-up & the platinum, built from the official descriptions.
- **Missable warnings** — only one trophy can be missed: Positive Mental
  Attitude (the Chapter 1 balcony meditation). The guide flags it, explains
  the exact moment, and tells you to keep a manual save from Chapter 1.
- **Cited guides** — every trophy's guide names its sources beside it
  (Exophase for the official list, PSNProfiles for grades and PSN's tracked
  counts, Output Lag and KeenGamer for guide details). Sources are cited,
  never copied.
- **Fully offline** — static files under `app/`, no build step, no network
  requests at run time. Open `app/index.html` from any static server and it
  just works.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the whole app
- `app/data/trophies.json` — all 55 trophies with official data, guides and
  sources
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output dir and writes `dossier.json` with `vendor/makefun-frontend.ts`
- `screenshots/` — four real renders of the app itself

## Originality

Everything here is original: no Rockstar Games logo, wordmark, official
artwork, character or font. Trophy names and descriptions are shown as
PlayStation publishes them; every guide is written for this entry.

## License

MIT — see [LICENSE](LICENSE).
