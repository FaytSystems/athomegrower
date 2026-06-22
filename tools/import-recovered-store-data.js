const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const sources = [
  {
    id: "seeds",
    label: "Seeds",
    title: "Seed Store Picks",
    eyebrow: "Seed section",
    description: "Heirloom vegetable seed kits, culinary seed mixes, survival-style garden packs, and seed vault options for raised beds, patios, and backyard food gardens.",
    ctaLabel: "Check planting calendar",
    ctaHref: "/tools.html",
    file: "C:/Users/UrsaMajor/Downloads/athomegrower_cloudflare_site_SEED_STORE_AFFILIATE_SECTION/athomegrower_cloudflare_site/public/store/seeds.html",
  },
  {
    id: "tools",
    label: "Tools",
    title: "Tool Store Picks",
    eyebrow: "Tool section",
    description: "Planting, pruning, trimming, weeding, cultivating, carrying supplies, and making garden work more comfortable.",
    ctaLabel: "Open tools guide",
    ctaHref: "/tools.html",
    file: "C:/Users/UrsaMajor/Downloads/athomegrower_cloudflare_site_TOOL_STORE_AFFILIATE_SECTION/athomegrower_cloudflare_site/public/store/tools.html",
  },
  {
    id: "seed-starting",
    label: "Seed Starting",
    title: "Seed Starting Store Picks",
    eyebrow: "Seed starting section",
    description: "Trays, starter cells, seed-starting mix, labels, humidity domes, and beginner supplies for stronger starts.",
    ctaLabel: "Open beginner guide",
    ctaHref: "/how-to.html",
    file: "C:/Users/UrsaMajor/Downloads/athomegrower_cloudflare_site_SEED_STARTING_SOIL_STORE/athomegrower_cloudflare_site/public/store/seed-starting.html",
  },
  {
    id: "soil-amendments",
    label: "Soil & Amendments",
    title: "Soil and Amendment Store Picks",
    eyebrow: "Soil section",
    description: "Potting mixes, compost, perlite, coco coir, bark, biochar, worm castings, and soil-building amendments.",
    ctaLabel: "Open additives",
    ctaHref: "/organic-additives.html",
    file: "C:/Users/UrsaMajor/Downloads/athomegrower_cloudflare_site_SEED_STARTING_SOIL_STORE/athomegrower_cloudflare_site/public/store/soil-amendments.html",
  },
  {
    id: "organic-fertilizers",
    label: "Organic Fertilizers",
    title: "Organic Fertilizers & Inputs",
    eyebrow: "Organic fertilizer store",
    description: "Liquid plant foods, fish fertilizers, dry organic fertilizers, vegetable plant foods, neem meal, root-zone support, and container growing inputs.",
    ctaLabel: "Open deficiency guide",
    ctaHref: "/deficiencies.html",
    file: "C:/Users/UrsaMajor/Downloads/athomegrower_cloudflare_site_ORGANIC_FERTILIZER_STORE/athomegrower_cloudflare_site/public/store/organic-fertilizers.html",
  },
  {
    id: "organic-pest-control",
    label: "Organic Pest Control",
    title: "Organic Pest Control Store Picks",
    eyebrow: "Pest control section",
    description: "Sticky traps, soap, oils, BTI, sprayers, pest inspection supplies, and organic-first control tools.",
    ctaLabel: "Open pest guide",
    ctaHref: "/pests.html",
    file: "C:/Users/UrsaMajor/Downloads/athomegrower_cloudflare_site_ORGANIC_PEST_CONTROL_STORE/athomegrower_cloudflare_site/public/store/organic-pest-control.html",
  },
  {
    id: "watering-irrigation",
    label: "Watering & Irrigation",
    title: "Watering and Irrigation Store Picks",
    eyebrow: "Watering section",
    description: "Watering cans, nozzles, sprayers, moisture tools, drip parts, and practical irrigation helpers.",
    ctaLabel: "Open Fill Your Space",
    ctaHref: "/fill-your-space.html",
    file: "C:/Users/UrsaMajor/Downloads/athomegrower_cloudflare_site_WATERING_IRRIGATION_STORE/athomegrower_cloudflare_site/public/store/watering-irrigation.html",
  },
];

function cleanText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;|\u2019|â€™/g, "'")
    .replace(/&lsquo;|\u2018/g, "'")
    .replace(/&ldquo;|&rdquo;|\u201c|\u201d/g, '"')
    .replace(/&mdash;|&ndash;|\u2014|\u2013|â€”|â€“/g, "-")
    .replace(/â†’/g, "->")
    .replace(/<[^>]+>/g, "")
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function field(card, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = card.match(new RegExp(`<strong>${escaped}:<\\/strong>([\\s\\S]*?)<\\/p>`, "i"));
  return cleanText(match ? match[1] : "");
}

function extractProducts(source) {
  if (!fs.existsSync(source.file)) {
    throw new Error(`Missing recovered store file: ${source.file}`);
  }
  const html = fs.readFileSync(source.file, "utf8");
  const cards = [...html.matchAll(/<article class="card product-card"[\s\S]*?<\/article>/g)].map((match) => match[0]);
  return cards.map((card, index) => {
    const href = cleanText((card.match(/href="([^"]+)" target="_blank"/) || [])[1] || "");
    return {
      id: `${source.id}-${index + 1}`,
      categoryId: source.id,
      kicker: cleanText((card.match(/<span class="card-kicker">([\s\S]*?)<\/span>/) || [])[1] || ""),
      name: cleanText((card.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || ""),
      bestFor: field(card, "Best for"),
      whyItFits: field(card, "Why it fits"),
      caution: field(card, "Before buying"),
      affiliateUrl: href,
      merchant: href.includes("amazon.com") ? "Amazon" : "External merchant",
    };
  }).filter((item) => item.name && item.affiliateUrl);
}

function main() {
  const categories = sources.map((source) => {
    const products = extractProducts(source);
    return {
      id: source.id,
      label: source.label,
      title: source.title,
      eyebrow: source.eyebrow,
      description: source.description,
      ctaLabel: source.ctaLabel,
      ctaHref: source.ctaHref,
      pageUrl: `/store/${source.id}.html`,
      products,
    };
  });
  const payload = {
    version: "recovered-affiliate-store-v1",
    generatedAt: new Date().toISOString(),
    disclosure: "As an Amazon Associate, AtHomeGrower may earn from qualifying purchases. Product price, availability, ratings, seller, shipping, and details can change.",
    categories,
  };
  fs.mkdirSync(path.join(publicDir, "data"), { recursive: true });
  fs.writeFileSync(path.join(publicDir, "data", "store-products.json"), JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({
    categories: categories.length,
    products: categories.reduce((total, category) => total + category.products.length, 0),
    byCategory: Object.fromEntries(categories.map((category) => [category.id, category.products.length])),
  }, null, 2));
}

main();
