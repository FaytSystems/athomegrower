const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const creditsFile = path.join(publicDir, "data", "plant-image-credits.json");

const diagnosticCredits = [
  ["Nitrogen deficiency", "Wikimedia Commons / nitrogen-deficient cabbage image", "https://en.wikipedia.org/wiki/Nitrogen_deficiency"],
  ["Phosphorus deficiency", "Wikimedia Commons / phosphorus deficiency on corn", "https://en.wikipedia.org/wiki/Phosphorus_deficiency"],
  ["Potassium deficiency", "Wikimedia Commons / tomato potassium-deficiency leaf", "https://en.wikipedia.org/wiki/Potassium_deficiency_(plants)"],
  ["Calcium deficiency", "Wikimedia Commons / blossom-end rot image", "https://en.wikipedia.org/wiki/Calcium_deficiency_(plant)"],
  ["Iron deficiency", "Wikimedia Commons / iron chlorosis on lemon", "https://en.wikipedia.org/wiki/Iron_deficiency_(plant_disorder)"],
  ["Magnesium deficiency", "Wikimedia Commons / interveinal chlorosis example", "https://en.wikipedia.org/wiki/Chlorosis"],
  ["Sulfur deficiency", "Wikimedia Commons / chlorosis symptom example", "https://en.wikipedia.org/wiki/Chlorosis"],
  ["Zinc deficiency", "Wikimedia Commons / chlorosis symptom example", "https://en.wikipedia.org/wiki/Chlorosis"],
  ["Boron deficiency", "Wikimedia Commons / fruit disorder reference image", "https://en.wikipedia.org/wiki/Calcium_deficiency_(plant)"],
  ["Manganese deficiency", "Wikimedia Commons / interveinal chlorosis example", "https://en.wikipedia.org/wiki/Chlorosis"],
  ["Aphids", "Wikimedia Commons / aphids on plant stem", "https://en.wikipedia.org/wiki/Aphid"],
  ["Spider mites", "Wikimedia Commons / spider mites on lemon plant", "https://en.wikipedia.org/wiki/Spider_mite"],
  ["Mealybugs", "Wikimedia Commons / mealybugs on hibiscus", "https://en.wikipedia.org/wiki/Mealybug"],
  ["Whiteflies", "Wikimedia Commons / whiteflies on leaf", "https://en.wikipedia.org/wiki/Whitefly"],
  ["Scale insects", "Wikimedia Commons / sap-feeding insect reference image", "https://en.wikipedia.org/wiki/Scale_insect"],
  ["Fungus gnats", "Wikimedia Commons / insect reference image; replace with owned macro photo later", "https://en.wikipedia.org/wiki/Fungus_gnat"],
  ["Thrips", "Reference image placeholder; replace with licensed thrips macro", "https://www.tomsguide.com/home/gardening/this-tiny-pest-causes-the-biggest-damage-to-your-plants-heres-how-to-stop-thrips"],
  ["Slugs and snails", "Outdoor plant damage placeholder; replace with owned slug/snail damage photo", "https://en.wikipedia.org/wiki/Slug"],
];

function html(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return html(value);
}

function readPlantCredits() {
  if (!fs.existsSync(creditsFile)) return [];
  const data = JSON.parse(fs.readFileSync(creditsFile, "utf8"));
  return (data.photos || []).slice().sort((a, b) => {
    const category = String(a.category || "").localeCompare(String(b.category || ""));
    return category || String(a.plantName || "").localeCompare(String(b.plantName || ""));
  });
}

function nav(current = "") {
  const items = [
    ["Home", "/index.html", "home"],
    ["Plant Library", "/plant-library.html", "plant-library"],
    ["Fill Your Space", "/fill-your-space.html", "fill-your-space"],
    ["What's Wrong With My Plant", "/plant-diagnoser.html", "plant-diagnoser"],
    ["Pests", "/pests.html", "pests"],
    ["Diseases", "/diseases.html", "diseases"],
    ["Additives", "/organic-additives.html", "additives"],
    ["How-To", "/how-to.html", "how-to"],
    ["Tools", "/tools.html", "tools"],
    ["Store", "/store.html", "store"],
    ["Advertise", "/advertise.html", "advertise"],
    ["Search", "/search.html", "search"],
  ];
  return `<header class="site-header">
  <nav class="nav" aria-label="Main navigation">
    <a class="brand" href="/index.html" aria-label="AtHomeGrower home">
      <span class="brand-mark">AG</span>
      <span>AtHomeGrower</span>
    </a>
    <div class="nav-links">
      ${items.map(([label, href, key]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("\n      ")}
    </div>
  </nav>
</header>`;
}

function footer() {
  return `<footer class="footer">
  <div class="footer-inner">
    <p>&copy; <span data-current-year></span> AtHomeGrower.com - Indoor/outdoor plant care for real homes.</p>
    <p><a href="/store.html">Store</a> - <a href="/affiliate-disclosure.html">Affiliate disclosure</a> - <a href="/advertise.html">Advertise</a> - <a href="/about/editorial-policy.html">Editorial policy</a> - <a href="/image-credits.html">Image credits</a> - <a href="#top">Back to top</a></p>
  </div>
</footer>`;
}

function plantCreditItem(photo) {
  const source = photo.filePageUrl || photo.sourcePageUrl || photo.originalUrl || "";
  const license = photo.licenseUrl
    ? `<a href="${attr(photo.licenseUrl)}" target="_blank" rel="noopener">${html(photo.licenseShortName || photo.license || "License")}</a>`
    : html(photo.licenseShortName || photo.license || "License recorded");
  const author = photo.author || photo.credit || "Unknown author";
  const title = photo.title || photo.commonsTitle || "Untitled photo";
  return `<div class="credit-item">
    <strong>${html(photo.plantName)}</strong>${photo.botanicalName ? ` <span class="botanical-small">${html(photo.botanicalName)}</span>` : ""}<br>
    "${html(title)}" by ${html(author)}. Source: Wikimedia Commons. License: ${license}.<br>
    <span>${html(photo.modification || "Cropped/resized for card display; no plant-content edits.")}</span>
    ${source ? `<br><a href="${attr(source)}" target="_blank" rel="noopener">Original file page</a>` : ""}
  </div>`;
}

function diagnosticCreditItem([label, credit, url]) {
  return `<div class="credit-item"><strong>${html(label)}</strong><br>Credit: ${html(credit)}<br><a href="${attr(url)}" target="_blank" rel="noopener">Source/reference</a></div>`;
}

function imageCreditsPage() {
  const plantCredits = readPlantCredits();
  const plantSection = plantCredits.length
    ? `<section class="section">
  <div class="section-header">
    <div><h2>Plant photo credits</h2><p>These real plant photos were selected from Wikimedia Commons files that list public-domain, CC0, CC BY, or CC BY-SA reuse terms. Each local copy was cropped/resized into WebP for card display.</p></div>
    <a class="button secondary" href="/photo-sourcing-policy.html">Photo sourcing policy</a>
  </div>
  <div class="credit-list">${plantCredits.map(plantCreditItem).join("")}</div>
</section>`
    : `<section class="section"><div class="notice">No licensed plant-photo credits have been added yet.</div></section>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Image Credits | AtHomeGrower.com</title>
  <meta name="description" content="Image credits, source links, and license notes for AtHomeGrower photos.">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body id="top"><a class="skip-link" href="#main">Skip to content</a>
${nav("image-credits")}
<main id="main"><section class="page-hero">
  <span class="eyebrow">Image credits</span>
  <h1>Photo credits and licenses.</h1>
  <p class="lede">AtHomeGrower uses owned, public-domain, or reuse-licensed images. Citation alone is not permission, so plant photos listed here include source and license metadata.</p>
</section>
${plantSection}
<section class="section">
  <div class="section-header">
    <div><h2>Diagnostic image references</h2><p>These references support deficiency, pest, disease, and symptom cards while the owned macro-photo library grows.</p></div>
  </div>
  <div class="credit-list">${diagnosticCredits.map(diagnosticCreditItem).join("")}</div>
</section></main>
${footer()}
<script src="/assets/app.js"></script>
</body></html>
`;
}

function photoSourcingPolicyPage() {
  const providers = [
    ["Wikimedia Commons", "Used now for local plant-card photos with explicit public-domain, CC0, CC BY, or CC BY-SA metadata.", "https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia"],
    ["Openverse", "Approved as a discovery source only when the item-level license and source page verify commercial reuse and adaptation rights.", "https://api.openverse.org/v1/"],
    ["iNaturalist", "Approved only for individual photos whose license is CC0, CC BY, or CC BY-SA; NonCommercial, NoDerivatives, and all-rights-reserved images are rejected.", "https://api.inaturalist.org/v1/docs/"],
    ["Flickr", "Approved through the Flickr API license metadata when the photo license is public domain, CC0, CC BY, or CC BY-SA.", "https://www.flickr.com/services/api/flickr.photos.licenses.getInfo.html"],
    ["GBIF occurrence media", "Approved only when occurrence/media records provide usable rights metadata and the source page can be credited.", "https://techdocs.gbif.org/en/openapi/v1/occurrence"],
  ];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Photo Sourcing Policy | AtHomeGrower.com</title>
  <meta name="description" content="Legal photo sourcing rules for AtHomeGrower plant images.">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body id="top"><a class="skip-link" href="#main">Skip to content</a>
${nav("image-credits")}
<main id="main"><section class="page-hero">
  <span class="eyebrow">Photo sourcing policy</span>
  <h1>More databases, same legal filter.</h1>
  <p class="lede">AtHomeGrower can use additional photo databases, but citation alone is not permission. Every imported image must pass license, source, attribution, and modification checks before it appears on a plant card.</p>
</section>
<section class="section">
  <div class="grid two">
    <article class="card"><div class="card-body">
      <h2>Accepted</h2>
      <p>Public domain, CC0, CC BY, and CC BY-SA photos with a traceable source page, author/credit where available, license label, license URL when provided, and local modification notes.</p>
    </div></article>
    <article class="card"><div class="card-body">
      <h2>Rejected</h2>
      <p>All-rights-reserved, fair-use-only, unclear-license, NonCommercial, NoDerivatives, missing-source, social-media repost, and marketplace product images unless a separate approved API or written license permits use.</p>
    </div></article>
  </div>
</section>
<section class="section">
  <div class="section-header"><div><h2>Approved source paths</h2><p>These are allowed as provider pipelines only when each individual image passes the accepted-license rule.</p></div></div>
  <div class="credit-list">
    ${providers.map(([name, note, url]) => `<div class="credit-item"><strong>${html(name)}</strong><br>${html(note)}<br><a href="${attr(url)}" target="_blank" rel="noopener">Provider documentation</a></div>`).join("")}
  </div>
</section></main>
${footer()}
<script src="/assets/app.js"></script>
</body></html>
`;
}

function writeImageCreditsPage() {
  fs.writeFileSync(path.join(publicDir, "image-credits.html"), imageCreditsPage());
  fs.writeFileSync(path.join(publicDir, "photo-sourcing-policy.html"), photoSourcingPolicyPage());
}

if (require.main === module) {
  writeImageCreditsPage();
  console.log(JSON.stringify({ plantCredits: readPlantCredits().length, output: "public/image-credits.html" }, null, 2));
}

module.exports = { writeImageCreditsPage, imageCreditsPage, photoSourcingPolicyPage };
