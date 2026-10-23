// One-command deploy for the assistant API:
//
//   npm run api:deploy
//
// 1. Loads CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID from .env if they are
//    not already set in the shell (so you never have to retype them).
// 2. Runs `wrangler deploy` (through node, so PowerShell's script policy
//    does not get in the way).
// 3. Finds the Worker URL in Wrangler's output and writes it into
//    window.ASSISTANT_API_BASE in index.html.
// 4. Calls <worker>/api/health and tells you whether the API key is set.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = path.join(ROOT, "index.html");
const WRANGLER = path.join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");

// ---- 1. credentials from .env ---------------------------------------------
const envFile = path.join(ROOT, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    if (!(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.log(
    "No CLOUDFLARE_API_TOKEN found. Add these two lines to .env (it is gitignored):\n" +
      "  CLOUDFLARE_API_TOKEN=...\n  CLOUDFLARE_ACCOUNT_ID=...\n" +
      "Token: Cloudflare dashboard > My Profile > API Tokens > Create Token > 'Edit Cloudflare Workers'.\n" +
      "Account ID: dashboard > Workers & Pages > right-hand column."
  );
  process.exit(1);
}

// ---- 2. deploy ------------------------------------------------------------
const extraArgs = process.argv.slice(2);
console.log("Deploying the Worker...\n");
const res = spawnSync(process.execPath, [WRANGLER, "deploy", ...extraArgs], {
  cwd: ROOT,
  encoding: "utf8",
  stdio: ["inherit", "pipe", "inherit"],
  env: process.env,
});
process.stdout.write(res.stdout || "");
if (res.status !== 0) {
  console.error("\nDeploy failed (see Wrangler's message above).");
  process.exit(res.status || 1);
}

// ---- 3. write the URL into index.html -------------------------------------
const match = (res.stdout || "").match(/https:\/\/[A-Za-z0-9.-]+\.workers\.dev/);
if (!match) {
  console.log("\nDeployed, but the Worker URL was not in the output. Find it in the Cloudflare dashboard");
  console.log("(Workers & Pages > dancho-assistant-api) and set window.ASSISTANT_API_BASE in index.html.");
  process.exit(0);
}
const url = match[0];
const html = readFileSync(INDEX, "utf8");
const re = /window\.ASSISTANT_API_BASE = "[^"]*";/;
if (!re.test(html)) {
  console.log(`\nWorker URL: ${url}\nindex.html has no ASSISTANT_API_BASE line; add it manually.`);
} else {
  const updated = html.replace(re, `window.ASSISTANT_API_BASE = "${url}";`);
  if (updated !== html) {
    writeFileSync(INDEX, updated);
    console.log(`\nindex.html updated: window.ASSISTANT_API_BASE = "${url}"`);
  } else {
    console.log(`\nindex.html already points at ${url}`);
  }
}

// ---- 4. health check ------------------------------------------------------
try {
  const h = await fetch(`${url}/api/health`);
  const data = await h.json();
  console.log(`Health: ${h.status} configured=${data.configured} model=${data.model}`);
  if (!data.configured) {
    console.log("The API key is not set on the Worker yet. Run:\n  npx.cmd wrangler secret put ANTHROPIC_API_KEY");
  }
} catch (err) {
  console.log(`Health check failed: ${err.message}`);
}

console.log('\nNext: git commit -am "Point the assistant at the Cloudflare Worker" && git push');
