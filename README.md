# Drugpedia

A harm reduction reference site: searchable substance profiles and a drug
interaction checker. Compiled from [TripSit](https://tripsit.me/),
[PsychonautWiki](https://psychonautwiki.org/),
[Talk to Frank](https://www.talktofrank.com/), and
[Erowid](https://www.erowid.org/).

**Live site:** https://kaboosee.github.io/Drugpedia/

_Last updated: 10 June 2026 (drug data compiled from the TripSit snapshot in
[`data/tripsit-raw.json`](data/tripsit-raw.json))._

> **Disclaimer:** This is harm reduction guidance, not medical advice. It is
> for personal education only. If in doubt or unwell, seek medical help
> (UK: 999 · US: 911 · EU: 112 · AU: 000 · NZ: 111).

## Features

- Substance index with search (`/` or `Ctrl+K` to focus) and category filter
- Detail view: also-known-as, drug class, mechanism, effects, onset/duration,
  dosage ranges, acute risks, overdose signs, addiction potential, harm
  reduction checklist, contraindications, UK legal status, drug interactions,
  and source links
- Interaction checker with colour-coded risk levels for substance pairs
- Dark/light theme toggle (follows your OS preference by default)
- Works offline once visited (installable as a PWA)

## Running locally

There is no build step for the site — it's plain HTML/CSS/JS. The page fetches
its data from `data/drugs.json`, so it must be **served over http(s)** (opening
`index.html` from `file://` won't load the data):

```sh
npx serve .
# or
python -m http.server
```

## Data

The site reads a single compiled file, [`data/drugs.json`](data/drugs.json),
built from two sources and committed to the repo:

- **TripSit API** (`getAllDrugs`) — effects, onset, duration, dosage ranges,
  aliases, drug class, and interactions.
- **`data/curated.json`** — the hand-maintained substance set with the fields
  TripSit doesn't provide (mechanism, acute risks, harm reduction,
  contraindications) plus the curated pairwise interaction summaries.

Rebuild it with:

```sh
npm run build:data   # fetch-tripsit.js (network) + build-data.js (merge)
```

`build-data.js` is **fill-only**: curated text is authoritative and is never
overwritten — TripSit only fills fields a curated entry leaves blank. UK legal
status is authored in `build-data.js` from Talk to Frank's class/penalty
summaries (not scraped). To add a substance, add it to `data/curated.json`
(and, if it has a TripSit equivalent, map its id in the `TRIPSIT_KEY` table in
`scripts/build-data.js`), then run `npm run build:data`.

The pairwise interaction map keys two substance ids **sorted alphabetically and
joined with `|`** (e.g. `"alcohol|mdma"`); risk is one of `low | caution |
dangerous | do not combine`. Unknown pairs default to **CAUTION** with a
"limited data" message.

Run `npm test` after rebuilding — the data integrity tests catch duplicate ids,
malformed interaction keys, missing fields, and invalid risk levels.

## Development

Dev tooling (linting, formatting, tests) needs Node.js:

```sh
npm install
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # node --test (logic + data integrity tests)
```

CI runs all three on every push and blocks deployment if they fail.

### Releasing changes

Deployment to GitHub Pages is automatic on push to `master`/`main`
(`.github/workflows/deploy.yml`). **If you change any deployed asset
(`app.js`, `styles.css`, `logic.js`, `index.html`, `data/drugs.json`), bump
the `CACHE` version string at the top of [`sw.js`](sw.js)** — otherwise
returning visitors keep the old cached assets.

## Repository notes

- [`data/tripsit-raw.json`](data/tripsit-raw.json) is the committed TripSit
  snapshot used by the build; refresh it with `node scripts/fetch-tripsit.js`.
- [`logic.js`](logic.js) holds the pure, testable logic (filtering, category
  normalisation, interaction lookup); [`app.js`](app.js) holds DOM wiring.
