const fs = require("fs");
const path = require("path");
const { supplementalPlants } = require("./plant-profile-expansion");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const sources = {
  searchIndex: "C:/Users/UrsaMajor/Downloads/athomegrower_single_top_menu_preserve_buttons_fix_extracted/public/data/plant-search-index.json",
  fillMaster: "C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/data/fill-my-space-master-plant-database.json",
  diagnoserMaster: "C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/data/plant-diagnoser-master-database.json",
  vegetables: "C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/data/vegetable-library.json",
  fruits: "C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/data/fruit-library.json",
  coverCrops: "C:/Users/UrsaMajor/Downloads/athomegrower_cover_crops_update_v2_extracted/public/data/cover-crops-library.json",
};

const imageSources = [
  ["C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/assets/images/fruits", "fruits"],
  ["C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/assets/images/vegetables", "vegetables"],
  ["C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/assets/images/pet-safe", "pet-safe"],
  ["C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/assets/images/herbs", "herbs"],
  ["C:/Users/UrsaMajor/Downloads/athomegrower_diagnoser_companion_fruits_full_update_extracted/public/assets/images/toxic", "toxic"],
  ["C:/Users/UrsaMajor/Downloads/athomegrower_cover_crops_update_v2_extracted/public/assets/images/cover-crops", "cover-crops"],
];

const categoryMeta = {
  "pet-friendly": {
    label: "Pet-friendly",
    shortLabel: "Pet Safe",
    description: "Plants commonly presented as lower-risk choices for homes with pets.",
    color: "#2f7d5a",
    accent: "#bfe8d4",
  },
  toxic: {
    label: "Toxic / keep away",
    shortLabel: "Toxic",
    description: "Decorative plants that should be kept away from pets and children unless verified safe.",
    color: "#a33d2c",
    accent: "#f6c7bd",
  },
  herbs: {
    label: "Herbs",
    shortLabel: "Herb",
    description: "Culinary, tea, fragrance, and pollinator herbs for containers, shelves, and garden beds.",
    color: "#517b2b",
    accent: "#d8e9af",
  },
  vegetables: {
    label: "Vegetables",
    shortLabel: "Vegetable",
    description: "Edible garden staples for patios, raised beds, containers, and sunny indoor starts.",
    color: "#8a5a1e",
    accent: "#f5dc9f",
  },
  fruits: {
    label: "Fruits",
    shortLabel: "Fruit",
    description: "Container fruit, berry, and orchard plants with practical care notes.",
    color: "#8c3f62",
    accent: "#f2c4d8",
  },
  "cover-crops": {
    label: "Cover crops",
    shortLabel: "Cover Crop",
    description: "Soil-building crops for beds, containers, orchards, and seasonal rotations.",
    color: "#356b8c",
    accent: "#bee0f2",
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(to);
  fs.cpSync(from, to, { recursive: true });
}

function cleanText(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00d7/g, "x")
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

function html(value) {
  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return html(value).replace(/'/g, "&#39;");
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sentence(value, fallback = "") {
  const text = cleanText(value || fallback);
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  return [cleanText(value)].filter(Boolean);
}

function parseSearchDetails(plant) {
  const text = plant.searchText || "";
  const start = text.indexOf("{");
  if (start === -1) return {};
  try {
    return JSON.parse(text.slice(start));
  } catch {
    return {};
  }
}

function getValue(objects, keys) {
  for (const key of keys) {
    for (const object of objects) {
      if (!object) continue;
      if (object[key] !== undefined && object[key] !== null && object[key] !== "") {
        return object[key];
      }
    }
  }
  return "";
}

function titleName(value) {
  const text = cleanText(value);
  if (!text) return "";
  if (/[A-Z]/.test(text.slice(1))) return text;
  return text.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function normalizeCategory(value, fallback = "") {
  const raw = slugify(value || fallback);
  if (raw === "pet-safe" || raw === "petfriendly") return "pet-friendly";
  if (raw === "cover-crop" || raw === "covercrops") return "cover-crops";
  if (raw === "vegetable") return "vegetables";
  if (raw === "fruit") return "fruits";
  if (raw === "herb") return "herbs";
  if (raw === "toxic-houseplants") return "toxic";
  return categoryMeta[raw] ? raw : fallback || "plants";
}

function normalizePlant(input, fallbackCategory = "") {
  const detail = input.__detail || {};
  const objects = [input, detail];
  const plantTypeCategory = normalizeCategory(
    getValue(objects, ["plantTypeCategory", "planttypecategory", "category", "source"]),
    fallbackCategory
  );
  const name = titleName(getValue(objects, ["name"])) || "Plant";
  const slug = slugify(getValue(objects, ["slug"]) || name);
  const meta = categoryMeta[plantTypeCategory] || categoryMeta.herbs;
  const finderTags = [
    ...asArray(getValue(objects, ["finderTags", "findertags"])),
    ...asArray(getValue(objects, ["tags"])),
    `plant-type:${plantTypeCategory}`,
    `category:${plantTypeCategory}`,
    "fill-my-space:enabled",
    "plant-facts:enabled",
    "plant-care:enabled",
  ];

  const normalized = {
    id: cleanText(getValue(objects, ["id"])) || `${plantTypeCategory}-${slug}`,
    source: cleanText(getValue(objects, ["source"])) || plantTypeCategory,
    plantTypeCategory,
    categoryLabel: meta.label,
    slug,
    pageSlug: slug,
    name,
    botanicalName: cleanText(getValue(objects, ["botanicalName", "botanicalname"])),
    image: cleanText(getValue(objects, ["image"])),
    alt: cleanText(getValue(objects, ["alt"])) || `${name} plant image`,
    petStatus: cleanText(getValue(objects, ["petStatus", "petstatus"])) || (plantTypeCategory === "pet-friendly" ? "pet-friendly" : "check-before-use"),
    lightText: sentence(getValue(objects, ["lightText", "lighttext", "light"]), "Match light to the plant profile."),
    careLevel: cleanText(getValue(objects, ["careLevel", "carelevel"])) || "moderate",
    waterText: sentence(getValue(objects, ["waterText", "watertext", "whenToWater", "whentowater"]), "Water when the soil reaches the dryness this plant prefers."),
    soilText: sentence(getValue(objects, ["soilText", "soiltext", "soilMix", "soilmix"]), "Use a well-draining mix with structure and airflow."),
    foliageType: cleanText(getValue(objects, ["foliageType", "foliagetype"])),
    plantType: cleanText(getValue(objects, ["plantType", "planttype"])) || meta.shortLabel,
    description: sentence(getValue(objects, ["description", "overview"]), `${name} is included in the AtHomeGrower plant library with care, placement, and diagnostic notes.`),
    environment: slugify(getValue(objects, ["environment", "location", "suitability"])) || "indoor-outdoor",
    environmentLabel: titleName(getValue(objects, ["environmentLabel", "environmentlabel", "locationLabel", "locationlabel", "suitability"])) || "Indoor/Outdoor",
    locationRationale: sentence(getValue(objects, ["locationRationale", "locationrationale"])),
    careCohort: cleanText(getValue(objects, ["careCohort", "carecohort"])),
    careCohortLabel: sentence(getValue(objects, ["careCohortLabel", "carecohortlabel"])),
    overview: sentence(getValue(objects, ["overview", "description"])),
    light: sentence(getValue(objects, ["light"]), "Give the plant the light listed in the quick facts and adjust gradually if leaves fade, stretch, or scorch."),
    soilMix: sentence(getValue(objects, ["soilMix", "soilmix", "soilText", "soiltext"]), "Use a well-draining potting mix that balances moisture retention with air around the roots."),
    soilMoisture: sentence(getValue(objects, ["soilMoisture", "soilmoisture"]), "Avoid leaving roots in stale, soggy soil unless the plant is specifically moisture-loving."),
    whenToWater: sentence(getValue(objects, ["whenToWater", "whentowater", "waterText", "watertext"]), "Water deeply, then let the soil dry to the level this plant prefers before watering again."),
    whenToFertilize: sentence(getValue(objects, ["whenToFertilize", "whentofertilize"]), "Feed lightly during active growth and reduce or pause during slow winter growth."),
    howToPrune: sentence(getValue(objects, ["howToPrune", "howtoprune"]), "Remove dead, damaged, or crowded growth with clean pruners."),
    repottingRootbound: sentence(getValue(objects, ["repottingRootbound", "repottingrootbound"]), "Repot when roots circle densely, the plant dries too fast, or growth stalls despite good care."),
    commonPestsDiseases: sentence(getValue(objects, ["commonPestsDiseases", "commonpestsdiseases"]), "Watch for aphids, mites, scale, mealybugs, fungus gnats, leaf spot, and root rot."),
    companionPlanting: sentence(getValue(objects, ["companionPlanting", "companionplanting"])),
    bestFor: sentence(getValue(objects, ["bestFor", "bestfor"]), meta.description),
    hardinessZones: cleanText(getValue(objects, ["hardinessZones", "hardinesszones"])),
    zoneText: cleanText(getValue(objects, ["zoneText", "zonetext"])),
    zoneNotes: sentence(getValue(objects, ["zoneNotes", "zonenotes"])),
    season: cleanText(getValue(objects, ["season"])),
    frostBehavior: sentence(getValue(objects, ["frostBehavior"])),
    plantingWindow: sentence(getValue(objects, ["plantingWindow"])),
    termination: sentence(getValue(objects, ["termination"])),
    nitrogen: sentence(getValue(objects, ["nitrogen"])),
    uses: sentence(getValue(objects, ["uses"])),
    zoneTiming: getValue(objects, ["zoneTiming"]) || null,
    sources: Array.isArray(getValue(objects, ["sources"])) ? getValue(objects, ["sources"]) : [],
    quickTags: [
      ...asArray(getValue(objects, ["quickTags", "quicktags"])),
      titleName(plantTypeCategory.replace("-", " ")),
      titleName(cleanText(getValue(objects, ["careLevel", "carelevel"])) || "moderate"),
    ].filter(Boolean).slice(0, 8),
    tags: Array.from(new Set(finderTags.map(slugify).filter(Boolean))),
    searchText: "",
  };

  normalized.searchText = [
    normalized.name,
    normalized.botanicalName,
    normalized.categoryLabel,
    normalized.petStatus,
    normalized.lightText,
    normalized.waterText,
    normalized.soilText,
    normalized.careLevel,
    normalized.description,
    normalized.plantType,
    normalized.bestFor,
    normalized.tags.join(" "),
  ].join(" ").toLowerCase();

  return normalized;
}

function addPlant(map, raw, fallbackCategory = "") {
  const plant = normalizePlant(raw, fallbackCategory);
  const key = `${plant.plantTypeCategory}:${plant.slug}`;
  if (!map.has(key)) {
    map.set(key, plant);
    return;
  }
  const existing = map.get(key);
  const merged = {
    ...existing,
    ...Object.fromEntries(Object.entries(plant).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== "" && value !== null && value !== undefined;
    })),
  };
  merged.tags = Array.from(new Set([...(existing.tags || []), ...(plant.tags || [])]));
  merged.quickTags = Array.from(new Set([...(existing.quickTags || []), ...(plant.quickTags || [])])).slice(0, 8);
  merged.searchText = `${existing.searchText} ${plant.searchText}`.trim();
  map.set(key, merged);
}

function colorFrom(value, saturation = 58, lightness = 42) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} ${saturation}% ${lightness}%)`;
}

function publicFileFromUrl(url) {
  if (!url || !url.startsWith("/")) return "";
  return path.join(publicDir, ...url.slice(1).split("/"));
}

function plantSvg(plant) {
  const main = colorFrom(plant.slug, 44, 34);
  const light = colorFrom(`${plant.slug}-light`, 52, 76);
  const accent = categoryMeta[plant.plantTypeCategory]?.accent || "#d8e9af";
  const label = html(plant.name);
  const type = html(categoryMeta[plant.plantTypeCategory]?.shortLabel || plant.plantType);
  const fruit = plant.plantTypeCategory === "fruits" || plant.plantTypeCategory === "vegetables";
  const herb = plant.plantTypeCategory === "herbs";
  const toxic = plant.plantTypeCategory === "toxic";
  const pot = toxic ? "#6f3f33" : "#78513a";
  const dots = fruit
    ? `<circle cx="323" cy="219" r="24" fill="#d86a34"/><circle cx="445" cy="233" r="21" fill="#bc3f4a"/><circle cx="392" cy="173" r="18" fill="#efa434"/>`
    : "";
  const flowers = herb
    ? `<circle cx="318" cy="190" r="14" fill="#f3cf62"/><circle cx="468" cy="190" r="14" fill="#f3cf62"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img" aria-labelledby="title desc">
<title id="title">${label}</title>
<desc id="desc">Generated AtHomeGrower plant illustration.</desc>
<rect width="800" height="520" rx="36" fill="#f8fbf4"/>
<rect x="28" y="28" width="744" height="464" rx="28" fill="${light}" opacity=".45"/>
<path d="M98 418c74-68 160-94 260-79 129 20 223-27 318-138 35 126 0 216-105 270H99z" fill="${accent}" opacity=".5"/>
<ellipse cx="398" cy="430" rx="184" ry="32" fill="#233021" opacity=".14"/>
<path d="M302 347h196l-26 104H328z" fill="${pot}"/>
<path d="M287 327h226v42H287z" fill="#93664a"/>
<path d="M402 333c-10-118-7-194 10-246" fill="none" stroke="${main}" stroke-width="16" stroke-linecap="round"/>
<path d="M392 263c-84-82-155-93-212-33 74 49 143 59 212 33z" fill="${main}"/>
<path d="M407 253c90-76 164-81 221-15-76 41-146 46-221 15z" fill="${main}" opacity=".92"/>
<path d="M399 202c-80-78-83-142-13-192 42 72 46 136 13 192z" fill="${main}" opacity=".86"/>
<path d="M407 316c58-69 119-84 184-45-54 56-113 72-184 45z" fill="${main}" opacity=".8"/>
<path d="M386 313c-68-50-132-50-190-2 66 35 129 36 190 2z" fill="${main}" opacity=".78"/>
${dots}${flowers}
<text x="400" y="80" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="#1f2c1d">${label}</text>
<text x="400" y="118" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#52614b">${type}</text>
</svg>`;
}

function ensurePlantImage(plant) {
  const existing = publicFileFromUrl(plant.image);
  if (existing && fs.existsSync(existing)) return plant.image;
  const generatedDir = path.join(publicDir, "assets", "images", "generated-plants");
  ensureDir(generatedDir);
  const fileName = `${plant.plantTypeCategory}-${plant.slug}.svg`;
  const url = `/assets/images/generated-plants/${fileName}`;
  fs.writeFileSync(path.join(generatedDir, fileName), plantSvg(plant));
  return url;
}

function pageShell({ title, description, current = "", body, script = "/assets/app.js" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${html(title)}</title>
  <meta name="description" content="${attr(description)}">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body id="top" data-current-nav="${attr(current)}">
<a class="skip-link" href="#main">Skip to content</a>
${siteHeader(current)}
<main id="main">
${body}
</main>
${siteFooter()}
<script src="${script}"></script>
</body>
</html>
`;
}

function siteHeader(current = "") {
  const nav = [
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
  return `<header class="site-header">
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="/index.html" aria-label="AtHomeGrower home">
      <span class="brand-mark">AG</span>
      <span>AtHomeGrower</span>
    </a>
    <div class="nav-links">
      ${nav.map(([label, href, key]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("\n      ")}
    </div>
  </nav>
</header>`;
}

function siteFooter() {
  return `<footer class="footer">
  <div class="footer-inner">
    <p>&copy; <span data-current-year></span> AtHomeGrower.com - Indoor/outdoor plant care for real homes.</p>
    <p><a href="/about/editorial-policy.html">Editorial policy</a> - <a href="/image-credits.html">Image credits</a> - <a href="#top">Back to top</a></p>
  </div>
</footer>`;
}

function plantCardStatic(plant) {
  return `<article class="plant-card" data-search-card data-category="${attr(plant.plantTypeCategory)}">
    <a class="plant-card-media" href="${attr(plant.factsUrl)}"><img src="${attr(plant.image)}" alt="${attr(plant.alt)}" loading="lazy"></a>
    <div class="plant-card-body">
      <div class="pill-row"><span class="pill">${html(plant.categoryLabel)}</span><span class="pill">${html(plant.careLevel)}</span></div>
      <h3><a href="${attr(plant.factsUrl)}">${html(plant.name)}</a></h3>
      <p>${html(plant.description)}</p>
      <dl class="mini-facts">
        <div><dt>Light</dt><dd>${html(plant.lightText)}</dd></div>
        <div><dt>Water</dt><dd>${html(plant.waterText)}</dd></div>
        <div><dt>Soil</dt><dd>${html(plant.soilText)}</dd></div>
        <div><dt>Pet note</dt><dd>${html(petLabel(plant.petStatus))}</dd></div>
      </dl>
      <a class="text-link" href="${attr(plant.factsUrl)}">Open plant profile</a>
    </div>
  </article>`;
}

function petLabel(status) {
  const key = slugify(status);
  if (key.includes("pet-friendly")) return "Pet-friendly";
  if (key.includes("toxic")) return "Toxic / keep away";
  return "Check before use";
}

function plantDetailPage(plant, allPlants) {
  const related = allPlants
    .filter((item) => item.slug !== plant.slug && item.plantTypeCategory === plant.plantTypeCategory)
    .slice(0, 3);
  const sourceList = plant.sources
    .filter((source) => source && source.url && source.label)
    .slice(0, 5)
    .map((source) => `<li><a href="${attr(source.url)}" rel="noopener">${html(source.label)}</a></li>`)
    .join("");
  const zoneTiming = plant.zoneTiming
    ? `<section class="section">
        <div class="section-header"><div><h2>Zone timing</h2><p>Use these windows as a starting point and adjust for local frost, heat, and rainfall.</p></div></div>
        <div class="grid four">${Object.entries(plant.zoneTiming).map(([zone, info]) => `<article class="card compact-card"><div class="card-body">
          <span class="pill">Zones ${html(zone)}</span>
          <h3>Sow</h3><p>${html(info.sow)}</p>
          <h3>Manage</h3><p>${html(info.manage)}</p>
          <h3>Terminate</h3><p>${html(info.terminate)}</p>
        </div></article>`).join("")}</div>
      </section>`
    : "";

  return pageShell({
    title: `${plant.name} care, soil, light, water | AtHomeGrower`,
    description: `${plant.name} plant profile with light, water, soil, pet status, care level, pests, pruning, repotting, and growing notes.`,
    current: "plant-library",
    body: `<section class="plant-detail-hero">
  <div class="plant-detail-copy">
    <span class="eyebrow">${html(plant.categoryLabel)}</span>
    <h1>${html(plant.name)}</h1>
    ${plant.botanicalName ? `<p class="botanical">${html(plant.botanicalName)}</p>` : ""}
    <p class="lede">${html(plant.description)}</p>
    <div class="actions">
      <a class="button" href="/fill-your-space.html?plant=${attr(plant.slug)}">Match in Fill Your Space</a>
      <a class="button secondary" href="/plant-diagnoser.html?plant=${attr(plant.slug)}">Diagnose this plant</a>
    </div>
  </div>
  <div class="plant-detail-media">
    <img src="${attr(plant.image)}" alt="${attr(plant.alt)}">
  </div>
</section>

<section class="section">
  <div class="plant-facts-strip">
    <div><span>Pet status</span><strong>${html(petLabel(plant.petStatus))}</strong></div>
    <div><span>Light</span><strong>${html(plant.lightText)}</strong></div>
    <div><span>Water</span><strong>${html(plant.waterText)}</strong></div>
    <div><span>Soil</span><strong>${html(plant.soilText)}</strong></div>
    <div><span>Care</span><strong>${html(plant.careLevel)}</strong></div>
  </div>
</section>

<section class="section plant-detail-grid">
  <article class="card"><div class="card-body">
    <h2>Plant care</h2>
    <div class="care-note"><strong>Light:</strong><p>${html(plant.light)}</p></div>
    <div class="care-note"><strong>Soil mix:</strong><p>${html(plant.soilMix)}</p></div>
    <div class="care-note"><strong>Soil moisture:</strong><p>${html(plant.soilMoisture)}</p></div>
    <div class="care-note"><strong>When to water:</strong><p>${html(plant.whenToWater)}</p></div>
    <div class="care-note"><strong>Fertilizer:</strong><p>${html(plant.whenToFertilize)}</p></div>
    <div class="care-note"><strong>Pruning:</strong><p>${html(plant.howToPrune)}</p></div>
    <div class="care-note"><strong>Repotting/rootbound:</strong><p>${html(plant.repottingRootbound)}</p></div>
  </div></article>

  <aside class="card"><div class="card-body">
    <h2>Best use</h2>
    <p>${html(plant.bestFor)}</p>
    ${plant.hardinessZones || plant.zoneText ? `<p><strong>Zones:</strong> ${html(plant.zoneText || plant.hardinessZones)}</p>` : ""}
    ${plant.season ? `<p><strong>Season:</strong> ${html(plant.season)}</p>` : ""}
    ${plant.plantingWindow ? `<p><strong>Planting window:</strong> ${html(plant.plantingWindow)}</p>` : ""}
    ${plant.termination ? `<p><strong>Termination:</strong> ${html(plant.termination)}</p>` : ""}
    ${plant.nitrogen ? `<p><strong>Nitrogen:</strong> ${html(plant.nitrogen)}</p>` : ""}
    ${plant.uses ? `<p><strong>Uses:</strong> ${html(plant.uses)}</p>` : ""}
    <div class="tag-cloud">${plant.quickTags.map((tag) => `<span>${html(tag)}</span>`).join("")}</div>
  </div></aside>
</section>

${zoneTiming}

<section class="section">
  <div class="grid two">
    <article class="card"><div class="card-body">
      <h2>Problems to watch</h2>
      <p>${html(plant.commonPestsDiseases)}</p>
      <a class="text-link" href="/plant-diagnoser.html?plant=${attr(plant.slug)}">Open the plant diagnoser</a>
    </div></article>
    <article class="card"><div class="card-body">
      <h2>Placement notes</h2>
      <p>${html(plant.locationRationale || plant.companionPlanting || "Place it where light, access, pets, airflow, and watering habits match the plant's needs.")}</p>
      <p class="source-note">Pet toxicity and edibility notes can vary by animal, cultivar, and source. Verify with a veterinarian, poison-control source, or local extension office before relying on a plant as safe.</p>
    </div></article>
  </div>
</section>

${related.length ? `<section class="section"><div class="section-header"><div><h2>Related plants</h2><p>More ${html(plant.categoryLabel.toLowerCase())} profiles.</p></div></div><div class="grid three">${related.map(plantCardStatic).join("")}</div></section>` : ""}

${sourceList ? `<section class="section"><div class="card"><div class="card-body"><h2>Sources</h2><ul>${sourceList}</ul></div></div></section>` : ""}`,
  });
}

function writePlantPages(plants) {
  const plantsDir = path.join(publicDir, "plants");
  ensureDir(plantsDir);
  for (const plant of plants) {
    fs.writeFileSync(path.join(plantsDir, `${plant.pageSlug}.html`), plantDetailPage(plant, plants));
  }
}

function generateAilmentSvg(symptom) {
  const id = symptom.id;
  const markColor = id.includes("yellow") ? "#e4bc2d"
    : id.includes("brown") ? "#96502d"
    : id.includes("black") ? "#2c2622"
    : id.includes("white") ? "#f7f3df"
    : id.includes("web") ? "#e6edf3"
    : id.includes("sticky") ? "#f0b94d"
    : id.includes("holes") ? "#7b4a2d"
    : "#4f8a44";
  const bg = id.includes("pest") || id.includes("gnat") || id.includes("web") || id.includes("sticky") ? "#f7f4ec" : "#f6fbf1";
  const spots = ["brown-spots", "black-spots", "stippled-leaves"].includes(id)
    ? Array.from({ length: 12 }, (_, i) => `<circle cx="${220 + (i % 4) * 68}" cy="${150 + Math.floor(i / 4) * 56}" r="${7 + (i % 3) * 3}" fill="${markColor}" opacity=".85"/>`).join("")
    : "";
  const holes = id.includes("holes") ? `<circle cx="260" cy="190" r="24" fill="${bg}"/><circle cx="388" cy="230" r="19" fill="${bg}"/><circle cx="472" cy="172" r="14" fill="${bg}"/>` : "";
  const powder = id.includes("white") ? `<g opacity=".85"><circle cx="278" cy="175" r="26" fill="${markColor}"/><circle cx="372" cy="232" r="32" fill="${markColor}"/><circle cx="470" cy="168" r="22" fill="${markColor}"/></g>` : "";
  const web = id.includes("web") ? `<path d="M238 132c83 83 191 92 324 27M238 132c94 32 164 111 210 237M562 159c-68 60-159 130-274 210" fill="none" stroke="#dce7ee" stroke-width="7" opacity=".9"/>` : "";
  const edges = id.includes("tips") || id.includes("edges") ? `<path d="M180 344c72 24 144 21 216-8 72 29 144 32 216 8-38 64-109 103-216 117-107-14-178-53-216-117z" fill="${markColor}" opacity=".88"/>` : "";
  const label = html(symptom.label);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 500" role="img" aria-labelledby="title desc">
<title id="title">${label}</title>
<desc id="desc">Example plant symptom illustration.</desc>
<rect width="760" height="500" rx="32" fill="${bg}"/>
<path d="M384 438c-114-37-183-115-205-235-15-83 32-135 111-96 36 18 64 50 94 96 31-46 58-78 94-96 79-39 126 13 111 96-22 120-91 198-205 235z" fill="#4f8a44"/>
<path d="M384 438c-7-89-4-183 0-282" fill="none" stroke="#2e6536" stroke-width="11" stroke-linecap="round"/>
${spots}${holes}${powder}${web}${edges}
${id.includes("yellow") ? `<path d="M184 216c41 33 96 58 166 75M408 188c44 32 95 54 153 66" fill="none" stroke="${markColor}" stroke-width="18" stroke-linecap="round" opacity=".9"/>` : ""}
${id.includes("curl") ? `<path d="M188 250c58-58 119-62 183-13 44 34 91 26 140-23" fill="none" stroke="${markColor}" stroke-width="16" stroke-linecap="round"/>` : ""}
${id.includes("droop") || id.includes("wilt") ? `<path d="M160 340c72 46 142 54 211 24M392 361c78 25 147 16 207-28" fill="none" stroke="${markColor}" stroke-width="16" stroke-linecap="round"/>` : ""}
<text x="380" y="68" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" fill="#1f2c1d">${label}</text>
</svg>`;
}

function buildAilments() {
  const groups = [
    {
      id: "leaves",
      label: "Leaf symptoms",
      symptoms: [
        ["yellow-leaves", "Yellowing leaves", ["yellowing", "yellow leaves", "pale leaves"]],
        ["yellow-lower-leaves", "Lower leaves yellow first", ["older leaves yellow", "bottom leaves yellow"]],
        ["yellow-new-leaves", "New leaves yellow", ["new growth yellow", "pale new growth"]],
        ["green-veins", "Green veins with yellow tissue", ["interveinal chlorosis", "green veins"]],
        ["brown-tips", "Brown leaf tips", ["tips brown", "brown tips", "crispy tips"]],
        ["brown-crispy-edges", "Brown crispy edges", ["crispy edges", "leaf margins brown"]],
        ["brown-spots", "Brown spots on leaves", ["spots on leaves", "brown spots"]],
        ["black-spots", "Black or dark spots", ["black spots", "dark spots"]],
        ["white-powder", "White powder on leaves", ["powdery mildew", "white powder"]],
        ["leaf-curl", "Curling leaves", ["curling", "curled leaves"]],
        ["leaf-drop", "Leaves dropping", ["leaf drop", "dropping leaves"]],
        ["drooping", "Drooping or wilting", ["wilting", "drooping", "limp leaves"]],
        ["webbing", "Fine webbing", ["webbing", "spider mites"]],
        ["sticky-residue", "Sticky residue", ["sticky leaves", "honeydew"]],
        ["holes-chewed", "Holes or chewed leaves", ["holes", "chewed leaves"]],
        ["stippled-leaves", "Tiny pale speckles", ["stippled", "speckled leaves"]],
      ],
    },
    {
      id: "soil",
      label: "Soil and root clues",
      symptoms: [
        ["wet-soil", "Soil stays wet", ["wet soil", "soggy soil"]],
        ["dry-soil", "Soil is bone dry", ["dry soil", "hydrophobic"]],
        ["dries-fast", "Soil dries very fast", ["dries fast", "rootbound"]],
        ["sour-smell", "Sour or rotten smell", ["rotten smell", "sour soil"]],
        ["mushy-roots", "Mushy brown roots", ["root rot", "mushy roots"]],
        ["roots-circling", "Roots circling pot", ["rootbound", "circling roots"]],
        ["soil-crust", "White crust on soil", ["salt buildup", "soil crust"]],
        ["gnats", "Tiny gnats around soil", ["fungus gnats", "gnats"]],
        ["recent-fertilizer", "Recently fertilized", ["fertilizer burn", "fed recently"]],
        ["recently-repotted", "Recently repotted", ["transplant shock", "repotted"]],
      ],
    },
    {
      id: "environment",
      label: "Environment clues",
      symptoms: [
        ["low-light", "Low light area", ["low light", "dark corner"]],
        ["direct-sun", "Direct hot sun", ["sun scorch", "direct sun"]],
        ["hot-dry-air", "Hot dry air", ["dry air", "heat vent"]],
        ["cold-draft", "Cold draft", ["cold damage", "draft"]],
        ["poor-airflow", "Poor airflow", ["stale air", "crowded"]],
        ["humid-air", "Humid air", ["humidity", "humid"]],
        ["wet-leaves", "Leaves stay wet", ["wet foliage", "overhead watering"]],
        ["slow-growth", "Slow or stalled growth", ["stunted growth", "slow growth"]],
        ["stretched-growth", "Long weak stretched growth", ["leggy", "stretching"]],
        ["visible-pests", "Visible pests", ["aphids", "mealybugs", "scale", "thrips"]],
      ],
    },
  ];

  const issues = [
    ["overwatering-root-stress", "Overwatering / root stress", "High", ["drooping", "yellow-leaves", "yellow-lower-leaves", "wet-soil", "sour-smell", "mushy-roots", "leaf-drop"], "Roots are likely short on oxygen because the mix is staying wet too long.", ["Pause watering until the correct soil depth dries.", "Confirm the pot drains freely.", "Inspect roots if the mix smells sour or leaves collapse.", "Repot into a faster-draining mix if mushy roots are present."]],
    ["underwatering-drought-stress", "Underwatering / drought stress", "Medium", ["drooping", "dry-soil", "brown-crispy-edges", "leaf-curl", "leaf-drop"], "The plant may be drying past its comfort zone.", ["Water thoroughly until excess drains out.", "Rehydrate hydrophobic soil slowly if water runs off.", "Set watering by soil feel and pot weight, not a fixed calendar."]],
    ["nitrogen-deficiency", "Nitrogen deficiency", "Medium", ["yellow-leaves", "yellow-lower-leaves", "slow-growth"], "Older leaves yellowing first with slow growth often points to low nitrogen or depleted mix.", ["Feed with a balanced fertilizer during active growth.", "Avoid feeding a waterlogged plant.", "Refresh old potting mix when nutrients are exhausted."]],
    ["iron-chlorosis", "Iron chlorosis", "Medium", ["yellow-new-leaves", "green-veins", "slow-growth"], "New leaves yellowing while veins stay green can indicate iron availability problems.", ["Check watering and drainage first.", "Use fertilizer with micronutrients.", "Reduce hard-water or salt buildup when possible."]],
    ["magnesium-deficiency", "Magnesium deficiency", "Medium", ["yellow-leaves", "green-veins", "brown-spots", "yellow-lower-leaves"], "Interveinal yellowing on older leaves with spots can suggest magnesium deficiency or nutrient lockout.", ["Correct watering before feeding.", "Use a complete fertilizer with secondary nutrients.", "Flush heavy salt buildup if present."]],
    ["potassium-deficiency", "Potassium deficiency", "Medium", ["brown-crispy-edges", "yellow-lower-leaves", "brown-spots", "slow-growth"], "Older leaves with yellowing, brown edges, or spots can point to potassium deficiency or exhausted soil.", ["Feed with a balanced fertilizer.", "Remove badly damaged leaves after new growth improves.", "Check for root stress, which can mimic deficiency."]],
    ["low-light-stress", "Low light stress", "Low", ["low-light", "stretched-growth", "slow-growth", "yellow-leaves", "leaf-drop"], "Weak stretched growth, pale leaves, and slow growth often mean the plant needs more usable light.", ["Move gradually toward brighter indirect light.", "Use a grow light in dark rooms.", "Rotate the plant weekly for even growth."]],
    ["sun-scorch", "Sun scorch", "Medium", ["direct-sun", "brown-spots", "brown-crispy-edges", "yellow-leaves"], "Hot direct sun can burn leaf tissue into brown, tan, or bleached patches.", ["Move out of harsh afternoon sun.", "Use a sheer curtain for bright indirect light.", "Leave partly functional leaves until replacements grow."]],
    ["rootbound", "Rootbound plant", "Medium", ["roots-circling", "dries-fast", "drooping", "slow-growth", "yellow-leaves"], "A root-packed pot can dry too fast and limit nutrients.", ["Move up one pot size.", "Loosen circling roots gently.", "Water thoroughly after repotting and keep conditions stable."]],
    ["fertilizer-burn-salt-buildup", "Fertilizer burn / salt buildup", "Medium", ["brown-tips", "soil-crust", "recent-fertilizer", "yellow-leaves"], "Brown tips plus crusty soil or recent feeding can indicate excess salts.", ["Flush the soil if the pot drains well.", "Pause fertilizer until growth resumes.", "Resume at half strength."]],
    ["spider-mites", "Spider mites", "High", ["webbing", "stippled-leaves", "leaf-curl", "hot-dry-air"], "Fine webbing and pale speckled leaves are classic spider mite clues.", ["Isolate the plant.", "Rinse leaf undersides.", "Treat repeatedly with insecticidal soap or a plant-safe mite control."]],
    ["fungus-gnats", "Fungus gnats", "Low", ["gnats", "wet-soil"], "Tiny gnats around damp soil usually breed in wet potting mix.", ["Dry the top layer more between waterings.", "Use sticky traps for adults.", "Use BTI or beneficial nematodes for larvae."]],
    ["powdery-mildew", "Powdery mildew", "Medium", ["white-powder", "poor-airflow", "humid-air"], "White powdery patches with humidity and poor airflow suggest powdery mildew.", ["Improve airflow.", "Avoid wetting leaves late in the day.", "Remove badly affected leaves and treat if needed."]],
    ["leaf-spot-disease", "Leaf spot disease", "Medium", ["black-spots", "brown-spots", "yellow-leaves", "wet-leaves", "poor-airflow"], "Dark or brown spots with wet leaves and poor airflow can indicate fungal or bacterial leaf spot.", ["Remove badly spotted leaves.", "Keep foliage dry when watering.", "Increase airflow and avoid crowding."]],
    ["cold-damage", "Cold damage", "Medium", ["cold-draft", "leaf-drop", "black-spots", "drooping"], "Cold drafts can cause sudden drooping, dark damage, or leaf drop.", ["Move away from drafty doors or windows.", "Keep tropical plants above their minimum temperature.", "Wait before pruning until damage is clear."]],
    ["heat-stress", "Heat stress", "Medium", ["hot-dry-air", "drooping", "brown-crispy-edges", "leaf-curl"], "Hot dry air can make leaves curl, droop, and crisp.", ["Move away from heat vents.", "Water based on soil dryness.", "Raise humidity for tropical plants."]],
    ["transplant-shock", "Transplant shock", "Low", ["recently-repotted", "drooping", "leaf-drop", "yellow-leaves"], "A recently repotted plant may droop or shed leaves while roots adjust.", ["Keep light bright but indirect.", "Avoid fertilizing immediately.", "Keep watering steady and avoid overcorrecting."]],
    ["chewing-pests", "Chewing pests", "Medium", ["holes-chewed", "visible-pests"], "Visible pests plus holes or ragged edges point to chewing insects.", ["Inspect leaf undersides and stems.", "Remove pests manually when possible.", "Treat based on the pest you identify."]],
    ["sap-sucking-pests", "Sap-sucking pests", "High", ["sticky-residue", "yellow-leaves", "visible-pests", "leaf-curl"], "Sticky residue with yellowing or curling often points to aphids, scale, mealybugs, or similar pests.", ["Isolate the plant.", "Inspect stems, nodes, and leaf undersides.", "Remove visible pests and treat repeatedly."]],
  ];

  const symptoms = {};
  const symptomDir = path.join(publicDir, "assets", "images", "ailments");
  ensureDir(symptomDir);
  for (const group of groups) {
    group.symptoms = group.symptoms.map(([id, label, keywords]) => {
      const image = `/assets/images/ailments/${id}.svg`;
      const symptom = { id, label, keywords, image };
      symptoms[id] = symptom;
      fs.writeFileSync(path.join(symptomDir, `${id}.svg`), generateAilmentSvg(symptom));
      return symptom;
    });
  }

  return {
    version: "at-home-grower-diagnoser-v2",
    generatedAt: new Date().toISOString(),
    symptomGroups: groups,
    symptoms,
    issues: issues.map(([id, title, severity, matchTags, summary, nextSteps]) => ({
      id,
      title,
      severity,
      matchTags,
      summary,
      nextSteps,
    })),
  };
}

function libraryPage(plants) {
  const featured = plants.slice(0, 12);
  const counts = Object.fromEntries(Object.keys(categoryMeta).map((key) => [key, plants.filter((plant) => plant.plantTypeCategory === key).length]));
  return pageShell({
    title: "Plant Library | AtHomeGrower.com",
    description: "Search hundreds of plant profiles by plant type, pet status, light, water, soil, and care level.",
    current: "plant-library",
    body: `<section class="page-hero library-hero">
  <span class="eyebrow">Plant knowledge base</span>
  <h1>Hundreds of plants, one clean library.</h1>
  <p class="lede">Pet-friendly plants, toxic houseplants, herbs, vegetables, fruits, and cover crops with care cards and full profiles.</p>
</section>
<section class="section">
  <div class="stat-strip">
    <div><strong>${plants.length}</strong><span>Total profiles</span></div>
    ${Object.entries(counts).map(([key, count]) => `<div><strong>${count}</strong><span>${html(categoryMeta[key].label)}</span></div>`).join("")}
  </div>
</section>
<section class="section" data-plant-library>
  <div class="section-header">
    <div><h2>Search the library</h2><p>Filter by plant type, pet note, light, water, soil, and care level.</p></div>
    <input class="search-box" data-plant-search type="search" placeholder="Search basil, pothos, yellow tips..." aria-label="Search plant library">
  </div>
  <div class="filter-panel" data-plant-filters></div>
  <div class="result-meta" data-result-meta></div>
  <div class="plant-grid" data-plant-results>
    ${featured.map(plantCardStatic).join("")}
  </div>
</section>`,
  });
}

function fillSpacePage() {
  return pageShell({
    title: "Fill Your Space Plant Finder | AtHomeGrower.com",
    description: "Match plants to indoor, outdoor, pet-aware, light, water, soil, and care requirements.",
    current: "fill-your-space",
    body: `<section class="page-hero">
  <span class="eyebrow">Fill Your Space</span>
  <h1>Find plants that fit the room, shelf, bed, or patio.</h1>
  <p class="lede">Search across pet-friendly plants, toxic display plants, herbs, vegetables, fruits, and cover crops with the same tagging system.</p>
</section>
<section class="section split-tool" data-fill-space>
  <div class="tool-main">
    <div class="section-header">
      <div><h2>Plant matcher</h2><p>Use tags and search together for tighter matches.</p></div>
      <input class="search-box" data-plant-search type="search" placeholder="Search bright, pet, tomato, cover..." aria-label="Search Fill Your Space plants">
    </div>
    <div class="filter-panel" data-plant-filters></div>
    <div class="result-meta" data-result-meta></div>
    <div class="plant-grid" data-plant-results></div>
  </div>
  <aside class="tool-side">
    <div class="sticky-panel">
      <h2>Space profile</h2>
      <div data-space-summary></div>
    </div>
  </aside>
</section>`,
  });
}

function diagnoserPage() {
  return pageShell({
    title: "Plant Diagnoser | AtHomeGrower.com",
    description: "Search and select plant symptoms, view example images, and get likely causes with organic-first cures.",
    current: "plant-diagnoser",
    body: `<section class="page-hero">
  <span class="eyebrow">Plant diagnoser</span>
  <h1>Build a symptom pattern, then narrow the cause.</h1>
  <p class="lede">Search ailment terms like yellowing, brown tips, spots, webbing, sticky leaves, gnats, wet soil, and leggy growth.</p>
</section>
<section class="section diagnoser-layout" data-diagnoser>
  <div class="diagnoser-main">
    <div class="section-header">
      <div><h2>Ailment terms</h2><p>Each term includes a quick example image.</p></div>
      <input class="search-box" data-symptom-search type="search" placeholder="Search yellowing, tips, spots..." aria-label="Search ailment terms">
    </div>
    <div data-symptom-groups></div>
  </div>
  <aside class="diagnosis-panel" data-diagnosis-panel>
    <h2>Diagnosis</h2>
    <p>Select symptoms to see likely causes and cures.</p>
  </aside>
</section>`,
  });
}

function searchPage() {
  return pageShell({
    title: "Search Plants | AtHomeGrower.com",
    description: "Search every AtHomeGrower plant profile and open matching care pages.",
    current: "search",
    body: `<section class="page-hero">
  <span class="eyebrow">Search</span>
  <h1>Search any plant.</h1>
  <p class="lede">Find care cards and open the full plant profile.</p>
</section>
<section class="section" data-site-search>
  <div class="section-header">
    <div><h2>Plant search</h2><p>Search name, botanical name, light, water, soil, pet note, and category.</p></div>
    <input class="search-box" data-site-search-input type="search" placeholder="Search plants..." aria-label="Search plants">
  </div>
  <div class="result-meta" data-result-meta></div>
  <div class="plant-grid" data-site-search-results></div>
</section>`,
  });
}

function toolsPage() {
  return pageShell({
    title: "Garden tools and planners | AtHomeGrower.com",
    description: "Interactive tools for plant matching, diagnosis, care lookup, and plant search.",
    current: "tools",
    body: `<section class="page-hero">
  <span class="eyebrow">Tool hub</span>
  <h1>Useful tools, not dead-end cards.</h1>
  <p class="lede">Open the plant finder, diagnoser, library search, and core care reference pages from one place.</p>
</section>
<section class="section">
  <div class="grid three">
    ${[
      ["Fill Your Space", "/fill-your-space.html", "Match plants to light, pet needs, care level, water habits, soil, and indoor/outdoor placement.", "Must-have"],
      ["Plant Diagnoser", "/plant-diagnoser.html", "Select multiple ailment terms and get likely causes with cure steps.", "Must-have"],
      ["Plant Library", "/plant-library.html", "Search all plant profiles and open care detail pages.", "Must-have"],
      ["Search Any Plant", "/search.html", "Quickly find profiles across the whole plant database.", "Must-have"],
      ["Pest ID", "/pests.html", "Identify common pests and open organic-first response plans.", "Should-have"],
      ["Deficiencies", "/deficiencies.html", "Compare deficiency symptoms and avoid guessing from one leaf alone.", "Should-have"],
      ["Diseases", "/diseases.html", "Review fungal, bacterial, and root disease symptoms.", "Should-have"],
      ["Organic Additives", "/organic-additives.html", "Use compost, castings, neem, soap, BTI, gypsum, kelp, and more with context.", "Should-have"],
      ["Seasonal Checklists", "/seasonal-checklists.html", "Care timing for indoor plants, patios, raised beds, and outdoor gardens.", "Should-have"],
    ].map(([title, href, text, status]) => `<article class="card tool-card"><div class="card-body">
      <span class="status-chip ${status === "Must-have" ? "must" : "should"}">${status}</span>
      <h3>${title}</h3>
      <p>${text}</p>
      <a class="button secondary" href="${href}">Open</a>
    </div></article>`).join("")}
  </div>
</section>`,
  });
}

function homePage(plants) {
  return pageShell({
    title: "AtHomeGrower.com | Complete Home Gardening Knowledge Base",
    description: "A complete home plant care website with searchable plant profiles, Fill Your Space, plant diagnosis, pests, diseases, deficiencies, tools, and trust pages.",
    current: "home",
    body: `<section class="hero">
  <div>
    <span class="eyebrow">${plants.length}+ plant profiles</span>
    <h1>Plant care that works at home.</h1>
    <p class="lede">A searchable plant library, Fill Your Space matcher, symptom diagnoser, pest and disease guides, organic additives, and seasonal care references in one Cloudflare-ready site.</p>
    <div class="actions">
      <a class="button" href="/fill-your-space.html">Find plants</a>
      <a class="button secondary" href="/plant-diagnoser.html">Diagnose a plant</a>
    </div>
  </div>
  <div class="hero-card">
    <img src="/assets/img/hero-garden.svg" alt="Illustrated indoor and outdoor growing space">
  </div>
</section>
<section class="section">
  <div class="section-header">
    <div><h2>Core plant tools</h2><p>The main tools are wired to the same plant database and detail pages.</p></div>
  </div>
  <div class="grid three">
    <article class="card"><div class="card-body"><span class="status-chip must">Live tool</span><h3>Fill Your Space</h3><p>Filter the full plant database by room, garden use, pet note, light, care, water, and soil.</p><a class="text-link" href="/fill-your-space.html">Open finder</a></div></article>
    <article class="card"><div class="card-body"><span class="status-chip must">Live tool</span><h3>Plant Diagnoser</h3><p>Pick multiple symptoms and get ranked causes with practical cure steps.</p><a class="text-link" href="/plant-diagnoser.html">Open diagnoser</a></div></article>
    <article class="card"><div class="card-body"><span class="status-chip must">Live library</span><h3>Plant Library</h3><p>Open care, soil, watering, light, pest, and placement profiles for every plant.</p><a class="text-link" href="/plant-library.html">Open library</a></div></article>
  </div>
</section>
<section class="section">
  <div class="callout">
    <div>
      <h2>Pet notes and diagnosis are guidance, not emergency advice.</h2>
      <p>For poison exposure, severe plant decline, food safety, or uncertain identification, verify with a veterinarian, poison-control source, local extension office, or qualified professional.</p>
    </div>
    <a class="button" href="/about/editorial-policy.html">Trust policy</a>
  </div>
</section>`,
  });
}

function writeSitemap(plants) {
  const urls = [];
  const staticPages = fs.readdirSync(publicDir)
    .filter((file) => file.endsWith(".html"))
    .map((file) => `/${file}`);
  urls.push(...staticPages);
  urls.push(...plants.map((plant) => plant.factsUrl));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(new Set(urls)).sort().map((url) => `  <url><loc>https://athomegrower.com${url}</loc></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);
}

function main() {
  ensureDir(path.join(publicDir, "data"));
  ensureDir(path.join(publicDir, "assets", "images"));
  ensureDir(path.join(publicDir, "plants"));
  for (const [from, folder] of imageSources) {
    copyDir(from, path.join(publicDir, "assets", "images", folder));
  }

  const plantMap = new Map();
  const fillMaster = readJson(sources.fillMaster, { plants: [] });
  const diagnoserMaster = readJson(sources.diagnoserMaster, { plants: [] });
  const searchIndex = readJson(sources.searchIndex, { plants: [] });
  const vegetables = readJson(sources.vegetables, []);
  const fruits = readJson(sources.fruits, []);
  const coverCrops = readJson(sources.coverCrops, { crops: [] });

  for (const plant of supplementalPlants || []) addPlant(plantMap, plant);
  for (const plant of fillMaster.plants || []) addPlant(plantMap, plant);
  for (const plant of diagnoserMaster.plants || []) addPlant(plantMap, plant);
  for (const plant of vegetables || []) addPlant(plantMap, plant, "vegetables");
  for (const plant of fruits || []) addPlant(plantMap, plant, "fruits");
  for (const plant of searchIndex.plants || []) addPlant(plantMap, { ...plant, __detail: parseSearchDetails(plant) });
  for (const plant of coverCrops.crops || []) addPlant(plantMap, plant, "cover-crops");

  const plants = Array.from(plantMap.values())
    .filter((plant) => categoryMeta[plant.plantTypeCategory])
    .sort((a, b) => {
      const cat = Object.keys(categoryMeta).indexOf(a.plantTypeCategory) - Object.keys(categoryMeta).indexOf(b.plantTypeCategory);
      return cat || a.name.localeCompare(b.name);
    });

  const seenPages = new Map();
  for (const plant of plants) {
    let pageSlug = plant.slug;
    if (seenPages.has(pageSlug)) pageSlug = `${plant.slug}-${plant.plantTypeCategory}`;
    plant.pageSlug = pageSlug;
    plant.factsUrl = `/plants/${pageSlug}.html`;
    seenPages.set(pageSlug, true);
  }

  for (const plant of plants) {
    plant.image = ensurePlantImage(plant);
  }

  const ailments = buildAilments();
  const counts = Object.fromEntries(Object.keys(categoryMeta).map((key) => [key, plants.filter((plant) => plant.plantTypeCategory === key).length]));
  fs.writeFileSync(path.join(publicDir, "data", "plant-library-expanded.json"), JSON.stringify({
    version: "elite-plant-library-v1",
    generatedAt: new Date().toISOString(),
    counts: { total: plants.length, ...counts },
    categories: categoryMeta,
    plants,
  }, null, 2));
  fs.writeFileSync(path.join(publicDir, "data", "ailment-diagnosis.json"), JSON.stringify(ailments, null, 2));

  writePlantPages(plants);
  fs.writeFileSync(path.join(publicDir, "plant-library.html"), libraryPage(plants));
  fs.writeFileSync(path.join(publicDir, "fill-your-space.html"), fillSpacePage());
  fs.writeFileSync(path.join(publicDir, "plant-diagnoser.html"), diagnoserPage());
  fs.writeFileSync(path.join(publicDir, "search.html"), searchPage());
  fs.writeFileSync(path.join(publicDir, "tools.html"), toolsPage());
  fs.writeFileSync(path.join(publicDir, "index.html"), homePage(plants));
  writeSitemap(plants);

  console.log(JSON.stringify({ plants: plants.length, counts, ailmentTerms: Object.keys(ailments.symptoms).length, plantPages: plants.length }, null, 2));
}

main();
