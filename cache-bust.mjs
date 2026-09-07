import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";

async function getHash(filePath) {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex").slice(0, 12);
}

const [stylesHash, scriptHash] = await Promise.all([
  getHash("styles.css"),
  getHash("script.js")
]);

const htmlFiles = (await readdir("dist")).filter((fileName) => fileName.endsWith(".html"));

await Promise.all(htmlFiles.map(async (fileName) => {
  const filePath = `dist/${fileName}`;
  const html = await readFile(filePath, "utf8");
  const versionedHtml = html
    .replace(/styles\.css(?:\?v=[^"']+)?/g, `styles.css?v=${stylesHash}`)
    .replace(/script\.js(?:\?v=[^"']+)?/g, `script.js?v=${scriptHash}`);
  await writeFile(filePath, versionedHtml);
}));

console.log(`Cache versions: styles=${stylesHash} script=${scriptHash}`);