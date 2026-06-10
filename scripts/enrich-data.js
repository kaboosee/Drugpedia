/**
 * Merges frank_drugs.json (see fetch-frank.js) into data.js.
 *
 * Fill-only: curated fields are never overwritten, only missing/Unknown/empty
 * ones are populated. Also removes Frank-imported duplicates of curated
 * substances. Idempotent — safe to re-run after a fresh fetch.
 * Run with: node scripts/enrich-data.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Frank entries that duplicate a curated substance (curated id in comment).
const REMOVE = new Set([
  "ecstasy", // mdma
  "magic-mushrooms", // psilocybin
  "nitrous-oxide", // nitrous
  "ghb-gbl", // ghb
]);

// substance id -> Frank slug, where they differ (curated ids and ids
// imported under slugs Frank has since renamed).
const SLUG_FOR_ID = {
  mdma: "ecstasy",
  psilocybin: "magic-mushrooms",
  amphetamine: "speed",
  nitrous: "nitrous-oxide",
  ghb: "ghb",
  opioids: "opiateopioid-painkillers",
  "2cb": "2c",
  "amyl-nitrate": "poppers",
  "synthetic-cathinones": "cathinones",
  "opioid-painkillers": "opiateopioid-painkillers",
  "synthetic-and-semi-synthetic-cannabinoids": "synthetic-cannabinoids",
  "image-and-performance-enhancing-drug-ipeds":
    "image-and-performance-enhancing-drug",
  "methoxetamine-mxe": "methoxetamine",
  "2c-family": "2c",
};

const SINGULAR_CATEGORY = {
  Stimulants: "Stimulant",
  Depressants: "Depressant",
  Hallucinogens: "Hallucinogen",
  "Synthetic opioids": "Synthetic opioid",
};

// For substances whose Frank record has no category, or with no Frank page.
const CATEGORY_OVERRIDES = {
  "5-it": "Stimulant",
  cannabis: "Cannabinoid",
  "synthetic-and-semi-synthetic-cannabinoids": "Cannabinoid",
  "nitrous-oxide": "Dissociative",
};

const missingText = (v) =>
  !v || v === "-" || /^(unknown|not available\.?)$/i.test(String(v).trim());
const missingList = (v) => !Array.isArray(v) || v.length === 0;

const sandbox = {};
new Function("window", fs.readFileSync(path.join(ROOT, "data.js"), "utf8"))(
  sandbox,
);
const substances = sandbox.substances;
const interactions = sandbox.interactions;

const frank = new Map(
  JSON.parse(fs.readFileSync(path.join(ROOT, "frank_drugs.json"), "utf8")).map(
    (d) => [d.slug, d],
  ),
);

let filled = 0;
const kept = substances.filter((s) => !REMOVE.has(s.id));

for (const s of kept) {
  const r = frank.get(SLUG_FOR_ID[s.id] || s.id);
  if (missingText(s.category)) {
    const mapped =
      CATEGORY_OVERRIDES[s.id] ||
      (r && SINGULAR_CATEGORY[r.category]) ||
      (r && r.category) ||
      null;
    if (mapped) {
      s.category = mapped;
      filled++;
    }
  }
  if (!r) {
    continue;
  }
  if (missingText(s.legalStatus) && r.legalClass) {
    s.legalStatus = r.legalClass.replace(/^Class:\s*/i, "Class ");
    filled++;
  }
  if (missingList(s.synonyms) && r.synonyms.length) {
    s.synonyms = r.synonyms;
    filled++;
  }
  if (missingText(s.mechanism) && r.description) {
    s.mechanism = r.description;
    filled++;
  }
  if (missingText(s.onset) && r.onset) {
    s.onset = r.onset;
    filled++;
  }
  if (missingText(s.duration) && r.duration) {
    s.duration = r.duration;
    filled++;
  }
  if (missingList(s.effects)) {
    const effects = r.effects.length
      ? r.effects.slice(0, 6)
      : [r.feelings, r.effectsSummary].filter(Boolean);
    if (effects.length) {
      s.effects = effects;
      filled++;
    }
  }
  if (missingList(s.acuteRisks)) {
    const risks = r.risks.length
      ? r.risks.slice(0, 6)
      : [r.risksSummary].filter(Boolean);
    if (risks.length) {
      s.acuteRisks = risks;
      filled++;
    }
  }
  if (missingList(s.harmReduction)) {
    const items = [];
    if (r.mixing) {
      items.push(r.mixing);
    }
    if (/\bcut\b/i.test(r.cutWith || "")) {
      items.push(
        "Purity is unpredictable; products may be cut with other substances",
      );
    }
    items.push("Start with a small test dose and wait before taking more");
    items.push("Avoid using alone and tell someone what you have taken");
    s.harmReduction = items;
    filled++;
  }
}

const out =
  "window.substances = " +
  JSON.stringify(kept, null, 2) +
  ";\n\nwindow.interactions = " +
  JSON.stringify(interactions, null, 2) +
  ";\n";

fs.writeFileSync(path.join(ROOT, "data.js"), out);
console.log(
  `Wrote data.js: ${kept.length} substances (removed ${
    substances.length - kept.length
  } duplicates), filled ${filled} fields`,
);
