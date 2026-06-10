const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { RISK_LEVELS } = require("../logic.js");

// data.js is a browser script assigning to window; evaluate it against a stub.
const code = fs.readFileSync(path.join(__dirname, "..", "data.js"), "utf8");
const sandbox = {};
new Function("window", code)(sandbox);
const { substances, interactions } = sandbox;

const REQUIRED_FIELDS = [
  "id",
  "name",
  "category",
  "mechanism",
  "onset",
  "duration",
  "dosage",
  "acuteRisks",
  "harmReduction",
  "contraindications",
];

test("data.js defines substances and interactions", () => {
  assert.ok(Array.isArray(substances) && substances.length > 0);
  assert.ok(interactions && typeof interactions === "object");
});

test("substance ids are unique", () => {
  const ids = substances.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every substance has the required fields", () => {
  substances.forEach((substance) => {
    REQUIRED_FIELDS.forEach((field) => {
      assert.ok(
        substance[field] !== undefined && substance[field] !== "",
        `${substance.id || "(no id)"} is missing "${field}"`,
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
