// Local development server: serves the static site from the repo root and
// routes /api/* to the API handlers in server/functions (same
// Request/Response contract Netlify uses), so `npm run dev` gives you the
// whole thing on one port without the Netlify CLI.
//
//   npm run dev            -> http://localhost:8888 (calls the real API,
//                             needs ANTHROPIC_API_KEY in .env or the shell)
//   npm run dev -- --mock  -> canned responses, no API key, no token spend
//
// Netlify itself ignores this file (it is only for local development).

import http from "node:http";
import path from "node:path";
import { createReadStream } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8888);
const MOCK = process.argv.includes("--mock") || process.env.AI_LAB_MOCK === "1";

// ---- .env loading (no dependency) -----------------------------------------
try {
  const env = await readFile(path.join(ROOT, ".env"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
} catch {
  /* no .env, fine */
}

// ---- Load API routes --------------------------------------------------------
const routes = [];
if (MOCK) {
  const mock = await import("./mock-api.mjs");
  routes.push(...mock.routes);
  console.log("AI Lab API: MOCK mode (canned responses, no token spend)");
} else {
  const dir = path.join(ROOT, "server", "functions");
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".mjs")) continue;
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    if (!mod.config || !mod.config.path || typeof mod.default !== "function") continue;
    routes.push({ path: mod.config.path, handler: mod.default, file });
  }
  const configured = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  console.log(`AI Lab API: LIVE mode (${configured ? "ANTHROPIC_API_KEY found" : "no ANTHROPIC_API_KEY - demos will report 503"})`);
}
for (const r of routes) console.log(`  ${r.path}  <-  ${r.file || "mock"}`);

// ---- Static files -----------------------------------------------------------
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
};

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT) || /[\\/](node_modules|server|worker|scripts|\.git|\.claude)([\\/]|$)/.test(file)) {
    res.writeHead(404);
    return res.end("Not found");
  }
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error("not a file");
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return createReadStream(path.join(ROOT, "404.html")).on("error", () => res.end("Not found")).pipe(res);
  }
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  createReadStream(file).pipe(res);
}

// ---- Bridge Node req/res <-> Fetch Request/Response -------------------------
async function callFunction(route, req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
  const request = new Request(`http://localhost:${PORT}${req.url}`, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
  });
  const context = { ip: req.socket.remoteAddress || "127.0.0.1" };

  let response;
  try {
    response = await route.handler(request, context);
  } catch (err) {
    console.error(`[${route.path}]`, err);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Function crashed: " + err.message }));
  }

  const out = {};
  response.headers.forEach((v, k) => (out[k] = v));
  res.writeHead(response.status, out);
  if (!response.body) return res.end();
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const route = routes.find((r) => r.path === url.pathname);
    if (route) return callFunction(route, req, res);
    if (url.pathname.startsWith("/api/")) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "No such API route" }));
    }
    return serveStatic(req, res, url.pathname);
  })
  .listen(PORT, () => console.log(`\nPortfolio dev server: http://localhost:${PORT}\n`));
