// Netlify build step: copy the static site into dist/ so that node_modules,
// server/, worker/, scripts/ and other tooling never get published as static files.
// Functions are bundled separately by Netlify from server/functions/.

import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const PUBLISH = ["index.html", "404.html", "css", "js", "img", "fonts"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of PUBLISH) {
  const from = path.join(root, entry);
  const to = path.join(dist, entry);
  await cp(from, to, {
    recursive: true,
    // Skip Photoshop sources and other working files.
    filter: (src) => !/\.(psd|DS_Store)$/i.test(src),
  });
  console.log(`copied ${entry}`);
}

console.log(`\nSite built into ${path.relative(root, dist)}/`);
