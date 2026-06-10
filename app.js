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
const DASH = "–"; // en dash for missing values

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

// ---- Theme toggle (data-independent; safe to wire immediately) ----
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

// ---- Mobile tab switching (ARIA tabs; tablist hidden on desktop) ----
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
    document.body.classList.remove("scrolled");
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

// On mobile, shrink the header as the user scrolls a panel to free up room
// (styling keys off `body.scrolled`; only active under the mobile breakpoint).
[detailContent, substanceList].filter(Boolean).forEach((el) => {
  el.addEventListener(
    "scroll",
    () => document.body.classList.toggle("scrolled", el.scrollTop > 16),
    { passive: true },
  );
});

// ---- DOM builders ----
const createList = (items, className) => {
  if (!Array.isArray(items) || items.length === 0) {
    const dash = document.createElement("p");
    dash.className = "dash";
    dash.textContent = DASH;
    return dash;
  }
  const list = document.createElement("ul");
  list.className = className || "";
  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.appendChild(listItem);
  });
  return list;
};

const createText = (value) => {
  const p = document.createElement("p");
  if (value) {
    p.textContent = value;
  } else {
    p.className = "dash";
    p.textContent = DASH;
  }
  return p;
};

const createTable = (headers, rows, className) => {
  const table = document.createElement("table");
  table.className = "data-table" + (className ? " " + className : "");
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

// Interaction list (per drug) with a coloured severity badge per row.
const createInteractionList = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return createText(null);
  }
  const list = document.createElement("ul");
  list.className = "interaction-list";
  items.forEach((item) => {
    const li = document.createElement("li");
    const level = RISK_LEVELS[item.severity] || RISK_LEVELS.caution;
    const badge = document.createElement("span");
    badge.className = `risk-badge ${level.className}`;
    badge.textContent = level.label;
    const name = document.createElement("span");
    name.className = "interaction-name";
    name.textContent = item.substance;
    li.appendChild(badge);
    li.appendChild(name);
    if (item.effect) {
      const note = document.createElement("span");
      note.className = "interaction-note";
      note.textContent = item.effect;
      li.appendChild(note);
    }
    list.appendChild(li);
  });
  return list;
};

const LEGAL_LABELS = {
  A: "Class A",
  B: "Class B",
  C: "Class C",
  PSA: "Psychoactive Subs. Act",
  Legal: "Legal",
};

// UK legal status: a colour-coded class badge (red Class A … green Legal),
// like the interaction risk badges, followed by the penalty summary.
const createLegalStatus = (substance) => {
  const frag = document.createDocumentFragment();
  if (substance.legal_class) {
    const badge = document.createElement("span");
    badge.className = "legal-badge legal-" + substance.legal_class;
    badge.textContent =
      LEGAL_LABELS[substance.legal_class] || substance.legal_class;
    frag.appendChild(badge);
  }
  frag.appendChild(createText(substance.legal_status_uk));
  return frag;
};

const TOOLTIPS = {
  "Mechanism of action": "How the drug works in your body at a molecular level",
  "Onset and duration": "When effects start and how long they last",
  "Dosage ranges":
    "Amount guidelines: Threshold (barely noticeable) → Heavy (intense)",
  "Acute risks": "Immediate dangers and short-term health effects",
  "Harm reduction": "Safer practices to reduce risk of harm",
  Contraindications: "Conditions or drugs that make this unsafe to use",
  Interactions: "How this combines with other drugs (TripSit data)",
};

const createSection = (title, content, modifier) => {
  const section = document.createElement("section");
  section.className = "detail-section" + (modifier ? " " + modifier : "");
  const heading = document.createElement("h3");
  heading.textContent = title;

  if (TOOLTIPS[title]) {
    const icon = document.createElement("button");
    icon.type = "button";
    icon.className = "info-icon";
    icon.textContent = "?";
    icon.setAttribute("aria-label", TOOLTIPS[title]);
    icon.setAttribute("data-tooltip", TOOLTIPS[title]);
    heading.appendChild(icon);
  }

  section.appendChild(heading);
  section.appendChild(content);
  return section;
};

// ---- App init (runs once data/drugs.json has loaded) ----
const initApp = (data) => {
  const substances = Array.isArray(data.substances) ? data.substances : [];
  const interactions = data.interactions || {};
  const substanceById = Object.fromEntries(
    substances.map((substance) => [substance.id, substance]),
  );

  const storedId = readStorage(LAST_SUBSTANCE_KEY);
  let activeId = substanceById[storedId]
    ? storedId
    : substances.length
      ? substances[0].id
      : "";

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
    const add = (title, content, modifier) =>
      detailContent.appendChild(createSection(title, content, modifier));

    // Also known as + Drug class share a row so they don't each cost a full
    // line of scroll (especially on mobile).
    const pair = document.createElement("div");
    pair.className = "detail-pair";
    pair.appendChild(
      createSection(
        "Also known as",
        createText(
          Array.isArray(substance.also_known_as) &&
            substance.also_known_as.length
            ? substance.also_known_as.join(", ")
            : null,
        ),
      ),
    );
    pair.appendChild(
      createSection("Drug class", createText(substance.drug_class)),
    );
    detailContent.appendChild(pair);

    add("Mechanism of action", createText(substance.mechanism));
    add("Effects", createList(substance.effects, "effects-list"));

    add(
      "Onset and duration",
      createTable(
        ["Metric", "Value"],
        [
          ["Onset", substance.onset || DASH],
          ["Duration", substance.duration || DASH],
        ],
        "mono",
      ),
    );

    const dose = normalizeDosage(substance.dosage_ranges);
    const dosageTable = createTable(
      ["Threshold", "Light", "Common", "Strong", "Heavy"],
      [[dose.threshold, dose.light, dose.common, dose.strong, dose.heavy]],
      "mono",
    );
    if (dose.route) {
      const caption = document.createElement("caption");
      caption.textContent = `Route: ${dose.route}`;
      dosageTable.insertBefore(caption, dosageTable.firstChild);
    }
    add("Dosage ranges", dosageTable);

    add("Acute risks", createList(substance.acute_risks), "danger");
    add("Harm reduction", createList(substance.harm_reduction), "harm");
    add("Contraindications", createList(substance.contraindications));
    add("UK legal status", createLegalStatus(substance));
    add("Interactions", createInteractionList(substance.interactions));
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
      item.className =
        "list-item" + (substance.id === activeId ? " active" : "");

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

  // Mobile-only: a collapsed search at the top of the detail panel so users can
  // jump to another substance without switching back to the Substances tab.
  const setupDetailSearch = () => {
    const toggle = document.getElementById("detailSearchToggle");
    const panel = document.getElementById("detailSearchPanel");
    const input = document.getElementById("detailSearchInput");
    const results = document.getElementById("detailSearchResults");
    if (!toggle || !panel || !input || !results) {
      return;
    }

    const collapse = () => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      input.value = "";
      results.replaceChildren();
    };

    const renderResults = () => {
      const query = input.value.trim().toLowerCase();
      results.replaceChildren();
      filterSubstances(substances, query, "all")
        .slice(0, 8)
        .forEach((substance) => {
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "detail-search-result";
          btn.textContent = substance.name;
          btn.addEventListener("click", () => {
            activeId = substance.id;
            writeStorage(LAST_SUBSTANCE_KEY, activeId);
            renderList();
            renderDetail();
            collapse();
            detailContent.scrollTop = 0;
          });
          li.appendChild(btn);
          results.appendChild(li);
        });
    };

    toggle.addEventListener("click", () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) {
        renderResults();
        input.focus();
      } else {
        collapse();
      }
    });
    input.addEventListener("input", renderResults);
  };

  searchInput.addEventListener("input", renderList);
  categoryFilter.addEventListener("change", renderList);
  if (interactionA) {
    interactionA.addEventListener("change", updateInteractionResult);
  }
  if (interactionB) {
    interactionB.addEventListener("change", updateInteractionResult);
  }

  renderList();
  renderDetail();
  populateInteractionSelects();
  updateInteractionResult();
  setupDetailSearch();
};

// ---- Bootstrap: load the compiled dataset, then start the app ----
fetch("data/drugs.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(initApp)
  .catch((error) => {
    renderEmptyData(error);
  });

function renderEmptyData(error) {
  detailContent.replaceChildren();
  const p = document.createElement("p");
  p.className = "muted";
  p.textContent =
    "Could not load drug data. If you opened this file directly, serve it " +
    "over http (e.g. `npx serve .`) and reload.";
  detailContent.appendChild(p);
  console.error("Failed to load data/drugs.json:", error);
}

// Offline support; requires http(s), so skip silently on file://
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
