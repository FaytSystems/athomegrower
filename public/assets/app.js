(() => {
  const plantDataUrl = "/data/plant-library-expanded.json";
  const ailmentDataUrl = "/data/ailment-diagnosis.json";

  const navItems = [
    ["Home", "/index.html", "home"],
    ["Plant Library", "/plant-library.html", "plant-library"],
    ["Fill Your Space", "/fill-your-space.html", "fill-your-space"],
    ["What's Wrong With My Plant", "/plant-diagnoser.html", "plant-diagnoser"],
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

  function words(value) {
    return String(value || "").toLowerCase();
  }

  function plantHaystack(plant) {
    return words([
      plant.searchText,
      plant.name,
      plant.botanicalName,
      plant.categoryLabel,
      plant.plantTypeCategory,
      plant.plantType,
      plant.foliageType,
      plant.lightText,
      plant.waterText,
      plant.soilText,
      plant.careLevel,
      plant.petStatus,
      plant.description,
      plant.bestFor,
      (plant.quickTags || []).join(" "),
      (plant.tags || []).join(" "),
    ].join(" "));
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
    return "Check pets";
  }

  function petTagKind(status) {
    const key = slug(status);
    if (key.includes("pet-friendly")) return "pet-safe";
    if (key.includes("toxic")) return "toxic";
    return "pet-check";
  }

  function lightTagLabel(value) {
    const text = String(value || "Match light").trim();
    const key = text.toLowerCase();
    if (key.includes("full sun") && (key.includes("part shade") || key.includes("partial shade"))) return "Sun / part shade";
    if (key.includes("full sun")) return "Full sun";
    if (key.includes("bright indirect")) return "Bright indirect";
    if (key.includes("direct sun")) return "Direct sun";
    if (key.includes("low light")) return "Low light";
    if (key.includes("medium")) return "Medium light";
    if (key.includes("part shade") || key.includes("partial shade")) return "Part shade";
    if (key.includes("shade")) return "Shade";
    return text.length > 32 ? `${text.slice(0, 29).trim()}...` : text;
  }

  function careTagLabel(value) {
    const key = slug(value);
    if (key.includes("easy") || key.includes("beginner")) return "Easy grow";
    if (key.includes("advanced") || key.includes("difficult") || key.includes("hard")) return "Advanced grow";
    return "Moderate grow";
  }

  function cardTags(plant) {
    return [
      { kind: petTagKind(plant.petStatus), label: petLabel(plant.petStatus) },
      { kind: "light", label: lightTagLabel(plant.lightText) },
      { kind: "difficulty", label: careTagLabel(plant.careLevel) },
    ];
  }

  function plantFacet(plant, facet) {
    const haystack = plantHaystack(plant);
    const care = slug(plant.careLevel);

    if (facet === "genre") return plant.plantTypeCategory;
    if (facet === "pet") {
      const pet = slug(plant.petStatus);
      if (pet.includes("pet-friendly")) return "pet-friendly";
      if (pet.includes("toxic") || plant.plantTypeCategory === "toxic") return "toxic";
      return "check-before-use";
    }
    if (facet === "care") {
      if (care.includes("easy") || care.includes("beginner") || haystack.includes("very easy")) return "easy";
      if (care.includes("advanced") || care.includes("difficult") || care.includes("hard")) return "advanced";
      return "moderate";
    }
    if (facet === "light") {
      if (haystack.includes("low light")) return "low-light";
      if (haystack.includes("full sun") || haystack.includes("direct sun")) return "full-sun";
      if (haystack.includes("medium") || haystack.includes("part sun") || haystack.includes("filtered")) return "medium-light";
      if (haystack.includes("bright")) return "bright-indirect";
      return "flexible-light";
    }
    if (facet === "water") {
      if (haystack.includes("dry") || haystack.includes("drought") || haystack.includes("low-water")) return "dry-down";
      if (haystack.includes("wet") || haystack.includes("aquatic") || haystack.includes("bog")) return "moisture-loving";
      if (haystack.includes("evenly moist") || haystack.includes("keep soil lightly moist")) return "even-moisture";
      return "moderate-water";
    }
    if (facet === "place") {
      const place = `${plant.environment || ""} ${plant.environmentLabel || ""} ${haystack}`;
      if (place.includes("indoor-outdoor") || (place.includes("indoor") && place.includes("outdoor"))) return "indoor-outdoor";
      if (place.includes("outdoor")) return "outdoor";
      return "indoor";
    }
    if (facet === "leaf") {
      if (/fern|frond|spleenwort|pteris|asplenium/.test(haystack)) return "ferns-fronds";
      if (/palm|cycad/.test(haystack)) return "palms";
      if (/vine|trailing|climbing|string of|hoya|pothos|ivy/.test(haystack)) return "vines-trailing";
      if (/succulent|cactus|sedum|echeveria|aloe|haworthia|crassula|jade/.test(haystack)) return "succulent";
      if (/flower|bloom|orchid|lily|rose|daisy|calendula|zinnia|violet|begonia/.test(haystack)) return "flowering";
      if (/grass|cereal|rye|oat|wheat|barley|millet|cover crop|fescue/.test(haystack)) return "grasses-cover";
      if (/root|bulb|rhizome|tuber|onion|garlic|potato|carrot|beet|radish/.test(haystack)) return "roots-bulbs";
      if (/tree|shrub|fig|citrus|apple|pear|peach|mulberry|pomegranate/.test(haystack)) return "trees-shrubs";
      if (/fruit|berry|tomato|pepper|melon|squash|cucumber|bean|pea/.test(haystack)) return "fruiting";
      if (/herb|leafy|greens|lettuce|kale|spinach|basil|mint|sage|thyme/.test(haystack)) return "leafy-herbs";
      return "broadleaf";
    }
    return "";
  }

  function plantCard(plant) {
    const tags = cardTags(plant);

    return `<article class="plant-card" data-plant-card>
      <a class="plant-card-media" href="${plant.factsUrl}">
        <img src="${plant.image}" alt="${escapeHtml(plant.alt || plant.name)}" loading="lazy">
      </a>
      <div class="plant-card-body">
        <div class="card-tags">${tags.map((tag) => `<span class="card-tag ${tag.kind}">${escapeHtml(tag.label)}</span>`).join("")}</div>
        <h3><a href="${plant.factsUrl}">${escapeHtml(plant.name)}</a></h3>
        ${plant.botanicalName ? `<p class="botanical-small">${escapeHtml(plant.botanicalName)}</p>` : ""}
        <p>${escapeHtml(plant.description)}</p>
        <dl class="mini-facts">
          <div><dt>Light</dt><dd>${escapeHtml(plant.lightText)}</dd></div>
          <div><dt>Water</dt><dd>${escapeHtml(plant.waterText)}</dd></div>
          <div><dt>Leaf</dt><dd>${escapeHtml(plant.foliageType || plant.plantType)}</dd></div>
        </dl>
        <a class="text-link" href="${plant.factsUrl}">Open profile</a>
      </div>
    </article>`;
  }

  function fillFilterDefinitions() {
    return [
      {
        id: "genre",
        label: "Genre",
        options: Object.entries(categoryLabels).map(([value, label]) => [value, label]),
      },
      {
        id: "leaf",
        label: "Leaf structure",
        options: [
          ["broadleaf", "Broad leaves"],
          ["leafy-herbs", "Leafy / herbs"],
          ["vines-trailing", "Vines / trailing"],
          ["ferns-fronds", "Ferns / fronds"],
          ["palms", "Palms"],
          ["succulent", "Succulents"],
          ["flowering", "Flowering"],
          ["fruiting", "Fruiting"],
          ["grasses-cover", "Grasses / cover"],
          ["roots-bulbs", "Roots / bulbs"],
          ["trees-shrubs", "Trees / shrubs"],
        ],
      },
      {
        id: "light",
        label: "Light requirements",
        options: [
          ["low-light", "Low light"],
          ["medium-light", "Medium / filtered"],
          ["bright-indirect", "Bright indirect"],
          ["full-sun", "Full sun"],
          ["flexible-light", "Flexible"],
        ],
      },
      {
        id: "care",
        label: "Ease of care",
        options: [["easy", "Easy"], ["moderate", "Moderate"], ["advanced", "Advanced"]],
      },
      {
        id: "pet",
        label: "Pet / safety",
        options: [["pet-friendly", "Pet-friendly"], ["toxic", "Toxic"], ["check-before-use", "Check first"]],
      },
      {
        id: "water",
        label: "Water style",
        options: [
          ["dry-down", "Dry-down"],
          ["moderate-water", "Moderate"],
          ["even-moisture", "Even moisture"],
          ["moisture-loving", "Moisture loving"],
        ],
      },
      {
        id: "place",
        label: "Placement",
        options: [["indoor", "Indoor"], ["outdoor", "Outdoor"], ["indoor-outdoor", "Indoor/Outdoor"]],
      },
    ];
  }

  function activeFilterCount(selected) {
    return Object.values(selected).filter(Boolean).length;
  }

  function plantMatches(plant, selected, query) {
    const haystack = plantHaystack(plant);
    const q = query.trim().toLowerCase();
    if (q && !q.split(/\s+/).every((part) => haystack.includes(part))) return false;
    return Object.entries(selected).every(([facet, value]) => !value || plantFacet(plant, facet) === value);
  }

  function renderFilterPanel(root, selected, plants, query) {
    const panel = $("[data-plant-filters]", root);
    if (!panel) return;
    const defs = fillFilterDefinitions();
    const active = activeFilterCount(selected);

    panel.innerHTML = `${active ? `<div class="filter-actions"><button class="filter-button reset" type="button" data-clear-filters>Clear all filters</button></div>` : ""}
      ${defs.map((group) => `<div class="filter-group">
        <h3>${group.label}</h3>
        <div class="filter-options">
          ${group.options.map(([value, label]) => {
            const projected = { ...selected, [group.id]: selected[group.id] === value ? "" : value };
            const count = plants.filter((plant) => plantMatches(plant, projected, query)).length;
            return `<button class="filter-button ${selected[group.id] === value ? "is-active" : ""}" type="button" data-filter-group="${group.id}" data-filter-value="${value}">
              <span>${label}</span><span class="filter-count">${count}</span>
            </button>`;
          }).join("")}
        </div>
      </div>`).join("")}`;
  }

  function buildPlantSuggestions(plants, query) {
    const q = query.trim().toLowerCase();
    const defs = fillFilterDefinitions();
    const facetSuggestions = defs.flatMap((group) => group.options.map(([value, label]) => ({
      kind: "intent",
      label,
      sub: group.label,
      value: "",
      facet: group.id,
      facetValue: value,
    })));
    const plantSuggestions = plants.map((plant) => ({
      kind: "plant",
      label: plant.name,
      sub: [plant.botanicalName, categoryLabels[plant.plantTypeCategory]].filter(Boolean).join(" - "),
      value: plant.name,
      url: plant.factsUrl,
      haystack: plantHaystack(plant),
    }));

    if (!q) return [...facetSuggestions.slice(0, 8), ...plantSuggestions.slice(0, 4)];

    const starts = plantSuggestions
      .filter((item) => item.label.toLowerCase().startsWith(q))
      .slice(0, 8);
    const contains = plantSuggestions
      .filter((item) => !item.label.toLowerCase().startsWith(q) && item.haystack.includes(q))
      .slice(0, 8);
    const intents = facetSuggestions
      .filter((item) => `${item.label} ${item.sub}`.toLowerCase().includes(q))
      .slice(0, 6);
    return [...intents, ...starts, ...contains].slice(0, 12);
  }

  function mountAutocomplete(input, getSuggestions, onPick) {
    if (!input || input.dataset.autocompleteReady) return;
    input.dataset.autocompleteReady = "true";
    const parent = input.parentElement;
    const shell = document.createElement("div");
    shell.className = "autocomplete-shell";
    parent.insertBefore(shell, input);
    shell.appendChild(input);
    const list = document.createElement("div");
    list.className = "autocomplete-list";
    list.setAttribute("role", "listbox");
    shell.appendChild(list);

    function hide() {
      list.classList.remove("is-open");
      list.innerHTML = "";
    }

    function show() {
      const suggestions = getSuggestions(input.value).slice(0, 12);
      if (!suggestions.length) {
        hide();
        return;
      }
      list.innerHTML = suggestions.map((item, index) => `<button type="button" class="autocomplete-option" data-suggestion-index="${index}">
        <span>${escapeHtml(item.label)}</span>
        <small>${escapeHtml(item.sub || item.kind || "")}</small>
      </button>`).join("");
      list.classList.add("is-open");
      $$(".autocomplete-option", list).forEach((button) => {
        button.addEventListener("mousedown", (event) => {
          event.preventDefault();
          const item = suggestions[Number(button.dataset.suggestionIndex)];
          onPick(item);
          hide();
        });
      });
    }

    input.addEventListener("input", show);
    input.addEventListener("focus", show);
    input.addEventListener("blur", () => window.setTimeout(hide, 120));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hide();
      if (event.key === "Enter" && list.classList.contains("is-open")) {
        const first = $(".autocomplete-option", list);
        if (first) {
          event.preventDefault();
          first.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        }
      }
    });
  }

  function setupPlantExplorer(root, options = {}) {
    const selected = Object.fromEntries(fillFilterDefinitions().map((group) => [group.id, ""]));
    const search = $("[data-plant-search]", root);
    const results = $("[data-plant-results]", root);
    const meta = $("[data-result-meta]", root);
    const summary = $("[data-space-summary]", root);
    const blankStart = Boolean(options.blankStart);

    const params = new URLSearchParams(window.location.search);
    const plantParam = params.get("plant");
    if (search && plantParam) search.value = plantParam.replace(/-/g, " ");

    function updateSummary(matches) {
      if (!summary) return;
      const active = Object.entries(selected)
        .filter(([, value]) => value)
        .map(([key, value]) => {
          const group = fillFilterDefinitions().find((item) => item.id === key);
          const label = group?.options.find(([option]) => option === value)?.[1] || value;
          return `${group?.label || key}: ${label}`;
        });
      summary.innerHTML = `<div class="summary-count"><strong>${matches.length}</strong><span>matching plants</span></div>
        <div class="tag-cloud">${(active.length ? active : ["choose buttons to narrow", "leaf structure", "light", "care", "genre"]).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        <p class="source-note">Every button updates the plant field immediately. Search can also select plant names or filter intents.</p>`;
    }

    function render(plants) {
      const query = search ? search.value : "";
      const matches = plants.filter((plant) => plantMatches(plant, selected, query));
      const hasActiveFilters = Boolean(query.trim()) || activeFilterCount(selected) > 0;
      const limit = hasActiveFilters ? 240 : 120;
      const visibleMatches = matches.slice(0, limit);
      renderFilterPanel(root, selected, plants, query);
      wireFilterButtons(plants);
      updateSummary(matches);

      if (meta) {
        if (blankStart && !hasActiveFilters) {
          meta.textContent = `${plants.length} plant profiles loaded. Choose a category button to begin.`;
        } else {
          const showing = matches.length > visibleMatches.length ? ` Showing ${visibleMatches.length}.` : "";
          meta.textContent = `${matches.length} of ${plants.length} plant profiles match.${showing}`;
        }
      }

      if (!results) return;
      if (blankStart && !hasActiveFilters) {
        results.innerHTML = `<div class="empty-state"><h3>Start with a button</h3><p>Choose genre, leaf structure, light requirements, ease of care, or safety. Results will populate here as you click.</p></div>`;
      } else {
        results.innerHTML = matches.length
          ? visibleMatches.map(plantCard).join("")
          : `<div class="empty-state"><h3>No plant matches yet</h3><p>Try removing one filter or choosing a broader leaf/light category.</p></div>`;
      }
    }

    function wireFilterButtons(plants) {
      $$("[data-filter-group]", root).forEach((button) => {
        button.addEventListener("click", () => {
          const group = button.dataset.filterGroup;
          const value = button.dataset.filterValue;
          selected[group] = selected[group] === value ? "" : value;
          render(plants);
        });
      });
      const clear = $("[data-clear-filters]", root);
      if (clear) {
        clear.addEventListener("click", () => {
          Object.keys(selected).forEach((key) => { selected[key] = ""; });
          if (search) search.value = "";
          render(plants);
        });
      }
    }

    loadPlants()
      .then((plants) => {
        if (options.defaultType) selected.genre = options.defaultType;
        mountAutocomplete(search, (query) => buildPlantSuggestions(plants, query), (item) => {
          if (item.kind === "intent") {
            selected[item.facet] = item.facetValue;
            if (search) search.value = "";
          } else if (search) {
            search.value = item.value;
          }
          render(plants);
        });
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
      mountAutocomplete(input, (query) => buildPlantSuggestions(plants, query), (item) => {
        if (input) input.value = item.kind === "intent" ? item.label : item.value;
        render(plants);
      });
      render(plants);
      input?.addEventListener("input", () => render(plants));
    });
  }

  function severityRank(value) {
    return { High: 3, Medium: 2, Low: 1 }[value] || 0;
  }

  function diagnosticFilters() {
    return [
      {
        id: "watering",
        label: "Watering / roots",
        tags: ["wet-soil", "dry-soil", "drooping", "yellow-leaves", "mushy-roots", "sour-smell", "leaf-drop"],
        issueWords: ["water", "root", "drought"],
      },
      {
        id: "nutrients",
        label: "Nutrients",
        tags: ["yellow-leaves", "yellow-lower-leaves", "yellow-new-leaves", "green-veins", "brown-spots", "slow-growth", "soil-crust"],
        issueWords: ["deficiency", "chlorosis", "nitrogen", "magnesium", "potassium", "iron", "fertilizer"],
      },
      {
        id: "fungal",
        label: "Fungal / disease",
        tags: ["white-powder", "black-spots", "brown-spots", "wet-leaves", "poor-airflow", "humid-air"],
        issueWords: ["mildew", "spot", "disease"],
      },
      {
        id: "pests",
        label: "Pests",
        tags: ["webbing", "sticky-residue", "holes-chewed", "stippled-leaves", "gnats", "visible-pests", "leaf-curl"],
        issueWords: ["mites", "gnats", "pests", "aphids", "scale", "chewing"],
      },
      {
        id: "environment",
        label: "Light / climate",
        tags: ["low-light", "direct-sun", "hot-dry-air", "cold-draft", "stretched-growth", "brown-crispy-edges", "leaf-curl"],
        issueWords: ["light", "sun", "cold", "heat"],
      },
      {
        id: "recent-change",
        label: "Recent change",
        tags: ["recently-repotted", "recent-fertilizer", "leaf-drop", "drooping", "yellow-leaves"],
        issueWords: ["transplant", "fertilizer", "salt"],
      },
    ];
  }

  function diagnosisAdditives(issueId) {
    const remedies = {
      "overwatering-root-stress": [
        ["Perlite", "Add aeration when repotting into a faster-draining mix."],
        ["Pumice", "Use in long-lasting gritty mixes for plants that hate wet roots."],
        ["Pine bark fines", "Adds chunky structure for aroids, citrus, and woody container plants."],
        ["Beneficial bacteria inoculant", "Use after root cleanup to support the fresh root zone."],
      ],
      "underwatering-drought-stress": [
        ["Coconut coir", "Improves moisture holding in mixes that dry too quickly."],
        ["Leaf mold", "Builds gentle water retention in beds and larger containers."],
        ["Finished compost", "Improves soil structure so water moves and holds better."],
        ["Worm castings", "Adds gentle biology while recovering from dry stress."],
      ],
      "nitrogen-deficiency": [
        ["Fish emulsion", "Fast organic nitrogen during active growth."],
        ["Blood meal", "Strong nitrogen for outdoor leafy crops when clearly needed."],
        ["Alfalfa meal / pellets", "Milder nitrogen and growth support."],
        ["Finished compost", "Slow background fertility and soil biology."],
      ],
      "iron-chlorosis": [
        ["Elemental sulfur", "Long-term pH lowering for acid-loving plants when soil is too alkaline."],
        ["Humic acid / fulvic acid", "Supports nutrient availability in depleted media."],
        ["Finished compost", "Improves root-zone chemistry and biology."],
      ],
      "magnesium-deficiency": [
        ["Epsom salt", "Magnesium sulfate only when magnesium deficiency is likely."],
        ["Dolomitic lime", "Raises pH while adding magnesium when acidic soil also needs lime."],
        ["Langbeinite / sulfate of potash-magnesia", "Adds magnesium with potassium and sulfur for fruiting crops."],
      ],
      "potassium-deficiency": [
        ["Langbeinite / sulfate of potash-magnesia", "Potassium support without chloride."],
        ["Kelp meal / liquid seaweed", "Gentle potassium and trace support."],
        ["Greensand", "Very slow long-term potassium and trace minerals."],
      ],
      "low-light-stress": [
        ["Kelp meal / liquid seaweed", "Stress support after light is corrected."],
        ["Worm castings", "Gentle refresh without forcing weak growth."],
      ],
      "sun-scorch": [
        ["Kaolin clay", "Protective film for outdoor heat and sun pressure."],
        ["Kelp meal / liquid seaweed", "Stress support while new leaves harden off."],
      ],
      rootbound: [
        ["Pine bark fines", "Adds structure when moving into a fresh container mix."],
        ["Perlite", "Improves oxygen in the new potting mix."],
        ["Worm castings", "Gentle restart feed after repotting."],
        ["Mycorrhizal inoculant", "Apply directly to compatible plant roots at transplant."],
      ],
      "fertilizer-burn-salt-buildup": [
        ["Finished compost", "Use lightly after flushing to rebuild soil biology."],
        ["Worm castings", "Gentle recovery feed once active growth returns."],
        ["Biochar", "Use charged biochar in future mixes to buffer nutrients."],
      ],
      "spider-mites": [
        ["Insecticidal soap", "Direct contact control for mites on leaf undersides."],
        ["Neem oil", "Use carefully in shade as a repeated pest-management tool."],
        ["Horticultural oil", "Smothers mites when the plant is not heat-stressed."],
      ],
      "fungus-gnats": [
        ["BTI", "Targets larvae in damp potting mix."],
        ["Beneficial nematodes", "Biological soil pest support when applied fresh to moist soil."],
        ["Diatomaceous earth", "Dry barrier only when the soil surface can stay dry."],
      ],
      "powdery-mildew": [
        ["Potassium bicarbonate", "Useful powdery mildew suppression."],
        ["Sulfur fungicide", "Preventive disease tool for sulfur-tolerant plants."],
        ["Neem oil", "Can help some mildew pressure when used carefully."],
      ],
      "leaf-spot-disease": [
        ["Copper fungicide", "Preventive tool for some bacterial and fungal spots."],
        ["Compost tea", "Use only as a fresh soil drench, not a late edible-leaf spray."],
        ["Finished compost", "Builds healthier soil after sanitation and airflow fixes."],
      ],
      "cold-damage": [
        ["Kelp meal / liquid seaweed", "Stress support after moving the plant to stable warmth."],
        ["Worm castings", "Gentle recovery feed after new growth resumes."],
      ],
      "heat-stress": [
        ["Kaolin clay", "Outdoor protective film during heat pressure."],
        ["Leaf mold", "Improves moisture buffering in beds."],
        ["Kelp meal / liquid seaweed", "Stress support while watering and shade are corrected."],
      ],
      "transplant-shock": [
        ["Mycorrhizal inoculant", "Place on compatible roots at transplant time."],
        ["Beneficial bacteria inoculant", "Supports the fresh root zone."],
        ["Kelp meal / liquid seaweed", "Gentle stress support after transplanting."],
      ],
      "chewing-pests": [
        ["BTK", "Targets caterpillars feeding on leaves."],
        ["Spinosad", "Useful for several chewing larvae when used carefully."],
        ["Pyrethrin", "Fast knockdown option for visible pests, used sparingly."],
      ],
      "sap-sucking-pests": [
        ["Insecticidal soap", "Direct contact control for aphids, whiteflies, and mealybugs."],
        ["Neem oil", "Repeated low-toxicity pest-management tool."],
        ["Horticultural oil", "Smothers scale and soft-bodied pests with thorough coverage."],
        ["Pyrethrin", "Short-residual knockdown when pressure is high."],
      ],
    };
    return remedies[issueId] || [];
  }

  function symptomButton(symptom) {
    return `<button class="symptom-card" type="button" data-symptom-id="${symptom.id}" data-keywords="${escapeHtml((symptom.keywords || []).join(" "))}">
      <img src="${symptom.image}" alt="${escapeHtml(symptom.label)} example">
      <span>${escapeHtml(symptom.label)}</span>
    </button>`;
  }

  function setupDiagnoser(root) {
    const selected = new Set();
    let activeProblem = "";
    const groupTarget = $("[data-symptom-groups]", root);
    const panel = $("[data-diagnosis-panel]", root);
    const search = $("[data-symptom-search]", root);

    function symptomMatchesIntent(symptom) {
      if (!activeProblem) return true;
      const filter = diagnosticFilters().find((item) => item.id === activeProblem);
      if (!filter) return true;
      const haystack = `${symptom.id} ${symptom.label} ${(symptom.keywords || []).join(" ")}`.toLowerCase();
      return filter.tags.includes(symptom.id) || filter.issueWords.some((word) => haystack.includes(word));
    }

    function queryMatchesSymptom(symptom) {
      const q = (search?.value || "").trim().toLowerCase();
      if (!q) return true;
      const haystack = `${symptom.id} ${symptom.label} ${(symptom.keywords || []).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    }

    function scoreIssues(ailments) {
      const filter = diagnosticFilters().find((item) => item.id === activeProblem);
      return ailments.issues
        .map((issue) => {
          const hits = issue.matchTags.filter((tag) => selected.has(tag));
          const problemBoost = filter && (
            issue.matchTags.some((tag) => filter.tags.includes(tag)) ||
            filter.issueWords.some((word) => `${issue.title} ${issue.summary}`.toLowerCase().includes(word))
          ) ? 0.5 : 0;
          return { ...issue, hits, score: hits.length + problemBoost };
        })
        .filter((issue) => issue.score > 0)
        .sort((a, b) => b.score - a.score || severityRank(b.severity) - severityRank(a.severity) || a.title.localeCompare(b.title));
    }

    function renderProblemButtons(ailments) {
      const existing = $("[data-diagnostic-filters]", root);
      if (existing) existing.remove();
      const wrap = document.createElement("div");
      wrap.className = "diagnostic-filter-panel";
      wrap.dataset.diagnosticFilters = "";
      wrap.innerHTML = `<div class="filter-group">
        <h3>Start with the problem type</h3>
        <div class="filter-options">
          ${diagnosticFilters().map((filter) => {
            const count = ailments.issues.filter((issue) => issue.matchTags.some((tag) => filter.tags.includes(tag))).length;
            return `<button class="filter-button ${activeProblem === filter.id ? "is-active" : ""}" type="button" data-problem-filter="${filter.id}">
              <span>${filter.label}</span><span class="filter-count">${count}</span>
            </button>`;
          }).join("")}
          ${activeProblem || selected.size ? `<button class="filter-button reset" type="button" data-clear-diagnoser>Clear</button>` : ""}
        </div>
      </div>`;
      groupTarget.parentElement.insertBefore(wrap, groupTarget);
      $$("[data-problem-filter]", wrap).forEach((button) => {
        button.addEventListener("click", () => {
          activeProblem = activeProblem === button.dataset.problemFilter ? "" : button.dataset.problemFilter;
          renderAll(ailments);
        });
      });
      $("[data-clear-diagnoser]", wrap)?.addEventListener("click", () => {
        activeProblem = "";
        selected.clear();
        if (search) search.value = "";
        renderAll(ailments);
      });
    }

    function renderSymptoms(ailments) {
      const groups = ailments.symptomGroups
        .map((group) => ({
          ...group,
          symptoms: group.symptoms.filter((symptom) => symptomMatchesIntent(symptom) && queryMatchesSymptom(symptom)),
        }))
        .filter((group) => group.symptoms.length);

      groupTarget.innerHTML = groups.length
        ? groups.map((group) => `<section class="symptom-group">
          <h3>${escapeHtml(group.label)}</h3>
          <div class="symptom-grid">${group.symptoms.map(symptomButton).join("")}</div>
        </section>`).join("")
        : `<div class="empty-state"><h3>No ailment terms matched</h3><p>Try a broader problem type or search term.</p></div>`;

      $$(".symptom-card", root).forEach((button) => {
        const id = button.dataset.symptomId;
        button.classList.toggle("is-active", selected.has(id));
        button.addEventListener("click", () => {
          if (selected.has(id)) selected.delete(id);
          else selected.add(id);
          renderAll(ailments);
        });
      });
    }

    function renderPanel(ailments) {
      if (!panel) return;
      const selectedSymptoms = Array.from(selected).map((id) => ailments.symptoms[id]).filter(Boolean);
      const issues = scoreIssues(ailments).slice(0, 7);
      const problem = diagnosticFilters().find((item) => item.id === activeProblem);

      if (!selected.size && !activeProblem) {
        panel.innerHTML = `<h2>Diagnosis</h2><p>Choose a problem type, then select matching symptom buttons. The likely causes will narrow as you click.</p>`;
        return;
      }

      panel.innerHTML = `<h2>Possible causes</h2>
        ${problem ? `<p class="source-note">Problem type: <strong>${escapeHtml(problem.label)}</strong></p>` : ""}
        ${selectedSymptoms.length ? `<div class="selected-symptoms">${selectedSymptoms.map((symptom) => `<span>${escapeHtml(symptom.label)}</span>`).join("")}</div>` : `<p>Select exact symptoms to sharpen the diagnosis.</p>`}
        ${issues.length ? issues.map((issue, index) => `<article class="diagnosis-card ${index === 0 ? "top-match" : ""}">
          <div class="diagnosis-heading">
            <span class="status-chip ${issue.severity === "High" ? "must" : "should"}">${escapeHtml(issue.severity)}</span>
            <strong>${index === 0 ? "Best current match" : `${Math.floor(issue.score)} direct clues`}</strong>
          </div>
          <h3>${escapeHtml(issue.title)}</h3>
          ${issue.hits.length ? `<p class="source-note">Matched: ${issue.hits.map((id) => escapeHtml(ailments.symptoms[id]?.label || id)).join(", ")}</p>` : ""}
          <h4>Cause</h4>
          <p>${escapeHtml(issue.summary)}</p>
          ${diagnosisAdditives(issue.id).length ? `<h4>Helpful organic additives</h4>
          <div class="tag-cloud remedy-links">
            ${diagnosisAdditives(issue.id).map(([name, note]) => `<a href="/organic-additives.html?q=${encodeURIComponent(name)}" title="${escapeHtml(note)}">${escapeHtml(name)}</a>`).join("")}
          </div>` : ""}
          <h4>How to cure</h4>
          <ul>${issue.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ul>
        </article>`).join("") : `<div class="notice">No strong cause matched this pattern yet.</div>`}
        <p class="source-note">Symptoms overlap. Check roots, light, watering, pest evidence, and recent changes before treating.</p>`;
    }

    function renderAll(ailments) {
      renderProblemButtons(ailments);
      renderSymptoms(ailments);
      renderPanel(ailments);
    }

    loadAilments().then((ailments) => {
      const symptomSuggestions = Object.values(ailments.symptoms).map((symptom) => ({
        kind: "symptom",
        label: symptom.label,
        sub: "Ailment term",
        value: symptom.label,
        symptomId: symptom.id,
        haystack: `${symptom.label} ${(symptom.keywords || []).join(" ")}`.toLowerCase(),
      }));
      const issueSuggestions = ailments.issues.map((issue) => ({
        kind: "issue",
        label: issue.title,
        sub: "Possible cause",
        value: issue.title,
        issue,
        haystack: `${issue.title} ${issue.summary} ${issue.matchTags.join(" ")}`.toLowerCase(),
      }));
      const problemSuggestions = diagnosticFilters().map((filter) => ({
        kind: "problem",
        label: filter.label,
        sub: "Problem type",
        value: filter.label,
        problemId: filter.id,
        haystack: `${filter.label} ${filter.issueWords.join(" ")} ${filter.tags.join(" ")}`.toLowerCase(),
      }));

      mountAutocomplete(search, (query) => {
        const q = query.trim().toLowerCase();
        const all = [...problemSuggestions, ...symptomSuggestions, ...issueSuggestions];
        if (!q) return all.slice(0, 12);
        return all.filter((item) => item.haystack.includes(q) || item.label.toLowerCase().includes(q)).slice(0, 12);
      }, (item) => {
        if (item.kind === "problem") activeProblem = item.problemId;
        if (item.kind === "symptom") selected.add(item.symptomId);
        if (item.kind === "issue") item.issue.matchTags.slice(0, 4).forEach((tag) => selected.add(tag));
        if (search) search.value = "";
        renderAll(ailments);
      });

      search?.addEventListener("input", () => renderAll(ailments));
      renderAll(ailments);
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

  function setupAdditiveSearch() {
    const root = document.querySelector("[data-additive-library]");
    if (!root) return;
    const input = $("[data-additive-search]", root);
    const rows = $$("[data-additive-row]", root);
    const count = $("[data-additive-count]", root);
    if (!input || !rows.length) return;
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) input.value = query;

    function render() {
      const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let visible = 0;
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const match = terms.every((term) => text.includes(term));
        row.hidden = !match;
        if (match) visible += 1;
      });
      if (count) count.textContent = `${visible} of ${rows.length} additives shown`;
    }

    input.addEventListener("input", render);
    render();
  }

  function init() {
    enhanceNav();
    const yearTarget = document.querySelector("[data-current-year]");
    if (yearTarget) yearTarget.textContent = new Date().getFullYear();

    const library = document.querySelector("[data-plant-library]");
    if (library) setupPlantExplorer(library);

    const fillSpace = document.querySelector("[data-fill-space]");
    if (fillSpace) setupPlantExplorer(fillSpace, { blankStart: true });

    const siteSearch = document.querySelector("[data-site-search]");
    if (siteSearch) setupSiteSearch(siteSearch);

    const diagnoser = document.querySelector("[data-diagnoser]");
    if (diagnoser) setupDiagnoser(diagnoser);

    setupAdditiveSearch();
    keepLegacyCardSearch();
    keepLegacyFilters();
  }

  init();
})();
