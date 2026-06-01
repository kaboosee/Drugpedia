"use strict";

const substances = window.substances || [];
const interactions = window.interactions || {};

const severityOrder = {
  low: 1,
  caution: 2,
  dangerous: 3,
  "do not combine": 4,
};

const substanceById = Object.fromEntries(
  substances.map((substance) => [substance.id, substance])
);

const displayName = (id) =>
  substanceById[id] ? substanceById[id].name : id.toUpperCase();

const substanceList = document.getElementById("substanceList");
const detailContent = document.getElementById("detailContent");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const noResults = document.getElementById("noResults");
const interactionA = document.getElementById("interactionA");
const interactionB = document.getElementById("interactionB");
const interactionBadge = document.getElementById("interactionBadge");
const interactionSummary = document.getElementById("interactionSummary");

let activeId = substances.length ? substances[0].id : "";

const categoryLabels = {
  stimulants: "Stimulants",
  psychedelics: "Psychedelics",
  dissociatives: "Dissociatives",
  depressants: "Depressants",
  empathogens: "Empathogens",
};

const normalizeCategory = (substance) => {
  const raw = (substance.category || "").toLowerCase();
  if (raw.includes("entactogen") || raw.includes("empathogen")) {
    return "empathogens";
  }
  if (raw.includes("stimulant")) {
    return "stimulants";
  }
  if (raw.includes("psychedelic")) {
    return "psychedelics";
  }
  if (raw.includes("dissociative")) {
    return "dissociatives";
  }
  if (raw.includes("depressant") || raw.includes("opioid")) {
    return "depressants";
  }
  if (raw.includes("cannabinoid")) {
    return "depressants";
  }
  return "stimulants";
};

const pairKey = (a, b) => {
  return [a, b].sort().join("|");
};

const createList = (items, className) => {
  const list = document.createElement("ul");
  list.className = className || "";
  if (!Array.isArray(items) || items.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Not available.";
    list.appendChild(empty);
    return list;
  }
  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.appendChild(listItem);
  });
  return list;
};

const createTable = (headers, rows) => {
  const table = document.createElement("table");
  table.className = "data-table";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  headers.forEach((header) => {
    const cell = document.createElement("th");
    cell.textContent = header;
    headRow.appendChild(cell);
  });
  head.appendChild(headRow);
  const body = document.createElement("tbody");
  rows.forEach((row) => {
    const rowEl = document.createElement("tr");
    row.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      rowEl.appendChild(cell);
    });
    body.appendChild(rowEl);
  });
  table.appendChild(head);
  table.appendChild(body);
  return table;
};

const createSection = (title, content) => {
  const section = document.createElement("section");
  section.className = "detail-section";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.appendChild(heading);
  section.appendChild(content);
  return section;
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

const renderEmptyDetail = (message) => {
  detailContent.innerHTML = "";
  const empty = document.createElement("p");
  empty.className = "muted";
  empty.textContent = message;
  detailContent.appendChild(empty);
};

const renderDetail = () => {
  const substance = substanceById[activeId];
  if (!substance) {
    renderEmptyDetail("Select a substance to view details.");
    return;
  }

  detailContent.innerHTML = "";

  const mechanism = document.createElement("p");
  mechanism.textContent = substance.mechanism || "Not available.";
  detailContent.appendChild(
    createSection("Mechanism of action", mechanism)
  );

  const onsetDurationTable = createTable(
    ["Metric", "Value"],
    [
      ["Onset", substance.onset || "-"],
      ["Duration", substance.duration || "-"],
    ]
  );
  detailContent.appendChild(
    createSection("Onset and duration", onsetDurationTable)
  );

  const dosage = normalizeDosage(substance.dosage);
  const dosageTable = createTable(
    ["Threshold", "Light", "Common", "Strong"],
    [[dosage.threshold, dosage.light, dosage.common, dosage.strong]]
  );
  detailContent.appendChild(createSection("Dosage ranges", dosageTable));

  detailContent.appendChild(
    createSection("Acute risks", createList(substance.acuteRisks))
  );
  detailContent.appendChild(
    createSection(
      "Harm reduction checklist",
      createList(substance.harmReduction, "checklist")
    )
  );
  detailContent.appendChild(
    createSection("Contraindications", createList(substance.contraindications))
  );
};

const renderList = () => {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = substances
    .filter((substance) => {
      const matchesQuery = substance.name.toLowerCase().includes(query);
      const group = normalizeCategory(substance);
      const matchesCategory = category === "all" || group === category;
      return matchesQuery && matchesCategory;
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  substanceList.innerHTML = "";
  filtered.forEach((substance) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "list-item" + (substance.id === activeId ? " active" : "");
    item.setAttribute("role", "listitem");
    const group = normalizeCategory(substance);
    item.innerHTML = `
      <span>${substance.name}</span>
      <span class="list-meta">${categoryLabels[group]}</span>
    `;
    item.addEventListener("click", () => {
      activeId = substance.id;
      renderList();
      renderDetail();
    });
    substanceList.appendChild(item);
  });

  noResults.hidden = filtered.length !== 0;
  if (filtered.length === 0) {
    activeId = "";
    renderDetail();
    return;
  }

  if (!filtered.some((item) => item.id === activeId)) {
    activeId = filtered[0].id;
    renderDetail();
  }
};

const populateInteractionSelects = () => {
  const sorted = [...substances].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
  const buildSelect = (select, placeholder) => {
    if (!select) {
      return;
    }
    select.innerHTML = "";
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);
    sorted.forEach((substance) => {
      const option = document.createElement("option");
      option.value = substance.id;
      option.textContent = substance.name;
      select.appendChild(option);
    });
  };

  buildSelect(interactionA, "Select substance A");
  buildSelect(interactionB, "Select substance B");
};

const updateInteractionResult = () => {
  if (!interactionA || !interactionB) {
    return;
  }
  const valueA = interactionA.value;
  const valueB = interactionB.value;

  const setNeutral = (message) => {
    interactionBadge.textContent = "Select two substances";
    interactionBadge.className = "risk-badge risk-neutral";
    interactionSummary.textContent = message;
  };

  if (!valueA || !valueB) {
    setNeutral("Choose two substances to see interaction risk.");
    return;
  }
  if (valueA === valueB) {
    setNeutral("Select two different substances.");
    return;
  }

  const match = interactions[pairKey(valueA, valueB)];
  const risk = match ? match.risk : "caution";
  const summary = match
    ? match.summary
    : "Limited data; mixing increases unpredictability.";

  const labels = {
    low: "SAFE",
    caution: "CAUTION",
    dangerous: "DANGEROUS",
    "do not combine": "DO NOT COMBINE",
  };

  const classes = {
    low: "risk-safe",
    caution: "risk-caution",
    dangerous: "risk-dangerous",
    "do not combine": "risk-do-not-combine",
  };

  interactionBadge.textContent = labels[risk] || "CAUTION";
  interactionBadge.className = `risk-badge ${classes[risk] || "risk-caution"}`;
  interactionSummary.textContent = summary;
};

searchInput.addEventListener("input", renderList);
categoryFilter.addEventListener("change", renderList);
if (interactionA) {
  interactionA.addEventListener("change", updateInteractionResult);
}
if (interactionB) {
  interactionB.addEventListener("change", updateInteractionResult);
}

// Mobile tab switching
const mobileTabs = document.getElementById("mobileTabs");
if (mobileTabs) {
  const tabButtons = mobileTabs.querySelectorAll(".mobile-tab-btn");
  const panels = document.querySelectorAll(".panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");

      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      panels.forEach((panel) => panel.classList.remove("active"));

      if (tabName === "substances") {
        document.querySelector(".panel.sidebar").classList.add("active");
      } else if (tabName === "detail") {
        document.querySelector(".panel.detail").classList.add("active");
      } else if (tabName === "interaction") {
        document.querySelector(".panel.interaction").classList.add("active");
      }
    });
  });
}

renderList();
renderDetail();
populateInteractionSelects();
updateInteractionResult();
