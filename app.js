"use strict";

const {
  CATEGORY_LABELS,
  RISK_LEVELS,
  normalizeCategory,
  filterSubstances,
  getInteraction,
  splitMatch,
  normalizeDosage,
} = window.DrugpediaLogic;

const substances = window.substances || [];
const interactions = window.interactions || {};

const substanceById = Object.fromEntries(
  substances.map((substance) => [substance.id, substance]),
);

const substanceList = document.getElementById("substanceList");
const detailContent = document.getElementById("detailContent");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const noResults = document.getElementById("noResults");
const interactionA = document.getElementById("interactionA");
const interactionB = document.getElementById("interactionB");
const interactionBadge = document.getElementById("interactionBadge");
const interactionSummary = document.getElementById("interactionSummary");

const LAST_SUBSTANCE_KEY = "drugpedia:lastSubstance";

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, blocked) — persistence is optional.
  }
};

const storedId = readStorage(LAST_SUBSTANCE_KEY);
let activeId = substanceById[storedId]
  ? storedId
  : substances.length
    ? substances[0].id
    : "";

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

  const tooltips = {
    "Mechanism of action":
      "How the drug works in your body at a molecular level",
    "Onset and duration": "When effects start and how long they last",
    "Dosage ranges":
      "Amount guidelines: Threshold (barely noticeable) → Strong (intense)",
    "Acute risks": "Immediate dangers and short-term health effects",
    "Harm reduction checklist": "Safer practices to reduce risk of harm",
    Contraindications:
      "Medical conditions or drugs that make this unsafe to use",
  };

  if (tooltips[title]) {
    const icon = document.createElement("button");
    icon.type = "button";
    icon.className = "info-icon";
    icon.textContent = "?";
    icon.setAttribute("aria-label", tooltips[title]);
    icon.setAttribute("data-tooltip", tooltips[title]);
    heading.appendChild(icon);
  }

  section.appendChild(heading);
  section.appendChild(content);
  return section;
};

const renderEmptyDetail = (message) => {
  detailContent.replaceChildren();
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

  detailContent.replaceChildren();

  if (Array.isArray(substance.synonyms) && substance.synonyms.length) {
    const synonyms = document.createElement("p");
    synonyms.textContent = substance.synonyms.join(", ");
    detailContent.appendChild(createSection("Also known as", synonyms));
  }

  const mechanism = document.createElement("p");
  mechanism.textContent = substance.mechanism || "Not available.";
  detailContent.appendChild(createSection("Mechanism of action", mechanism));

  if (Array.isArray(substance.effects) && substance.effects.length) {
    detailContent.appendChild(
      createSection("Effects", createList(substance.effects)),
    );
  }

  const onsetDurationTable = createTable(
    ["Metric", "Value"],
    [
      ["Onset", substance.onset || "-"],
      ["Duration", substance.duration || "-"],
    ],
  );
  detailContent.appendChild(
    createSection("Onset and duration", onsetDurationTable),
  );

  const dosage = normalizeDosage(substance.dosage);
  const dosageTable = createTable(
    ["Threshold", "Light", "Common", "Strong"],
    [[dosage.threshold, dosage.light, dosage.common, dosage.strong]],
  );
  detailContent.appendChild(createSection("Dosage ranges", dosageTable));

  detailContent.appendChild(
    createSection("Acute risks", createList(substance.acuteRisks)),
  );
  detailContent.appendChild(
    createSection(
      "Harm reduction checklist",
      createList(substance.harmReduction, "checklist"),
    ),
  );
  detailContent.appendChild(
    createSection("Contraindications", createList(substance.contraindications)),
  );

  if (substance.legalStatus) {
    const legal = document.createElement("p");
    legal.textContent = substance.legalStatus;
    detailContent.appendChild(createSection("UK legal status", legal));
  }
};

const renderList = () => {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = filterSubstances(substances, query, category);

  substanceList.replaceChildren();
  filtered.forEach((substance) => {
    const listItem = document.createElement("li");
    const item = document.createElement("button");
    item.type = "button";
    item.className = "list-item" + (substance.id === activeId ? " active" : "");

    const name = document.createElement("span");
    splitMatch(substance.name, query).forEach((segment) => {
      if (segment.match) {
        const mark = document.createElement("mark");
        mark.textContent = segment.text;
        name.appendChild(mark);
      } else {
        name.appendChild(document.createTextNode(segment.text));
      }
    });

    const meta = document.createElement("span");
    meta.className = "list-meta";
    meta.textContent = CATEGORY_LABELS[normalizeCategory(substance)];

    item.appendChild(name);
    item.appendChild(meta);
    item.addEventListener("click", () => {
      activeId = substance.id;
      writeStorage(LAST_SUBSTANCE_KEY, activeId);
      renderList();
      renderDetail();
    });
    listItem.appendChild(item);
    substanceList.appendChild(listItem);
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
    left.name.localeCompare(right.name),
  );
  const buildSelect = (select, placeholder) => {
    if (!select) {
      return;
    }
    select.replaceChildren();
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

  const result = getInteraction(interactions, valueA, valueB);
  if (!result) {
    interactionBadge.textContent = "Select two substances";
    interactionBadge.className = "risk-badge risk-neutral";
    interactionSummary.textContent =
      valueA && valueA === valueB
        ? "Select two different substances."
        : "Choose two substances to see interaction risk.";
    return;
  }

  const level = RISK_LEVELS[result.risk] || RISK_LEVELS.caution;
  interactionBadge.textContent = level.label;
  interactionBadge.className = `risk-badge ${level.className}`;
  interactionSummary.textContent = result.summary;
};

// Theme toggle (initial theme is set by the inline script in index.html)
const THEME_KEY = "drugpedia:theme";
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    writeStorage(THEME_KEY, next);
  });
}

// Keyboard shortcuts: Ctrl/Cmd+K or "/" focuses search
document.addEventListener("keydown", (event) => {
  const inFormField = /^(input|select|textarea)$/i.test(event.target.tagName);
  if (
    ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") ||
    (event.key === "/" && !inFormField)
  ) {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

searchInput.addEventListener("input", renderList);
categoryFilter.addEventListener("change", renderList);
if (interactionA) {
  interactionA.addEventListener("change", updateInteractionResult);
}
if (interactionB) {
  interactionB.addEventListener("change", updateInteractionResult);
}

// Mobile tab switching (ARIA tabs pattern; tablist is hidden on desktop)
const mobileTabs = document.getElementById("mobileTabs");
if (mobileTabs) {
  const tabButtons = [...mobileTabs.querySelectorAll(".mobile-tab-btn")];
  const panels = document.querySelectorAll(".panel");

  const activateTab = (btn) => {
    tabButtons.forEach((b) => {
      const selected = b === btn;
      b.classList.toggle("active", selected);
      b.setAttribute("aria-selected", String(selected));
      b.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => panel.classList.remove("active"));
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (panel) {
      panel.classList.add("active");
    }
  };

  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => activateTab(btn));
    btn.addEventListener("keydown", (event) => {
      let target = null;
      if (event.key === "ArrowRight") {
        target = tabButtons[(index + 1) % tabButtons.length];
      } else if (event.key === "ArrowLeft") {
        target =
          tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
      } else if (event.key === "Home") {
        target = tabButtons[0];
      } else if (event.key === "End") {
        target = tabButtons[tabButtons.length - 1];
      }
      if (target) {
        event.preventDefault();
        activateTab(target);
        target.focus();
      }
    });
  });
}

renderList();
renderDetail();
populateInteractionSelects();
updateInteractionResult();

// Offline support; requires http(s), so skip silently on file://
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
