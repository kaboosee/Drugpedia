/**
 * Re-scrapes frank_drugs.json from talktofrank.com.
 *
 * The site is Next.js: every page embeds the full Contentful record in a
 * __NEXT_DATA__ script tag, which is far richer than the visible HTML the
 * original import scraped (drug class, categories, effects, risks, onset,
 * duration, synonyms). Run with: node scripts/fetch-frank.js
 */
const fs = require("fs");
const path = require("path");

const BASE = "https://www.talktofrank.com";
const OUT = path.join(__dirname, "..", "frank_drugs.json");

const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");

const stripTags = (html) =>
  decodeEntities(String(html || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

// Extract <li> items as plain-text bullets.
const bullets = (html) => {
  const items = [];
  const re = /<li[^>]*>(.*?)<\/li>/gs;
  let m;
  while ((m = re.exec(String(html || ""))) !== null) {
    const text = stripTags(m[1]);
    if (text.length > 3) {
      items.push(text);
    }
  }
  return items;
};

const nextData = (html) => {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s,
  );
  if (!m) {
    throw new Error("no __NEXT_DATA__ found");
  }
  return JSON.parse(m[1]);
};

const fetchPage = async (url) => {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Drugpedia data refresh (github.com/kaboosee/Drugpedia)",
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${url}`);
  }
  return res.text();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  // The A-Z page lists every drug with its slug and category.
  const az = nextData(await fetchPage(`${BASE}/drugs-a-z`));
  const categoryBySlug = new Map();
  for (const group of az.props.pageProps.list) {
    for (const v of group.values) {
      if (v.slug && !categoryBySlug.has(v.slug)) {
        categoryBySlug.set(v.slug, v.category || "");
      }
    }
  }
  const slugs = [...categoryBySlug.keys()].sort();
  console.log(`Fetching ${slugs.length} drug pages...`);

  const drugs = [];
  for (const slug of slugs) {
    try {
      const page = nextData(await fetchPage(`${BASE}/drug/${slug}`));
      const f = page.props.pageProps.drug.fields;
      drugs.push({
        slug,
        name: f.drugName || slug,
        synonyms: Array.isArray(f.synonyms) ? f.synonyms : [],
        category: categoryBySlug.get(slug) || "",
        legalClass:
          (f.lawClass && f.lawClass.fields && f.lawClass.fields.class) || "",
        description: stripTags(f.description),
        onset: (f.quickInfoPanelTimeToKickIn || "").trim(),
        duration: (f.quickInfoPanelDuration || "").trim(),
        feelings: (f.quickInfoPanelFeelings || "").trim(),
        effects: [...bullets(f.effectsFeeling), ...bullets(f.effectsBehaviour)],
        effectsSummary: (f.quickInfoPanelEffects || "").trim(),
        risks: [
          ...bullets(f.risksPhysicalHealth),
          ...bullets(f.risksHealthMental),
        ],
        risksSummary: (f.quickInfoPanelRisks || "").trim(),
        mixing: (f.quickInfoPanelMixing || "").trim(),
        cutWith: stripTags(f.risksCutWith),
        addiction: stripTags(f.addiction),
      });
      console.log(`  ok ${slug}`);
    } catch (err) {
      console.error(`  FAILED ${slug}: ${err.message}`);
    }
    await sleep(250);
  }

  fs.writeFileSync(OUT, JSON.stringify(drugs, null, 2) + "\n");
  console.log(`Wrote ${drugs.length} drugs to frank_drugs.json`);
})();
