(function (global) {
  "use strict";

  const CATEGORY_LABELS = {
    stimulants: "Stimulants",
    psychedelics: "Psychedelics",
    dissociatives: "Dissociatives",
    depressants: "Depressants",
    empathogens: "Empathogens",
    other: "Other",
  };

  const RISK_LEVELS = {
    low: { order: 1, label: "SAFE", className: "risk-safe" },
    caution: { order: 2, label: "CAUTION", className: "risk-caution" },
    dangerous: { order: 3, label: "DANGEROUS", className: "risk-dangerous" },
    "do not combine": {
      order: 4,
      label: "DO NOT COMBINE",
      className: "risk-do-not-combine",
    },
  };

  const normalizeCategory = (substance) => {
    const raw = (substance.category || "").toLowerCase();
    if (raw.includes("entactogen") || raw.includes("empathogen")) {
      return "empathogens";
    }
    if (raw.includes("stimulant")) {
      return "stimulants";
    }
    if (raw.includes("psychedelic") || raw.includes("hallucinogen")) {
      return "psychedelics";
    }
    if (raw.includes("dissociative")) {
      return "dissociatives";
    }
    if (
      raw.includes("depressant") ||
      raw.includes("opioid") ||
      raw.includes("opiate") ||
      raw.includes("inhalant")
    ) {
      return "depressants";
    }
    if (raw.includes("cannabi")) {
      return "depressants";
    }
    return "other";
  };

  const pairKey = (a, b) => {
    return [a, b].sort().join("|");
  };

  const filterSubstances = (substances, query, category) => {
    const normalizedQuery = (query || "").trim().toLowerCase();
    return substances
      .filter((substance) => {
        const matchesQuery = substance.name
          .toLowerCase()
          .includes(normalizedQuery);
        const group = normalizeCategory(substance);
        const matchesCategory = category === "all" || group === category;
        return matchesQuery && matchesCategory;
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  };

  const getInteraction = (interactions, a, b) => {
    if (!a || !b || a === b) {
      return null;
    }
    const match = interactions[pairKey(a, b)];
    if (match) {
      return { risk: match.risk, summary: match.summary, known: true };
    }
    return {
      risk: "caution",
      summary: "Limited data; mixing increases unpredictability.",
      known: false,
    };
  };

  // Splits text into segments marking case-insensitive matches of query,
  // e.g. splitMatch("MDMA", "dm") -> [{text:"M"},{text:"DM",match:true},{text:"A"}]
  const splitMatch = (text, query) => {
    const normalizedQuery = (query || "").trim().toLowerCase();
    if (!normalizedQuery) {
      return [{ text, match: false }];
    }
    const segments = [];
    const lower = text.toLowerCase();
    let index = 0;
    let found = lower.indexOf(normalizedQuery, index);
    while (found !== -1) {
      if (found > index) {
        segments.push({ text: text.slice(index, found), match: false });
      }
      segments.push({
        text: text.slice(found, found + normalizedQuery.length),
        match: true,
      });
      index = found + normalizedQuery.length;
      found = lower.indexOf(normalizedQuery, index);
    }
    if (index < text.length) {
      segments.push({ text: text.slice(index), match: false });
    }
    return segments;
  };

  const extractCommonRange = (text) => {
    if (!text) {
      return "-";
    }
    const match = text.match(/common range:([^.]*)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return text;
  };

  const normalizeDosage = (dosage) => {
    if (dosage && typeof dosage === "object") {
      return {
        threshold: dosage.threshold || "-",
        light: dosage.light || "-",
        common: dosage.common || "-",
        strong: dosage.strong || "-",
      };
    }
    if (typeof dosage === "string") {
      return {
        threshold: "-",
        light: "-",
        common: extractCommonRange(dosage),
        strong: "-",
      };
    }
    return { threshold: "-", light: "-", common: "-", strong: "-" };
  };

  const api = {
    CATEGORY_LABELS,
    RISK_LEVELS,
    normalizeCategory,
    pairKey,
    filterSubstances,
    getInteraction,
    splitMatch,
    extractCommonRange,
    normalizeDosage,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.DrugpediaLogic = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
