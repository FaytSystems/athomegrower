const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const publicDir = path.resolve(__dirname, "..", "public");
const fix = process.argv.includes("--fix");
const plants = JSON.parse(fs.readFileSync(path.join(publicDir, "data", "plant-library-expanded.json"), "utf8")).plants;

// Exercise the actual browser functions without running page initialization.
const appSource = fs.readFileSync(path.join(publicDir, "assets", "app.js"), "utf8");
assert.ok(appSource.includes("  init();"), "Browser initialization hook should exist");
const browser = {};
vm.runInNewContext(appSource.replace("  init();", "  globalThis.petChecks = { petStatusKey, petLabel, petTagKind, plantFacet };"), browser);
const { petStatusKey, petLabel, petTagKind, plantFacet } = browser.petChecks;

function sourceFunction(source, name) {
  const match = source.match(new RegExp(`^function ${name}\\([^]*?^}`, "m"));
  assert.ok(match, `Missing ${name} function`);
  return match[0];
}

// The two generators must use the same negative-first rules as the browser.
const generatorSets = [
  [path.join(__dirname, "build-elite-plant-site.js"), "slugify"],
  [path.join(__dirname, "refresh-static-card-tags.js"), "slug"],
].map(([file, slugName]) => {
  const source = fs.readFileSync(file, "utf8");
  const context = {};
  const names = slugName === "slugify" ? ["cleanText", slugName, "petStatusKey", "petLabel", "petTagKind"] : [slugName, "petStatusKey", "petLabel", "petTagKind"];
  vm.runInNewContext(names.map(name => sourceFunction(source, name)).join("\n"), context);
  return context;
});

for (const api of [browser.petChecks, ...generatorSets]) {
  assert.equal(api.petStatusKey("not-pet-friendly"), "toxic");
  assert.equal(api.petLabel("not-pet-friendly"), "Toxic / keep away");
  assert.equal(api.petTagKind("not-pet-friendly"), "toxic");
  assert.equal(api.petStatusKey("toxic"), "toxic");
  assert.equal(api.petLabel("pet-friendly"), "Pet-friendly");
  assert.equal(api.petTagKind("pet-friendly"), "pet-safe");
  assert.equal(api.petStatusKey("check-before-use"), "check-before-use");
  assert.equal(api.petLabel("check-before-use"), "Check pets");
  assert.equal(api.petStatusKey("pet-friendly", "toxic"), "toxic", "Toxic category must override a positive status");
  assert.equal(api.petTagKind("pet-friendly", "toxic"), "toxic");
  assert.equal(api.petStatusKey("not-pet-safe", "pet-friendly"), "toxic");
  assert.equal(api.petStatusKey("unknown"), "check-before-use");
}
for (const status of ["not-pet-friendly", "toxic", "pet-friendly", "check-before-use"]) {
  assert.equal(plantFacet({ petStatus: status, plantTypeCategory: "plants" }, "pet"), petStatusKey(status));
}
assert.equal(plantFacet({ petStatus: "pet-friendly", plantTypeCategory: "toxic" }, "pet"), "toxic");

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}
const byUrl = new Map(plants.flatMap(plant => [
  [plant.factsUrl, plant],
  [plant.factsUrl.replace(/\.html$/, ""), plant],
]));
const byPage = new Map(plants.map(plant => [`${plant.pageSlug}.html`, plant]));
let changedFiles = 0;
let changedCards = 0;
let correctedFacts = 0;
const mismatches = [];

for (const file of htmlFiles(publicDir)) {
  const original = fs.readFileSync(file, "utf8");
  const headBefore = original.match(/<head>[\s\S]*?<\/head>/i)?.[0];
  let next = original;
  if (path.basename(path.dirname(file)) === "plants") {
    const plant = byPage.get(path.basename(file));
    if (plant) next = next.replace(/<div><span>Pet status<\/span><strong>[^<]*<\/strong><\/div>/, current => {
      const replacement = `<div><span>Pet status</span><strong>${petLabel(plant.petStatus, plant.plantTypeCategory)}</strong></div>`;
      if (replacement !== current) correctedFacts++;
      return replacement;
    });
  }
  next = next.replace(/<article class="plant-card"[\s\S]*?<\/article>/g, article => {
    const href = article.match(/<h3><a href="([^"]+)"/)?.[1];
    const plant = byUrl.get(href);
    if (!plant) return article;
    const label = petLabel(plant.petStatus, plant.plantTypeCategory);
    const tag = petTagKind(plant.petStatus, plant.plantTypeCategory);
    const replacement = article
      .replace(/<span class="card-tag (?:pet-safe|toxic|pet-check)">[^<]*<\/span>/, `<span class="card-tag ${tag}">${label}</span>`)
      .replace(/<div><dt>Pet note<\/dt><dd>[^<]*<\/dd><\/div>/, `<div><dt>Pet note</dt><dd>${label}</dd></div>`);
    if (replacement !== article) changedCards++;
    return replacement;
  });
  assert.equal(next.match(/<head>[\s\S]*?<\/head>/i)?.[0], headBefore, `Pet repair must preserve the head: ${file}`);
  if (next !== original) {
    changedFiles++;
    if (fix) fs.writeFileSync(file, next);
    else mismatches.push(path.relative(publicDir, file));
  }
}

for (const plant of plants) {
  if (plant.plantTypeCategory === "toxic") {
    assert.equal(petStatusKey(plant.petStatus, plant.plantTypeCategory), "toxic");
    const page = fs.readFileSync(path.join(publicDir, "plants", `${plant.pageSlug}.html`), "utf8");
    if (fix || mismatches.length === 0) assert.ok(page.includes('<div><span>Pet status</span><strong>Toxic / keep away</strong></div>'), `Incorrect toxic facts strip: ${plant.pageSlug}`);
  }
}
console.log(JSON.stringify({
  mode: fix ? "fix" : "check",
  negativeStatusProfilesChecked: plants.filter(plant => plant.petStatus === "not-pet-friendly").length,
  toxicProfilesChecked: plants.filter(plant => plant.plantTypeCategory === "toxic").length,
  changedFiles, changedCards, correctedFacts,
  remainingMismatchFiles: mismatches.slice(0, 20),
  browserAndGeneratorRegressionChecks: "passed",
}, null, 2));
if (mismatches.length) process.exitCode = 1;
