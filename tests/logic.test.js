const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CATEGORY_LABELS,
  RISK_LEVELS,
  normalizeCategory,
  pairKey,
  filterSubstances,
  getInteraction,
  splitMatch,
  extractCommonRange,
  normalizeDosage,
} = require("../logic.js");

test("normalizeCategory maps raw categories to filter groups", () => {
  assert.equal(normalizeCategory({ category: "Stimulant" }), "stimulants");
  assert.equal(normalizeCategory({ category: "Psychedelic" }), "psychedelics");
  assert.equal(
    normalizeCategory({ category: "Dissociative" }),
    "dissociatives",
  );
  assert.equal(normalizeCategory({ category: "Depressant" }), "depressants");
  assert.equal(normalizeCategory({ category: "Opioid" }), "depressants");
  assert.equal(normalizeCategory({ category: "Cannabinoid" }), "depressants");
  assert.equal(normalizeCategory({ category: "Empathogen" }), "empathogens");
});

test("normalizeCategory: entactogen wins over stimulant in combined labels", () => {
  assert.equal(
    normalizeCategory({ category: "Entactogen / Stimulant" }),
    "empathogens",
  );
});

test("normalizeCategory falls back to stimulants for unknown or missing", () => {
  assert.equal(normalizeCategory({ category: "Something else" }), "stimulants");
  assert.equal(normalizeCategory({}), "stimulants");
});

test("every filter group has a display label", () => {
  const substances = [
    { category: "Stimulant" },
    { category: "Psychedelic" },
    { category: "Dissociative" },
    { category: "Depressant" },
    { category: "Entactogen" },
  ];
  substances.forEach((substance) => {
    assert.ok(CATEGORY_LABELS[normalizeCategory(substance)]);
  });
});

test("pairKey is symmetric and sorted", () => {
  assert.equal(pairKey("mdma", "alcohol"), "alcohol|mdma");
  assert.equal(pairKey("alcohol", "mdma"), "alcohol|mdma");
});

const sample = [
  { id: "mdma", name: "MDMA", category: "Entactogen / Stimulant" },
  { id: "lsd", name: "LSD", category: "Psychedelic" },
  { id: "alcohol", name: "Alcohol", category: "Depressant" },
  { id: "ketamine", name: "Ketamine", category: "Dissociative" },
];

test("filterSubstances matches query case-insensitively", () => {
  const result = filterSubstances(sample, "mdm", "all");
  assert.deepEqual(
    result.map((s) => s.id),
    ["mdma"],
  );
});

test("filterSubstances filters by category group", () => {
  const result = filterSubstances(sample, "", "depressants");
  assert.deepEqual(
    result.map((s) => s.id),
    ["alcohol"],
  );
});

test("filterSubstances sorts alphabetically by name", () => {
  const result = filterSubstances(sample, "", "all");
  assert.deepEqual(
    result.map((s) => s.name),
    ["Alcohol", "Ketamine", "LSD", "MDMA"],
  );
});

test("filterSubstances returns empty array when nothing matches", () => {
  assert.deepEqual(filterSubstances(sample, "zzz", "all"), []);
});

const sampleInteractions = {
  "alcohol|mdma": { risk: "dangerous", summary: "Dehydration risk." },
};

test("getInteraction finds known pairs in either argument order", () => {
  const forward = getInteraction(sampleInteractions, "mdma", "alcohol");
  const reverse = getInteraction(sampleInteractions, "alcohol", "mdma");
  assert.equal(forward.risk, "dangerous");
  assert.equal(forward.known, true);
  assert.deepEqual(forward, reverse);
});

test("getInteraction defaults unknown pairs to caution", () => {
  const result = getInteraction(sampleInteractions, "lsd", "ketamine");
  assert.equal(result.risk, "caution");
  assert.equal(result.known, false);
  assert.match(result.summary, /Limited data/);
});

test("getInteraction returns null for empty or identical selections", () => {
  assert.equal(getInteraction(sampleInteractions, "", "mdma"), null);
  assert.equal(getInteraction(sampleInteractions, "mdma", ""), null);
  assert.equal(getInteraction(sampleInteractions, "mdma", "mdma"), null);
});

test("splitMatch returns whole text when query is empty", () => {
  assert.deepEqual(splitMatch("MDMA", ""), [{ text: "MDMA", match: false }]);
  assert.deepEqual(splitMatch("MDMA", "  "), [{ text: "MDMA", match: false }]);
});

test("splitMatch marks case-insensitive matches", () => {
  assert.deepEqual(splitMatch("Ketamine", "keta"), [
    { text: "Keta", match: true },
    { text: "mine", match: false },
  ]);
});

test("splitMatch handles no match and multiple occurrences", () => {
  assert.deepEqual(splitMatch("LSD", "x"), [{ text: "LSD", match: false }]);
  assert.deepEqual(splitMatch("aXbXc", "x"), [
    { text: "a", match: false },
    { text: "X", match: true },
    { text: "b", match: false },
    { text: "X", match: true },
    { text: "c", match: false },
  ]);
});

test("splitMatch segments reassemble to the original text", () => {
  const segments = splitMatch("Methamphetamine", "met");
  assert.equal(segments.map((s) => s.text).join(""), "Methamphetamine");
});

test("extractCommonRange pulls the range out of prose", () => {
  assert.equal(
    extractCommonRange("Varies. Common range: 10-20 mg. Start low."),
    "10-20 mg",
  );
  assert.equal(extractCommonRange("No range given"), "No range given");
  assert.equal(extractCommonRange(""), "-");
  assert.equal(extractCommonRange(null), "-");
});

test("normalizeDosage passes object dosages through with defaults", () => {
  assert.deepEqual(normalizeDosage({ threshold: "5 mg", common: "10 mg" }), {
    threshold: "5 mg",
    light: "-",
    common: "10 mg",
    strong: "-",
  });
});

test("normalizeDosage handles string and missing dosages", () => {
  assert.deepEqual(normalizeDosage("Common range: 1-2 g."), {
    threshold: "-",
    light: "-",
    common: "1-2 g",
    strong: "-",
  });
  assert.deepEqual(normalizeDosage(null), {
    threshold: "-",
    light: "-",
    common: "-",
    strong: "-",
  });
});

test("RISK_LEVELS covers the four risk values with labels and classes", () => {
  ["low", "caution", "dangerous", "do not combine"].forEach((risk) => {
    assert.ok(RISK_LEVELS[risk].label);
    assert.ok(RISK_LEVELS[risk].className);
    assert.ok(RISK_LEVELS[risk].order >= 1);
  });
});
