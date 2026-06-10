/**
 * Downloads the full TripSit drug dataset to data/tripsit-raw.json.
 *
 * TripSit's getAllDrugs endpoint returns every drug in a single response, each
 * with aliases, categories, formatted dose/onset/duration, effects, and the
 * `combos` interaction map. We snapshot it here (committed to the repo, like
 * frank_drugs.json) so the build is reproducible offline and the API is never
 * hit at runtime. Run with: node scripts/fetch-tripsit.js
 */
const fs = require("fs");
const path = require("path");

const ENDPOINT = "https://tripbot.tripsit.me/api/tripsit/getAllDrugs";
const OUT = path.join(__dirname, "..", "data", "tripsit-raw.json");

async function main() {
  process.stdout.write(`Fetching ${ENDPOINT} ...\n`);
  const res = await fetch(ENDPOINT);
  if (!res.ok) {
    throw new Error(`TripSit returned HTTP ${res.status}`);
  }
  const body = await res.json();
  if (body.err) {
    throw new Error(`TripSit error: ${JSON.stringify(body.err)}`);
  }

  // body.data is an array of single-key objects: [{ "1,4-butanediol": {...} }, ...].
  // Flatten to a { name: drug } map for easy lookup by the build script.
  const drugs = {};
  for (const entry of body.data) {
    for (const [name, drug] of Object.entries(entry)) {
      drugs[name] = drug;
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(drugs, null, 2) + "\n");
  process.stdout.write(`Wrote ${OUT}: ${Object.keys(drugs).length} drugs\n`);
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(1);
});
