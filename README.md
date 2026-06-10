# Drugpedia

A harm reduction reference site: searchable substance profiles and a drug
interaction checker. Compiled from [TripSit](https://tripsit.me/),
[PsychonautWiki](https://psychonautwiki.org/),
[Talk to Frank](https://www.talktofrank.com/), and
[Erowid](https://www.erowid.org/).

**Live site:** https://kaboosee.github.io/Drugpedia/

> **Disclaimer:** This is harm reduction guidance, not medical advice. It is
> for personal education only. If in doubt or unwell, seek medical help
> (UK: 111 / 999 · US: 911 · EU: 112 · AU: 000 · NZ: 111).

## Features

- Substance index with search (`/` or `Ctrl+K` to focus) and category filter
- Detail view: mechanism, onset/duration, dosage ranges, acute risks, harm
  reduction checklist, contraindications
- Interaction checker with colour-coded risk levels for substance pairs
- Dark/light theme toggle (follows your OS preference by default)
- Works offline once visited (installable as a PWA)

## Running locally

There is no build step — it's plain HTML/CSS/JS. Either open `index.html`
directly in a browser, or serve the folder (required for the service worker):

```sh
npx serve .
# or
python -m http.server
```

## Adding a substance

All curated data lives in [`data.js`](data.js). Add an object to
`window.substances`:

```js
{
  "id": "mdma",                  // unique, lowercase, used in interaction keys
  "name": "MDMA",
  "category": "Entactogen / Stimulant", // free text; mapped to one of the five
                                        // filter groups by normalizeCategory()
  "mechanism": "…",
  "onset": "Oral: 30–60 min.",
  "duration": "Total: 4–6 h.",
  "dosage": { "threshold": "50 mg", "light": "60 mg", "common": "75–125 mg", "strong": "150+ mg" },
  "effects": ["…"],
  "acuteRisks": ["…"],
  "harmReduction": ["…"],
  "contraindications": ["…"]
}
```

## Adding an interaction

Interactions live in `window.interactions` in the same file, keyed by the two
substance ids **sorted alphabetically and joined with `|`**:

```js
"2cb|alcohol": {
  risk: "caution", // one of: "low" | "caution" | "dangerous" | "do not combine"
  summary: "Increased nausea and impaired judgment.",
},
```

Unknown pairs default to **CAUTION** with a "limited data" message.

Run `npm test` after editing — the data integrity tests catch duplicate ids,
malformed interaction keys, and invalid risk levels.

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
(`.github/workflows/deploy.yml`). **If you change any site asset
(`app.js`, `data.js`, `styles.css`, `logic.js`, `index.html`), bump the
`CACHE` version string at the top of [`sw.js`](sw.js)** — otherwise returning
visitors keep the old cached assets.

## Repository notes

- [`frank_drugs.json`](frank_drugs.json) is raw source material from Talk to
  Frank used to derive many of the profiles. It is kept for provenance but is
  **not** deployed or loaded by the site.
- [`logic.js`](logic.js) holds the pure, testable logic (filtering, category
  normalisation, interaction lookup); [`app.js`](app.js) holds DOM wiring.
