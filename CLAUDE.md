# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A harm reduction reference site (substance profiles + drug interaction checker), deployed to GitHub Pages at https://kaboosee.github.io/Drugpedia/. Plain HTML/CSS/JS with **no bundler** — Node.js is used for dev tooling (lint, format, tests) and a data build step that compiles `data/drugs.json`.

## Commands

```sh
npm install
npm run build:data         # fetch TripSit + merge curated -> data/drugs.json
npm run lint               # ESLint (flat config, eslint.config.js)
npm run format:check       # Prettier check; `npm run format` to fix
npm test                   # node --test "tests/**/*.test.js"
node --test tests/logic.test.js   # run a single test file
```

Run locally with `npx serve .` (or `python -m http.server`). **Serving over http is required** — the page fetches `data/drugs.json`, which fails on `file://`, and the service worker also needs http to register.

CI (`.github/workflows/deploy.yml`) runs lint + format:check + test on every push to master/main and blocks GitHub Pages deployment if any fail. CI does **not** run the data build — `data/drugs.json` is committed.

## Architecture

Script loading order in `index.html`: `logic.js` → `app.js` (plain browser scripts, no modules). `app.js` `fetch()`es `data/drugs.json` at runtime, then renders.

- **`data/drugs.json`** — the compiled dataset the browser reads (the single source of truth). Shape: `{ substances: [...], interactions: { "a|b": {risk, summary} } }`. The pairwise `interactions` map is keyed by two substance ids **sorted alphabetically and joined with `|`** (e.g. `"2cb|alcohol"`); risk is one of `"low" | "caution" | "dangerous" | "do not combine"` (`RISK_LEVELS` in logic.js). Unknown pairs fall back to CAUTION at runtime. **Generated — don't hand-edit.**
- **Data build** — `scripts/fetch-tripsit.js` snapshots the TripSit `getAllDrugs` API to `data/tripsit-raw.json` (committed). `scripts/build-data.js` merges `data/curated.json` + `data/tripsit-raw.json` → `data/drugs.json`. **Fill-only**: curated text is authoritative; TripSit only fills blank fields and supplies effects/onset/duration/dosage/aliases/class/interactions. Per-substance UK legal status is authored in `build-data.js` (Talk to Frank class/penalty summaries; not scraped). To add a substance: edit `data/curated.json`, optionally map its id in the `TRIPSIT_KEY` table in `build-data.js`, then `npm run build:data`.
- **`logic.js`** — pure, testable logic (filtering, category normalisation, interaction lookup, dosage normalisation). UMD-style wrapper: exposes `window.DrugpediaLogic` in the browser and `module.exports` under Node (how tests import it). **Pure logic goes here, never in app.js.**
- **`app.js`** — DOM wiring only (async data fetch + bootstrap, rendering, event listeners, theme toggle, keyboard shortcuts, mobile tabs, service worker registration). Destructures everything it needs from `window.DrugpediaLogic`.
- **`sw.js`** — service worker for offline/PWA. Network-first for navigations, cache-first for assets (including `data/drugs.json`).
- **`frank_drugs.json`** / `scripts/fetch-frank.js` / `scripts/enrich-data.js` — older Talk to Frank source data and its merge script; kept for provenance, **not** part of the current build.

Tests (`tests/`, `node:test` + `node:assert/strict`): `logic.test.js` requires `logic.js` directly; `data.test.js` `JSON.parse`s `data/drugs.json` and enforces data integrity (unique ids, required snake_case fields, list fields are arrays, 5-key `dosage_ranges`, valid per-drug interaction severities, sorted `|`-joined pairwise keys, valid risk levels). Run `npm test` after any data or schema change.

`normalizeCategory()` in logic.js maps a substance's `drug_class` field (free text) to one of six filter groups (stimulants, psychedelics, dissociatives, depressants, empathogens, other) by keyword matching — new substances need a `drug_class` string one of its keyword checks recognises, or they fall into "other".

## Releasing

Deployment is automatic on push to master/main. **If you change any deployed asset (`index.html`, `app.js`, `logic.js`, `styles.css`, `data/drugs.json`), bump the `CACHE` version string at the top of `sw.js`** — otherwise returning visitors keep stale cached files.
