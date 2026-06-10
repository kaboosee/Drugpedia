# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A harm reduction reference site (substance profiles + drug interaction checker), deployed to GitHub Pages at https://kaboosee.github.io/Drugpedia/. Plain HTML/CSS/JS with **no build step** — Node.js is used only for dev tooling (lint, format, tests).

## Commands

```sh
npm install
npm run lint               # ESLint (flat config, eslint.config.js)
npm run format:check       # Prettier check; `npm run format` to fix
npm test                   # node --test "tests/**/*.test.js"
node --test tests/logic.test.js   # run a single test file
```

Run locally: open `index.html` directly, or `npx serve .` (serving is required for the service worker to register).

CI (`.github/workflows/deploy.yml`) runs lint + format:check + test on every push to master/main and blocks GitHub Pages deployment if any fail. All three must pass before pushing.

## Architecture

Script loading order in `index.html`: `data.js` → `logic.js` → `app.js`. All are plain browser scripts (no modules) communicating via globals:

- **`data.js`** — all curated content. Assigns `window.substances` (array of profile objects) and `window.interactions` (object keyed by the two substance ids **sorted alphabetically and joined with `|`**, e.g. `"2cb|alcohol"`). Risk values must be one of `"low" | "caution" | "dangerous" | "do not combine"` (defined in `RISK_LEVELS` in logic.js). Unknown pairs fall back to CAUTION at runtime.
- **`logic.js`** — pure, testable logic (filtering, category normalisation, interaction lookup, dosage normalisation). Uses a UMD-style wrapper: exposes `window.DrugpediaLogic` in the browser and `module.exports` under Node, which is how tests import it. **Pure logic goes here, never in app.js.**
- **`app.js`** — DOM wiring only (rendering, event listeners, theme toggle, keyboard shortcuts, mobile tabs, service worker registration). Destructures everything it needs from `window.DrugpediaLogic`.
- **`sw.js`** — service worker for offline/PWA. Network-first for navigations, cache-first for assets.
- **`frank_drugs.json`** — structured source data scraped from Talk to Frank; not deployed and not loaded by the site. Regenerate with `node scripts/fetch-frank.js`, then merge into data.js with `node scripts/enrich-data.js` (fill-only: never overwrites curated fields). Don't hand-edit it.

Tests (`tests/`, `node:test` + `node:assert/strict`): `logic.test.js` requires `logic.js` directly; `data.test.js` evaluates `data.js` against a stub `window` via `new Function("window", code)` and enforces data integrity (unique ids, required fields, sorted `|`-joined interaction keys, valid risk levels). Run `npm test` after any `data.js` edit.

`normalizeCategory()` in logic.js maps the free-text `category` field of each substance to one of six filter groups (stimulants, psychedelics, dissociatives, depressants, empathogens, other) by keyword matching — new substances need a `category` string that one of its keyword checks recognises, or they fall into "other".

## Releasing

Deployment is automatic on push to master/main. **If you change any deployed asset (`index.html`, `app.js`, `logic.js`, `data.js`, `styles.css`), bump the `CACHE` version string at the top of `sw.js`** — otherwise returning visitors keep stale cached files.
