const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const dataFile = path.join(publicDir, "data", "plant-library-expanded.json");

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function html(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function petStatusKey(status, category = "") {
  const key = slug(status);
  if (slug(category) === "toxic" || ["toxic", "toxic-keep-away", "not-pet-friendly", "not-pet-safe"].includes(key)) return "toxic";
  if (["pet-friendly", "pet-safe"].includes(key)) return "pet-friendly";
  return "check-before-use";
}

function petLabel(status, category = "") {
  const key = petStatusKey(status, category);
  if (key === "toxic") return "Toxic / keep away";
  if (key === "pet-friendly") return "Pet-friendly";
  return "Check pets";
}

function petTagKind(status, category = "") {
  const key = petStatusKey(status, category);
  if (key === "toxic") return "toxic";
  if (key === "pet-friendly") return "pet-safe";
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
    { kind: petTagKind(plant.petStatus, plant.plantTypeCategory), label: petLabel(plant.petStatus, plant.plantTypeCategory) },
    { kind: "light", label: lightTagLabel(plant.lightText) },
    { kind: "difficulty", label: careTagLabel(plant.careLevel) },
  ]
    .map((tag) => `<span class="card-tag ${html(tag.kind)}">${html(tag.label)}</span>`)
    .join("");
}

function htmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(fullPath));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

const plants = JSON.parse(fs.readFileSync(dataFile, "utf8")).plants || [];
const byUrl = new Map(plants.map((plant) => [plant.factsUrl, plant]));
let changedFiles = 0;
let changedCards = 0;

for (const file of htmlFiles(publicDir)) {
  const original = fs.readFileSync(file, "utf8");
  const next = original.replace(/<article class="plant-card"[\s\S]*?<\/article>/g, (article) => {
    const href = article.match(/<h3><a href="([^"]+)"/)?.[1] || article.match(/class="plant-card-media" href="([^"]+)"/)?.[1];
    const plant = byUrl.get(href);
    if (!plant) return article;
    const row = `<div class="card-tags">${cardTags(plant)}</div>`;
    const replaced = article.replace(/<div class="(?:pill-row|card-tags)">[\s\S]*?<\/div>/, row);
    if (replaced !== article) changedCards += 1;
    return replaced;
  });
  if (next !== original) {
    fs.writeFileSync(file, next);
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, changedCards }, null, 2));
