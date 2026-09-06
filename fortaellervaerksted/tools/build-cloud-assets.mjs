import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const publicDir = resolve(projectRoot, "public");
const allowedAssets = ["index.html", "styles.css", "app.js"];

await rm(publicDir, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });

for (const fileName of allowedAssets) {
  await cp(resolve(projectRoot, fileName), resolve(publicDir, fileName));
}

console.log(`Cloud assets prepared: ${allowedAssets.join(", ")}`);
