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
const interactionList = document.getElementById("interactionList");
const interactionResult = document.getElementById("interactionResult");

let activeId = substances.length ? substances[0].id : "";

const categoryOptions = [
  "all",
  ...new Set(substances.map((substance) => substance.category)),
];

categoryOptions.forEach((category) => {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category === "all" ? "All categories" : category;
  categoryFilter.appendChild(option);
});

const pairKey = (a, b) => {
  return [a, b].sort().join("|");
};

const renderList = () => {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = substances.filter((substance) => {
    const matchesQuery = substance.name.toLowerCase().includes(query);
    const matchesCategory =
      category === "all" || substance.category === category;
    return matchesQuery && matchesCategory;
  });

  substanceList.innerHTML = "";
  filtered.forEach((substance) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "list-item" + (substance.id === activeId ? " active" : "");
    item.setAttribute("role", "listitem");
    item.innerHTML = `<strong>${substance.name}</strong><span>${substance.category}</span>`;
    item.addEventListener("click", () => {
      activeId = substance.id;
      renderList();
      renderDetail();
    });
    substanceList.appendChild(item);
  });

  noResults.hidden = filtered.length !== 0;
};

const createDetailBlock = (title, content) => {
  const block = document.createElement("div");
  block.className = "detail-block";
  const heading = document.createElement("h3");
  heading.textContent = title;
  block.appendChild(heading);
  if (Array.isArray(content)) {
    const list = document.createElement("ul");
    content.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      list.appendChild(listItem);
    });
    block.appendChild(list);
  } else {
    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    block.appendChild(paragraph);
  }
  return block;
};

const renderDetail = () => {
  const substance = substances.find((item) => item.id === activeId);
  if (!substance) return;
  detailContent.innerHTML = "";
  detailContent.appendChild(
    createDetailBlock("Mechanism of action", substance.mechanism)
  );
  detailContent.appendChild(createDetailBlock("Onset", substance.onset));
  detailContent.appendChild(createDetailBlock("Duration", substance.duration));
  detailContent.appendChild(
    createDetailBlock("Common dosage ranges", substance.dosage)
  );
  if (substance.effects) {
    detailContent.appendChild(
      createDetailBlock("Reported effects (summary)", substance.effects)
    );
  }
  detailContent.appendChild(
    createDetailBlock("Acute risks", substance.acuteRisks)
  );
  detailContent.appendChild(
    createDetailBlock("Harm reduction tips", substance.harmReduction)
  );
  detailContent.appendChild(
    createDetailBlock("Contraindications", substance.contraindications)
  );
};

const renderInteractions = () => {
  interactionList.innerHTML = "";
  substances.forEach((substance) => {
    const wrapper = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = substance.id;
    checkbox.addEventListener("change", updateInteractionResult);
    const text = document.createElement("span");
    text.textContent = substance.name;
    wrapper.appendChild(checkbox);
    wrapper.appendChild(text);
    interactionList.appendChild(wrapper);
  });
};

const updateInteractionResult = () => {
  const selected = Array.from(
    interactionList.querySelectorAll("input:checked")
  ).map((input) => input.value);

  if (selected.length < 2) {
    interactionResult.className = "muted";
    interactionResult.textContent =
      "Select at least two substances to view interaction risk.";
    return;
  }

  let highestRisk = "low";
  const summaries = [];

  for (let i = 0; i < selected.length; i += 1) {
    for (let j = i + 1; j < selected.length; j += 1) {
      const key = pairKey(selected[i], selected[j]);
      const match = interactions[key];
      const risk = match ? match.risk : "caution";
      const summary = match
        ? match.summary
        : "Limited data; mixing increases unpredictability.";

      if (severityOrder[risk] > severityOrder[highestRisk]) {
        highestRisk = risk;
      }
      const nameA = displayName(selected[i]);
      const nameB = displayName(selected[j]);
      summaries.push(`${nameA} + ${nameB}: ${summary}`);
    }
  }

  const summaryLines = summaries.slice(0, 4);
  const extraCount = summaries.length - summaryLines.length;

  const riskClass =
    highestRisk === "do not combine"
      ? "risk-do-not-combine"
      : `risk-${highestRisk.replace(" ", "-")}`;

  interactionResult.className = "";
  interactionResult.innerHTML = `
    <div class="risk-badge ${riskClass}">
      ${highestRisk.toUpperCase()}
    </div>
    <div class="muted">
      ${summaryLines.join("<br />")}${
    extraCount > 0
      ? `<br />+ ${extraCount} more pair${extraCount > 1 ? "s" : ""}.`
      : ""
  }
    </div>
    <div class="muted" style="margin-top: 6px;">
      Combining multiple substances increases risk. Prioritize hydration,
      temperature management, and conservative dosing.
    </div>
  `;
};

searchInput.addEventListener("input", renderList);
categoryFilter.addEventListener("change", renderList);

renderList();
renderDetail();
renderInteractions();
