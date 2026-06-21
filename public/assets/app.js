(() => {
  const plantDataUrl = "/data/plant-library-expanded.json";
  const ailmentDataUrl = "/data/ailment-diagnosis.json";

  const navItems = [
    ["Home", "/index.html", "home"],
    ["Plant Library", "/plant-library.html", "plant-library"],
    ["Fill Your Space", "/fill-your-space.html", "fill-your-space"],
    ["Diagnoser", "/plant-diagnoser.html", "plant-diagnoser"],
    ["Pests", "/pests.html", "pests"],
    ["Diseases", "/diseases.html", "diseases"],
    ["Additives", "/organic-additives.html", "additives"],
    ["How-To", "/how-to.html", "how-to"],
    ["Tools", "/tools.html", "tools"],
    ["Search", "/search.html", "search"],
  ];

  const categoryLabels = {
    "pet-friendly": "Pet-friendly",
    toxic: "Toxic",
    herbs: "Herbs",
    vegetables: "Vegetables",
    fruits: "Fruits",
    "cover-crops": "Cover crops",
  };

  const state = {
    plants: null,
    ailments: null,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getCurrentKey() {
    const explicit = document.body.dataset.currentNav;
    if (explicit) return explicit;
    const path = window.location.pathname;
    if (path.includes("fill-your-space")) return "fill-your-space";
    if (path.includes("plant-diagnoser")) return "plant-diagnoser";
    if (path.includes("plant-library") || path.includes("/plants/")) return "plant-library";
    if (path.includes("organic-additives")) return "additives";
    if (path.includes("tools")) return "tools";
    if (path.includes("search")) return "search";
    if (path.includes("pests")) return "pests";
    if (path.includes("diseases")) return "diseases";
    if (path.includes("how-to")) return "how-to";
    return "home";
  }

  function enhanceNav() {
    const nav = $(".nav-links");
    if (!nav) return;
    const current = getCurrentKey();
    nav.innerHTML = navItems
      .map(([label, href, key]) => `<a href="${href}"${key === current ? ' aria-current="page"' : ""}>${label}</a>`)
      .join("");
    $$(".brand-mark").forEach((mark) => {
      mark.textContent = "AG";
      mark.setAttribute("aria-hidden", "true");
    });
  }

  async function loadJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${url}`);
    return response.json();
  }

  async function loadPlants() {
    if (!state.plants) {
      const data = await loadJson(plantDataUrl);
      state.plants = data.plants || [];
    }
    return state.plants;
  }

  async function loadAilments() {
    if (!state.ailments) state.ailments = await loadJson(ailmentDataUrl);
    return state.ailments;
  }

  function petLabel(status) {
    const key = slug(status);
    if (key.includes("pet-friendly")) return "Pet-friendly";
    if (key.includes("toxic")) return "Toxic / keep away";
    return "Check before use";
  }

  function plantCard(plant) {
    const tags = [
      categoryLabels[plant.plantTypeCategory] || plant.categoryLabel,
      petLabel(plant.petStatus),
      plant.careLevel,
    ].filter(Boolean);

    return `<article class="plant-card" data-plant-card>
      <a class="plant-card-media" href="${plant.factsUrl}">
        <img src="${plant.image}" alt="${escapeHtml(plant.alt || plant.name)}" loading="lazy">
      </a>
      <div class="plant-card-body">
        <div class="pill-row">${tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div>
        <h3><a href="${plant.factsUrl}">${escapeHtml(plant.name)}</a></h3>
        ${plant.botanicalName ? `<p class="botanical-small">${escapeHtml(plant.botanicalName)}</p>` : ""}
        <p>${escapeHtml(plant.description)}</p>
        <dl class="mini-facts">
          <div><dt>Light</dt><dd>${escapeHtml(plant.lightText)}</dd></div>
          <div><dt>Water</dt><dd>${escapeHtml(plant.waterText)}</dd></div>
          <div><dt>Soil</dt><dd>${escapeHtml(plant.soilText)}</dd></div>
        </dl>
        <a class="text-link" href="${plant.factsUrl}">Open profile</a>
      </div>
    </article>`;
  }

  function filterDefinitions() {
    return [
      {
        id: "type",
        label: "Plant type",
        options: Object.entries(categoryLabels).map(([value, label]) => [value, label]),
      },
      {
        id: "place",
        label: "Placement",
        options: [["indoor", "Indoor"], ["outdoor", "Outdoor"], ["indoor-outdoor", "Indoor/Outdoor"]],
      },
      {
        id: "pet",
        label: "Pet note",
        options: [["pet-friendly", "Pet-friendly"], ["toxic", "Toxic"], ["check-before-use", "Check first"]],
      },
      {
        id: "care",
        label: "Care",
        options: [["easy", "Easy"], ["moderate", "Moderate"], ["advanced", "Advanced"]],
      },
      {
        id: "light",
        label: "Light",
        options: [["low", "Low"], ["medium", "Medium"], ["bright", "Bright"], ["full-sun", "Full sun"]],
      },
      {
        id: "water",
        label: "Water",
        options: [["dry", "Dry-down"], ["evenly-moist", "Even moisture"], ["low-water", "Low water"]],
      },
    ];
  }

  function renderFilterPanel(root, selected) {
    const panel = $("[data-plant-filters]", root);
    if (!panel) return;
    panel.innerHTML = filterDefinitions()
      .map((group) => `<div class="filter-group">
        <h3>${group.label}</h3>
        <div class="filter-options">
          <button class="filter-button ${!selected[group.id] ? "is-active" : ""}" type="button" data-filter-group="${group.id}" data-filter-value="">All</button>
          ${group.options.map(([value, label]) => `<button class="filter-button ${selected[group.id] === value ? "is-active" : ""}" type="button" data-filter-group="${group.id}" data-filter-value="${value}">${label}</button>`).join("")}
        </div>
      </div>`)
      .join("");
  }

  function plantMatches(plant, selected, query) {
    const haystack = `${plant.searchText || ""} ${plant.name || ""} ${plant.botanicalName || ""}`.toLowerCase();
    const q = query.trim().toLowerCase();
    if (q && !q.split(/\s+/).every((part) => haystack.includes(part))) return false;
    if (selected.type && plant.plantTypeCategory !== selected.type) return false;
    if (selected.place) {
      const place = `${plant.environment || ""} ${plant.environmentLabel || ""} ${haystack}`.toLowerCase();
      if (selected.place === "indoor-outdoor") {
        if (!place.includes("indoor-outdoor") && !(place.includes("indoor") && place.includes("outdoor"))) return false;
      } else if (!place.includes(selected.place)) return false;
    }
    if (selected.pet) {
      const pet = slug(plant.petStatus);
      if (selected.pet === "toxic") {
        if (!pet.includes("toxic") && plant.plantTypeCategory !== "toxic") return false;
      } else if (!pet.includes(selected.pet) && !haystack.includes(selected.pet)) return false;
    }
    if (selected.care && !slug(plant.careLevel).includes(selected.care)) return false;
    if (selected.light) {
      if (selected.light === "full-sun") {
        if (!haystack.includes("full sun") && !haystack.includes("direct sun")) return false;
      } else if (!haystack.includes(selected.light)) return false;
    }
    if (selected.water) {
      if (selected.water === "evenly-moist") {
        if (!haystack.includes("evenly moist") && !haystack.includes("keep soil lightly moist")) return false;
      } else if (selected.water === "low-water") {
        if (!haystack.includes("low water") && !haystack.includes("dry") && !haystack.includes("drought")) return false;
      } else if (!haystack.includes(selected.water)) return false;
    }
    return true;
  }

  function setupPlantExplorer(root, options = {}) {
    const selected = {
      type: "",
      place: "",
      pet: "",
      care: "",
      light: "",
      water: "",
    };
    const search = $("[data-plant-search]", root);
    const results = $("[data-plant-results]", root);
    const meta = $("[data-result-meta]", root);
    const summary = $("[data-space-summary]", root);

    const params = new URLSearchParams(window.location.search);
    const plantParam = params.get("plant");
    if (search && plantParam) search.value = plantParam.replace(/-/g, " ");

    function updateSummary(matches) {
      if (!summary) return;
      const active = Object.entries(selected)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${value.replace(/-/g, " ")}`);
      summary.innerHTML = `<div class="summary-count"><strong>${matches.length}</strong><span>matching plants</span></div>
        <div class="tag-cloud">${(active.length ? active : ["all plant types", "all light levels", "all pet notes"]).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <p class="source-note">Open any card for soil, water, light, pruning, pests, and placement details.</p>`;
    }

    function render(plants) {
      const query = search ? search.value : "";
      const matches = plants.filter((plant) => plantMatches(plant, selected, query));
      const hasActiveFilters = Boolean(query.trim()) || Object.values(selected).some(Boolean);
      const limit = hasActiveFilters ? 240 : 120;
      const visibleMatches = matches.slice(0, limit);
      if (meta) {
        const showing = matches.length > visibleMatches.length ? ` Showing ${visibleMatches.length}.` : "";
        meta.textContent = matches.length === plants.length
          ? `${plants.length} plant profiles loaded.${showing}`
          : `${matches.length} of ${plants.length} plant profiles match.${showing}`;
      }
      if (results) {
        results.innerHTML = matches.length
          ? visibleMatches.map(plantCard).join("")
          : `<div class="empty-state"><h3>No plant matches yet</h3><p>Try fewer filters or a broader search term.</p></div>`;
      }
      updateSummary(matches);
      renderFilterPanel(root, selected);
      wireFilterButtons(plants);
    }

    function wireFilterButtons(plants) {
      $$("[data-filter-group]", root).forEach((button) => {
        button.addEventListener("click", () => {
          selected[button.dataset.filterGroup] = button.dataset.filterValue;
          render(plants);
        });
      });
    }

    loadPlants()
      .then((plants) => {
        if (options.defaultType) selected.type = options.defaultType;
        render(plants);
        if (search) search.addEventListener("input", () => render(plants));
      })
      .catch((error) => {
        if (results) results.innerHTML = `<div class="notice">Plant data could not load: ${escapeHtml(error.message)}</div>`;
      });
  }

  function setupSiteSearch(root) {
    const input = $("[data-site-search-input]", root);
    const results = $("[data-site-search-results]", root);
    const meta = $("[data-result-meta]", root);
    const params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) input.value = params.get("q");

    function render(plants) {
      const query = (input?.value || "").trim().toLowerCase();
      const matches = query
        ? plants.filter((plant) => plantMatches(plant, {}, query))
        : plants.slice(0, 24);
      const visibleMatches = matches.slice(0, query ? 240 : 24);
      if (meta) {
        meta.textContent = query
          ? `${matches.length} matches${matches.length > visibleMatches.length ? `, showing ${visibleMatches.length}` : ""}`
          : "Showing the first 24 profiles";
      }
      if (results) results.innerHTML = visibleMatches.map(plantCard).join("");
    }

    loadPlants().then((plants) => {
      render(plants);
      input?.addEventListener("input", () => render(plants));
    });
  }

  function severityRank(value) {
    return { High: 3, Medium: 2, Low: 1 }[value] || 0;
  }

  function symptomButton(symptom) {
    return `<button class="symptom-card" type="button" data-symptom-id="${symptom.id}" data-keywords="${escapeHtml((symptom.keywords || []).join(" "))}">
      <img src="${symptom.image}" alt="${escapeHtml(symptom.label)} example">
      <span>${escapeHtml(symptom.label)}</span>
    </button>`;
  }

  function setupDiagnoser(root) {
    const selected = new Set();
    const groupTarget = $("[data-symptom-groups]", root);
    const panel = $("[data-diagnosis-panel]", root);
    const search = $("[data-symptom-search]", root);

    function scoreIssues(ailments) {
      return ailments.issues
        .map((issue) => {
          const hits = issue.matchTags.filter((tag) => selected.has(tag));
          return { ...issue, hits, score: hits.length };
        })
        .filter((issue) => issue.score > 0)
        .sort((a, b) => b.score - a.score || severityRank(b.severity) - severityRank(a.severity) || a.title.localeCompare(b.title));
    }

    function renderPanel(ailments) {
      if (!panel) return;
      if (!selected.size) {
        panel.innerHTML = `<h2>Diagnosis</h2><p>Select symptoms to see likely causes and cures.</p>`;
        return;
      }

      const selectedSymptoms = Array.from(selected).map((id) => ailments.symptoms[id]).filter(Boolean);
      const issues = scoreIssues(ailments).slice(0, 6);
      panel.innerHTML = `<h2>Diagnosis</h2>
        <div class="selected-symptoms">
          ${selectedSymptoms.map((symptom) => `<span>${escapeHtml(symptom.label)}</span>`).join("")}
        </div>
        ${issues.length ? issues.map((issue, index) => `<article class="diagnosis-card ${index === 0 ? "top-match" : ""}">
          <div class="diagnosis-heading">
            <span class="status-chip ${issue.severity === "High" ? "must" : "should"}">${escapeHtml(issue.severity)}</span>
            <strong>${index === 0 ? "Top match" : `${issue.score} matched clues`}</strong>
          </div>
          <h3>${escapeHtml(issue.title)}</h3>
          <h4>Cause</h4>
          <p>${escapeHtml(issue.summary)}</p>
          <h4>How to cure</h4>
          <ul>${issue.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ul>
        </article>`).join("") : `<div class="notice">No strong cause matched this exact pattern yet.</div>`}
        <p class="source-note">Symptoms overlap. Check roots, light, watering, pest evidence, and recent changes before treating.</p>`;
    }

    function applySearch() {
      const q = (search?.value || "").trim().toLowerCase();
      $$(".symptom-card", root).forEach((card) => {
        const haystack = `${card.textContent} ${card.dataset.keywords || ""}`.toLowerCase();
        card.hidden = q && !haystack.includes(q);
      });
    }

    loadAilments().then((ailments) => {
      groupTarget.innerHTML = ailments.symptomGroups
        .map((group) => `<section class="symptom-group">
          <h3>${escapeHtml(group.label)}</h3>
          <div class="symptom-grid">${group.symptoms.map(symptomButton).join("")}</div>
        </section>`)
        .join("");

      $$(".symptom-card", root).forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.symptomId;
          if (selected.has(id)) selected.delete(id);
          else selected.add(id);
          button.classList.toggle("is-active", selected.has(id));
          renderPanel(ailments);
        });
      });

      search?.addEventListener("input", applySearch);
      renderPanel(ailments);
    });
  }

  function keepLegacyCardSearch() {
    const searchInput = document.querySelector("[data-card-search]");
    if (!searchInput) return;
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      document.querySelectorAll("[data-search-card]").forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.hidden = query.length > 0 && !text.includes(query);
      });
    });
  }

  function keepLegacyFilters() {
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        const cards = document.querySelectorAll("[data-category]");
        document.querySelectorAll("[data-filter]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
        cards.forEach((card) => {
          const categories = card.dataset.category.split(" ");
          card.hidden = filter !== "all" && !categories.includes(filter);
        });
      });
    });
  }

  function init() {
    enhanceNav();
    const yearTarget = document.querySelector("[data-current-year]");
    if (yearTarget) yearTarget.textContent = new Date().getFullYear();

    const library = document.querySelector("[data-plant-library]");
    if (library) setupPlantExplorer(library);

    const fillSpace = document.querySelector("[data-fill-space]");
    if (fillSpace) setupPlantExplorer(fillSpace);

    const siteSearch = document.querySelector("[data-site-search]");
    if (siteSearch) setupSiteSearch(siteSearch);

    const diagnoser = document.querySelector("[data-diagnoser]");
    if (diagnoser) setupDiagnoser(diagnoser);

    keepLegacyCardSearch();
    keepLegacyFilters();
  }

  init();
})();
