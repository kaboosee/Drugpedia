const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { RISK_LEVELS } = require("../logic.js");

// The compiled dataset the browser fetches at runtime. Built by
// scripts/build-data.js from data/curated.json + data/tripsit-raw.json.
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "drugs.json"), "utf8"),
);
const { substances, interactions } = data;

// Fields every substance must carry. Curated/optional fields (overdose_signs,
// addiction_potential, common_adulterants) may legitimately be null, so they
// are checked for presence, not truthiness, further down.
const REQUIRED_FIELDS = [
  "id",
  "name",
  "also_known_as",
  "drug_class",
  "mechanism",
  "effects",
  "onset",
  "duration",
  "dosage_ranges",
  "acute_risks",
  "harm_reduction",
  "contraindications",
  "legal_status_uk",
  "interactions",
  "source_urls",
];

const LIST_FIELDS = [
  "also_known_as",
  "effects",
  "acute_risks",
  "harm_reduction",
  "contraindications",
  "interactions",
  "source_urls",
];

const NULLABLE_FIELDS = [
  "overdose_signs",
  "addiction_potential",
  "common_adulterants",
];

const DOSAGE_KEYS = ["threshold", "light", "common", "strong", "heavy"];

test("drugs.json defines substances and interactions", () => {
  assert.ok(Array.isArray(substances) && substances.length > 0);
  assert.ok(interactions && typeof interactions === "object");
});

test("substance ids are unique", () => {
  const ids = substances.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every substance has the required fields present", () => {
  substances.forEach((substance) => {
    REQUIRED_FIELDS.forEach((field) => {
      assert.ok(
        substance[field] !== undefined,
        `${substance.id || "(no id)"} is missing "${field}"`,
      );
    });
    NULLABLE_FIELDS.forEach((field) => {
      assert.ok(
        field in substance,
        `${substance.id} is missing nullable field "${field}"`,
      );
    });
  });
});

test("list fields are arrays", () => {
  substances.forEach((substance) => {
    LIST_FIELDS.forEach((field) => {
      assert.ok(
        Array.isArray(substance[field]),
        `${substance.id}.${field} must be an array`,
      );
    });
  });
});

test("dosage_ranges carries the five range keys", () => {
  substances.forEach((substance) => {
    const d = substance.dosage_ranges;
    assert.ok(
      d && typeof d === "object",
      `${substance.id} has no dosage_ranges`,
    );
    DOSAGE_KEYS.forEach((key) => {
      assert.ok(key in d, `${substance.id}.dosage_ranges missing "${key}"`);
    });
  });
});

test("per-drug interaction severities are valid risk levels", () => {
  substances.forEach((substance) => {
    substance.interactions.forEach((entry) => {
      assert.ok(
        typeof entry.substance === "string" && entry.substance.length,
        `${substance.id} has an interaction without a substance name`,
      );
      assert.ok(
        RISK_LEVELS[entry.severity],
        `${substance.id} interaction "${entry.substance}" has invalid severity "${entry.severity}"`,
      );
    });
  });
});

test("interaction keys are two existing ids, sorted, joined by |", () => {
  const ids = new Set(substances.map((s) => s.id));
  Object.keys(interactions).forEach((key) => {
    const parts = key.split("|");
    assert.equal(parts.length, 2, `"${key}" must contain exactly one |`);
    const [a, b] = parts;
    assert.ok(ids.has(a), `"${key}": unknown substance id "${a}"`);
    assert.ok(ids.has(b), `"${key}": unknown substance id "${b}"`);
    assert.notEqual(a, b, `"${key}" pairs a substance with itself`);
    assert.deepEqual(
      [a, b],
      [a, b].slice().sort(),
      `"${key}" ids are not in sorted order`,
    );
  });
});

test("every interaction has a valid risk and a summary", () => {
  Object.entries(interactions).forEach(([key, interaction]) => {
    assert.ok(
      RISK_LEVELS[interaction.risk],
      `"${key}" has invalid risk "${interaction.risk}"`,
    );
    assert.ok(
      typeof interaction.summary === "string" && interaction.summary.length,
      `"${key}" is missing a summary`,
    );
  });
});
