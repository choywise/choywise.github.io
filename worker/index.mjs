// Cloudflare Worker entry point for the assistant API.
//
// The handlers in server/functions are written against the web standard
// Request/Response API and read configuration from process.env, so this file
// only routes requests and exposes the Worker's bindings (vars + secrets) as
// process.env before each call. Deployed by .github/workflows/deploy-api.yml.

import chat, { config as chatConfig } from "../server/functions/chat.mjs";
import draft, { config as draftConfig } from "../server/functions/draft.mjs";
import fit, { config as fitConfig } from "../server/functions/fit.mjs";
import health, { config as healthConfig } from "../server/functions/health.mjs";

const routes = new Map([
  [chatConfig.path, chat],
  [draftConfig.path, draft],
  [fitConfig.path, fit],
  [healthConfig.path, health],
]);

export default {
  async fetch(request, env) {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string") process.env[key] = value;
    }

    const url = new URL(request.url);
    const handler = routes.get(url.pathname);
    if (!handler) {
      return new Response(JSON.stringify({ error: "Not found", routes: [...routes.keys()] }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
    return handler(request, { ip: request.headers.get("cf-connecting-ip") || "unknown" });
  },
};
