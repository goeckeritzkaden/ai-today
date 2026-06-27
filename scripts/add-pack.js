import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const fileFlagIndex = args.indexOf("--file");

if (fileFlagIndex === -1 || !args[fileFlagIndex + 1]) {
  exitWithUsage();
}

const inputPath = path.resolve(args[fileFlagIndex + 1]);
const pack = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const article = normalizePack(pack);
const articlesDir = path.join(root, "articles");
const articlePath = path.join(articlesDir, `${article.slug}.json`);
const indexPath = path.join(articlesDir, "index.json");

fs.mkdirSync(articlesDir, { recursive: true });
fs.writeFileSync(articlePath, `${JSON.stringify(article, null, 2)}\n`);

const index = readIndex(indexPath)
  .filter((item) => item.slug !== article.slug)
  .concat({
    slug: article.slug,
    date: article.date,
    title: article.title,
    summary: article.summary
  })
  .sort((a, b) => b.date.localeCompare(a.date));

fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Published ${article.title} to articles/${article.slug}.json`);

function normalizePack(packData) {
  const date = required(packData.date, "date");
  const title = required(packData.title, "title");
  const summary = required(packData.summary, "summary");
  const bodyMarkdown = required(packData.bodyMarkdown, "bodyMarkdown");
  const slug = packData.slug || `${date}-${slugify(title)}`;

  return {
    slug,
    date,
    title,
    summary,
    author: packData.author || "AI Today",
    bodyMarkdown,
    caption: packData.caption || "",
    canvaUrl: packData.canvaUrl || "",
    sources: Array.isArray(packData.sources) ? packData.sources : []
  };
}

function readIndex(indexFile) {
  if (!fs.existsSync(indexFile)) return [];
  return JSON.parse(fs.readFileSync(indexFile, "utf8"));
}

function required(value, name) {
  if (!value) {
    throw new Error(`Missing required field: ${name}`);
  }
  return value;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function exitWithUsage() {
  console.error("Usage: node scripts/add-pack.js --file path/to/pack.json");
  process.exit(1);
}
