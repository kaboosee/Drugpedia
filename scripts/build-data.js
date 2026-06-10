/**
 * Compiles the static site dataset: data/curated.json + data/tripsit-raw.json
 * -> data/drugs.json (the single source of truth the browser fetches).
 *
 * Philosophy (matches the old enrich-data.js): TripSit supplies quantitative
 * fields (effects, onset, duration, dosage, aliases, class, interactions);
 * curated text is authoritative and never overwritten — TripSit only fills
 * fields the curated entry leaves blank. Run with: node scripts/build-data.js
 * (after node scripts/fetch-tripsit.js).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const curated = read("data/curated.json");
const tripsit = read("data/tripsit-raw.json");

// curated substance id -> TripSit drug key. null = no TripSit equivalent
// (UK-specific category entries, or generics with no single representative).
// A few map to a representative member of a class (benzodiazepines->diazepam,
// n-bomb->25i-nbome) to pull in useful combos/effects without misleading text.
const TRIPSIT_KEY = {
  mdma: "mdma",
  cocaine: "cocaine",
  "2cb": "2c-b",
  cannabis: "cannabis",
  alcohol: "alcohol",
  ketamine: "ketamine",
  lsd: "lsd",
  psilocybin: "mushrooms",
  amphetamine: "amphetamine",
  methamphetamine: "methamphetamine",
  benzodiazepines: "diazepam",
  opioids: null,
  ghb: "ghb",
  nitrous: "nitrous",
  dxm: "dextromethorphan",
  piperazines: null,
  "synthetic-opioids": null,
  "glues-gases-and-aerosols": null,
  amt: "amt",
  "amyl-nitrate": null,
  "anabolic-steroids": null,
  pcp: "pcp",
  dimethyltryptamine: "dmt",
  tobacco: null,
  methylphenidate: "methylphenidate",
  "synthetic-cathinones": null,
  "new-psychoactive-substances": null,
  "benzofuran-compounds": null,
  "n-bomb": "25i-nbome",
  phenazepam: "phenazepam",
  mephedrone: "mephedrone",
  heroin: "heroin",
  khat: "khat",
  pma: "pma",
  vapes: null,
  codeine: "codeine",
  "opioid-painkillers": null,
  "2-dpmp": "2-dpmp",
  etizolam: "etizolam",
  salvia: "salvia",
  naphyrone: "naphyrone",
  etomidate: null,
  gabapentin: "gabapentin",
  "synthetic-and-semi-synthetic-cannabinoids": null,
  "image-and-performance-enhancing-drug-ipeds": null,
  methadone: "methadone",
  pregabalin: "pregabalin",
  mescaline: "mescaline",
  "methoxetamine-mxe": "mxe",
  "2c-family": null,
  nicotine: "nicotine",
  tramadol: "tramadol",
  "xylazine-medetomidine-and-detomidine": null,
  "5-it": "5-it",
};

// UK legal status. Curated entries hold a terse class label; expand it to a
// 2-3 sentence Talk-to-Frank-style summary with the standard Misuse of Drugs
// Act 1971 / Psychoactive Substances Act 2016 penalties. Authored by hand here
// (not scraped) so the boilerplate isn't repeated across every curated entry.
const MODA_A =
  "Class A drug under the Misuse of Drugs Act 1971. Possession can mean up to 7 years in prison, an unlimited fine, or both. Supplying or producing it can mean up to life in prison, an unlimited fine, or both.";
const MODA_B =
  "Class B drug under the Misuse of Drugs Act 1971. Possession can mean up to 5 years in prison, an unlimited fine, or both. Supplying or producing it can mean up to 14 years in prison, an unlimited fine, or both.";
const MODA_C =
  "Class C drug under the Misuse of Drugs Act 1971. Possession can mean up to 2 years in prison, an unlimited fine, or both. Supplying or producing it can mean up to 14 years in prison, an unlimited fine, or both.";
const PSA =
  "Covered by the Psychoactive Substances Act 2016. Possession for personal use is not an offence (except in prison), but producing, supplying or importing it can mean up to 7 years in prison, an unlimited fine, or both.";
const LEGAL_OK =
  "Legal to buy and possess in the UK, subject to age and sale restrictions. Not controlled under the Misuse of Drugs Act 1971.";

const LEGAL_BY_LABEL = {
  "Class A": MODA_A,
  "Class B": MODA_B,
  "Class C": MODA_C,
  "Class Legal": LEGAL_OK,
  "Class Psychoactive Substances": PSA,
  "Class The Medicines Act":
    "Not controlled under the Misuse of Drugs Act 1971 and exempt from the Psychoactive Substances Act 2016. Legal to possess; sale is restricted under medicines and consumer-safety regulations.",
  "Class None":
    "Not specifically controlled under the Misuse of Drugs Act 1971. May still be regulated as a medicine or under the Psychoactive Substances Act 2016 depending on how it is sold or used.",
  "Class B or Psychoactive Substances":
    "Most synthetic cannabinoids are Class B drugs under the Misuse of Drugs Act 1971; newer ones may instead fall under the Psychoactive Substances Act 2016. Possession of a Class B drug can mean up to 5 years in prison; supply or production up to 14 years.",
};

// Substances whose curated label is ambiguous or wrong; set the summary directly.
const LEGAL_BY_ID = {
  gabapentin: MODA_C, // reclassified Class C in 2019
  pregabalin: MODA_C, // reclassified Class C in 2019
  pma: MODA_A, // PMA/PMMA are Class A
  opioids:
    "Most opioids are controlled under the Misuse of Drugs Act 1971 — commonly Class A (e.g. heroin, methadone) or Class B/C — and many are prescription-only medicines. Possessing them without a prescription, or supplying them, is an offence carrying penalties up to life imprisonment for Class A drugs.",
  "opioid-painkillers":
    "Prescription-only medicines controlled under the Misuse of Drugs Act 1971 (class varies by drug, e.g. codeine is Class B, oxycodone Class A). Possession without a prescription or supplying to others is an offence; penalties depend on the drug's class.",
  "image-and-performance-enhancing-drug-ipeds":
    "Anabolic steroids and many IPEDs are Class C drugs under the Misuse of Drugs Act 1971. It is legal to possess them for personal use, but supplying or producing them can mean up to 14 years in prison, an unlimited fine, or both.",
  tobacco: LEGAL_OK,
  dxm: "Legal in the UK as an ingredient in some over-the-counter cough medicines. Not controlled under the Misuse of Drugs Act 1971, though sales of medicines containing it may be restricted.",
  "5-it":
    "Covered by the Psychoactive Substances Act 2016. Possession for personal use is not an offence (except in prison), but producing, supplying or importing it can mean up to 7 years in prison.",
};

// Returns { summary, klass } where klass is a short legal-class code the UI
// renders as a colour-coded badge (A/B/C/PSA/Legal), or null when it doesn't
// map cleanly (e.g. opioids, which span several classes).
const classifyLegal = (id, label) => {
  const summary = LEGAL_BY_ID[id] || LEGAL_BY_LABEL[label] || orNull(label);
  let klass = null;
  if (summary === MODA_A) {
    klass = "A";
  } else if (summary === MODA_B) {
    klass = "B";
  } else if (summary === MODA_C) {
    klass = "C";
  } else if (summary === PSA) {
    klass = "PSA";
  } else if (summary === LEGAL_OK) {
    klass = "Legal";
  } else if (id === "image-and-performance-enhancing-drug-ipeds") {
    klass = "C";
  } else if (id === "5-it") {
    klass = "PSA";
  }
  return { summary, klass };
};

// TripSit combo status -> our risk level (see RISK_LEVELS in logic.js).
const STATUS_TO_RISK = {
  "Low Risk & Synergy": "low",
  "Low Risk & No Synergy": "low",
  "Low Risk & Decrease": "low",
  Caution: "caution",
  Unsafe: "dangerous",
  Dangerous: "do not combine",
};
const RISK_ORDER = { "do not combine": 0, dangerous: 1, caution: 2, low: 3 };

// Category tags that aren't a drug class; used elsewhere or just noise.
const NON_CLASS = new Set([
  "common",
  "habit-forming",
  "inactive",
  "tentative",
  "research-chemical",
]);

const titleCase = (s) =>
  s.replace(/(^|[\s-])([a-z])/g, (_, p, c) => p + c.toUpperCase());

const isBlank = (v) =>
  v == null || (typeof v === "string" && v.trim() === "") || v === "-";
const isEmptyList = (v) => !Array.isArray(v) || v.length === 0;
const orNull = (v) => (isBlank(v) ? null : v);
const orEmpty = (v) => (isEmptyList(v) ? [] : v);

const reverseKey = {}; // tripsit key -> curated id, for resolving combos
for (const [id, key] of Object.entries(TRIPSIT_KEY)) {
  if (key) {
    reverseKey[key] = id;
  }
}

// TripSit stores many interactions against class-level combo keys (e.g.
// "opioids", "benzodiazepines", "amphetamines") that aren't standalone drug
// entries. Map each class key to the curated substance that "owns" it, so a
// combo against the class resolves to one substance.
const CLASS_OWNER = {
  opioids: "opioids",
  benzodiazepines: "benzodiazepines",
  amphetamines: "amphetamine",
};

// Specific substances whose own TripSit entry is a stub (no combos) inherit
// the interaction profile of the class that owns them.
const INHERIT = {
  heroin: "opioids",
  methadone: "opioids",
  codeine: "opioids",
  "opioid-painkillers": "opioids",
  "synthetic-opioids": "opioids",
  etizolam: "benzodiazepines",
  phenazepam: "benzodiazepines",
  methamphetamine: "amphetamine",
};

// A combo target key -> the single curated id it resolves to (or null/external).
const ownerId = (key) => CLASS_OWNER[key] || reverseKey[key] || null;
const curatedName = (id) => curated.substances[id].name;
const pairKey = (a, b) => [a, b].sort().join("|");

const formatMeasure = (m) => {
  // formatted_onset/_duration are usually { _unit, value }, occasionally a
  // per-route object. Render the simple form; skip anything exotic.
  if (!m || typeof m !== "object") {
    return null;
  }
  if (typeof m.value === "string") {
    return m._unit ? `${m.value} ${m._unit}` : m.value;
  }
  return null;
};

// Preference order when a drug lists doses for several routes of administration.
const ROUTE_PREFERENCE = [
  "Oral",
  "Insufflated",
  "Vaporized",
  "Vaporized",
  "Smoked",
  "Sublingual",
  "Buccal",
  "Rectal",
  "Intravenous",
];

const dosageFromTripsit = (drug) => {
  const dose = drug.formatted_dose;
  if (!dose || typeof dose !== "object") {
    return null;
  }
  const routes = Object.keys(dose);
  const route = ROUTE_PREFERENCE.find((r) => routes.includes(r)) || routes[0];
  if (!route) {
    return null;
  }
  const r = dose[route];
  const pick = (k) => orNull(r[k]);
  return {
    route,
    threshold: pick("Threshold"),
    light: pick("Light"),
    common: pick("Common"),
    strong: pick("Strong"),
    heavy: pick("Heavy"),
  };
};

const dosageFromCurated = (dosage) => {
  const d = dosage && typeof dosage === "object" ? dosage : {};
  // Always return the full 5-key shape (null where unknown) so dosage_ranges
  // is never null — the UI and tests rely on a consistent object.
  return {
    route: null,
    threshold: orNull(d.threshold),
    light: orNull(d.light),
    common: orNull(d.common),
    strong: orNull(d.strong),
    heavy: null,
  };
};

const sourceUrls = (id, drug) => {
  const urls = [];
  if (drug) {
    if (drug.properties && drug.properties.wiki) {
      urls.push(drug.properties.wiki);
    }
    if (drug.links && drug.links.experiences) {
      urls.push(drug.links.experiences);
    }
    urls.push(`https://drugs.tripsit.me/${TRIPSIT_KEY[id]}`);
  }
  return [...new Set(urls)];
};

const ids = Object.keys(curated.substances);
const moreSevere = (a, b) => (RISK_ORDER[a] <= RISK_ORDER[b] ? a : b);

// Build interaction edges from every source drug's combos. Edges between our
// substances are keyed by sorted pair; combos against substances we don't list
// are kept as per-drug "external" rows for display richness only.
const edges = new Map(); // "a|b" -> { risk, note }
const externalRows = {}; // id -> Map(displayName -> { severity, effect })
ids.forEach((id) => {
  externalRows[id] = new Map();
});

const addEdge = (a, b, risk, note) => {
  if (a === b) {
    return;
  }
  const key = pairKey(a, b);
  const cur = edges.get(key);
  if (!cur) {
    edges.set(key, { risk, note: note || null });
  } else {
    cur.risk = moreSevere(cur.risk, risk);
    cur.note = cur.note || note || null;
  }
};

for (const id of ids) {
  const drug = TRIPSIT_KEY[id] ? tripsit[TRIPSIT_KEY[id]] : null;
  if (!drug || !drug.combos) {
    continue;
  }
  for (const [target, combo] of Object.entries(drug.combos)) {
    const risk = STATUS_TO_RISK[combo && combo.status];
    if (!risk) {
      continue;
    }
    const note = combo.note ? combo.note.trim() : null;
    const other = ownerId(target);
    if (other) {
      addEdge(id, other, risk, note);
    } else {
      const name =
        (tripsit[target] && tripsit[target].pretty_name) || titleCase(target);
      const row = externalRows[id].get(name);
      if (!row || RISK_ORDER[risk] < RISK_ORDER[row.severity]) {
        externalRows[id].set(name, { severity: risk, effect: note });
      }
    }
  }
}

// Per-drug interaction list, sorted most-dangerous first. Members of a class
// (heroin, etizolam, …) display the interactions of the class they inherit.
const interactionsFor = (id) => {
  const owner = INHERIT[id] || id;
  const rows = new Map(); // displayName -> { severity, effect }
  for (const [key, edge] of edges) {
    const [a, b] = key.split("|");
    const other = a === owner ? b : b === owner ? a : null;
    if (other === null || other === id) {
      continue;
    }
    rows.set(curatedName(other), { severity: edge.risk, effect: edge.note });
  }
  for (const [name, row] of externalRows[owner] || []) {
    rows.set(name, row);
  }
  return [...rows.entries()]
    .map(([substance, row]) => ({
      substance,
      severity: row.severity,
      effect: row.effect || null,
    }))
    .sort(
      (a, b) =>
        RISK_ORDER[a.severity] - RISK_ORDER[b.severity] ||
        a.substance.localeCompare(b.substance),
    );
};

let tripsitMatched = 0;
const substances = Object.keys(curated.substances).map((id) => {
  const c = curated.substances[id];
  const key = TRIPSIT_KEY[id];
  const drug = key ? tripsit[key] : null;
  if (drug) {
    tripsitMatched++;
  }

  const categories = drug
    ? (drug.categories || []).filter((t) => !NON_CLASS.has(t))
    : [];
  const drugClass = categories.length
    ? categories.map(titleCase).join(", ")
    : orNull(c.category);

  const addiction =
    drug && (drug.categories || []).includes("habit-forming")
      ? "Habit-forming"
      : null;

  const legal = classifyLegal(id, c.legalStatus);

  return {
    id,
    name: c.name,
    also_known_as:
      drug && !isEmptyList(drug.aliases) ? drug.aliases : orEmpty(c.synonyms),
    drug_class: drugClass,
    mechanism:
      orNull(c.mechanism) ||
      (drug && drug.properties ? orNull(drug.properties.summary) : null),
    effects:
      drug && !isEmptyList(drug.formatted_effects)
        ? drug.formatted_effects
        : orEmpty(c.effects),
    onset:
      orNull(c.onset) ||
      (drug && formatMeasure(drug.formatted_onset)) ||
      (drug && drug.properties ? orNull(drug.properties.onset) : null),
    duration:
      orNull(c.duration) ||
      (drug && formatMeasure(drug.formatted_duration)) ||
      (drug && drug.properties ? orNull(drug.properties.duration) : null),
    dosage_ranges:
      (drug && dosageFromTripsit(drug)) || dosageFromCurated(c.dosage),
    acute_risks: orEmpty(c.acuteRisks),
    overdose_signs: null,
    addiction_potential: addiction,
    harm_reduction: orEmpty(c.harmReduction),
    contraindications: orEmpty(c.contraindications),
    legal_status_uk: legal.summary,
    legal_class: legal.klass,
    common_adulterants: null,
    interactions: interactionsFor(id),
    source_urls: sourceUrls(id, drug),
  };
});

// Pairwise interaction map for the checker. Built from the edges above, then
// expanded so class members (heroin, etizolam, …) inherit their class's pairs,
// and finally overlaid with the curated map, which is authoritative.
const GENERIC_SUMMARY = {
  low: "Generally considered lower risk, though no combination is fully safe.",
  caution:
    "Use caution — combining these can increase unpredictability or side effects.",
  dangerous:
    "Considered unsafe — combining these carries a serious risk of harm.",
  "do not combine":
    "Do not combine — this mixture carries a high risk of serious harm.",
};

const interactions = {};
const setPair = (a, b, risk, summary, fillOnly) => {
  if (a === b) {
    return;
  }
  const key = pairKey(a, b);
  if (fillOnly && interactions[key]) {
    return;
  }
  interactions[key] = { risk, summary };
};

// 1. Edges derived from TripSit combos.
for (const [key, edge] of edges) {
  const [a, b] = key.split("|");
  setPair(a, b, edge.risk, edge.note || GENERIC_SUMMARY[edge.risk]);
}
// 2. Curated pairs are authoritative — they overwrite TripSit-derived ones.
for (const [key, val] of Object.entries(curated.interactions)) {
  const [a, b] = key.split("|");
  setPair(a, b, val.risk, val.summary);
}
// 3. Expand (fill-only): each member inherits its owner's pairs, e.g.
//    opioids|alcohol -> heroin|alcohol, so selecting a specific member in the
//    checker still resolves. Snapshot first so members don't chain off members.
for (const [member, owner] of Object.entries(INHERIT)) {
  for (const [key, val] of Object.entries({ ...interactions })) {
    const [a, b] = key.split("|");
    const other = a === owner ? b : b === owner ? a : null;
    if (other === null || other === member) {
      continue;
    }
    setPair(member, other, val.risk, val.summary, true);
  }
}

const out = { substances, interactions };
fs.writeFileSync(
  path.join(ROOT, "data", "drugs.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(
  `Wrote data/drugs.json: ${substances.length} substances ` +
    `(${tripsitMatched} TripSit-matched), ${
      Object.keys(interactions).length
    } interaction pairs`,
);
