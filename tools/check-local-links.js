const fs = require("fs");
const path = require("path");

const publicDir = path.resolve(__dirname, "..", "public");
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(filePath);
  }
}

walk(publicDir);

const missing = [];
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, "utf8");
  const attrPattern = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = attrPattern.exec(text))) {
    let url = match[1];
    if (
      !url ||
      url.startsWith("http") ||
      url.startsWith("mailto:") ||
      url.startsWith("#") ||
      url.startsWith("data:")
    ) {
      continue;
    }

    url = url.split("#")[0].split("?")[0];
    if (!url || url === "/") url = "/index.html";
    if (url.endsWith("/")) url += "index.html";

    const filePath = path.join(publicDir, ...url.replace(/^\//, "").split("/"));
    if (!fs.existsSync(filePath)) {
      missing.push({ file: path.relative(publicDir, file), url });
    }
  }
}

console.log(JSON.stringify({
  htmlFiles: htmlFiles.length,
  missingCount: missing.length,
  missing: missing.slice(0, 100),
}, null, 2));

if (missing.length) process.exitCode = 1;
