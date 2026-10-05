// Shared helpers for the AI Lab Netlify Functions.
//
// - One Anthropic client per function instance (credentials come from the
//   ANTHROPIC_API_KEY environment variable set in the Netlify dashboard).
// - Small request guards: method check, JSON body limits, a per-IP sliding
//   window rate limit (per warm instance; it is a speed bump, not a wall), and
//   a clear 503 when the backend has no credentials so the UI can say so.

import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  // Model behind the assistant. Sonnet balances quality, speed and cost for a
  // public-facing chat; override with AI_LAB_MODEL.
  main: process.env.AI_LAB_MODEL || "claude-sonnet-5-5",
};

export const LIMITS = {
  inputChars: 2000, // one chat message
  longInputChars: 3000, // project description / message notes
  historyMessages: 12, // chat turns kept
  agentTurns: 5, // max model round-trips per chat request
  bodyBytes: 32_000,
  rateWindowMs: 10 * 60 * 1000,
  rateMax: 30, // requests per IP per window (per warm instance)
};

export function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client;
export function getClient() {
  if (!client) client = new Anthropic({ maxRetries: 1, timeout: 60_000 });
  return client;
}

// Models from the Claude 4.6+ generation accept `output_config.effort`; the
// older Haiku 4.5 / Sonnet 4.5 / Opus 4.5 family does not. Chat-style demos
// run at low effort for latency.
export function effortOptions(model, effort = "low") {
  if (/(haiku-4-5|sonnet-4-5|opus-4-5)/.test(model)) return {};
  return { output_config: { effort } };
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...BASE_HEADERS, ...(init.headers || {}) },
  });
}

export function errorResponse(status, message, extra = {}) {
  return json({ error: message, ...extra }, { status });
}

export function clientIp(req, context) {
  return (
    (context && context.ip) ||
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < LIMITS.rateWindowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded on long-lived instances
  return recent.length > LIMITS.rateMax;
}

/**
 * Common pre-flight for every demo endpoint. Returns a Response to send
 * immediately, or null when the request may proceed.
 */
export function guardRequest(req, context, { method = "POST" } = {}) {
  if (req.method !== method) return errorResponse(405, `Use ${method}`);
  if (!isConfigured()) {
    return errorResponse(503, "The AI Lab backend is not configured yet (missing ANTHROPIC_API_KEY).", {
      configured: false,
    });
  }
  if (rateLimited(clientIp(req, context))) {
    return errorResponse(429, "Too many requests from this network. Please try again in a few minutes.");
  }
  return null;
}

export async function readJson(req) {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > LIMITS.bodyBytes) throw new HttpError(413, "Request body too large");
  let text;
  try {
    text = await req.text();
  } catch {
    throw new HttpError(400, "Could not read request body");
  }
  if (text.length > LIMITS.bodyBytes) throw new HttpError(413, "Request body too large");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "Body must be JSON");
  }
}

export function requireText(value, { field = "text", max = LIMITS.inputChars } = {}) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, `"${field}" is required`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new HttpError(413, `"${field}" is limited to ${max} characters`);
  return trimmed;
}

/** Map SDK errors to a status + visitor-safe message. */
export function describeError(err) {
  if (err instanceof HttpError) return { status: err.status, message: err.message };
  if (err instanceof Anthropic.AuthenticationError) {
    return { status: 502, message: "The backend credentials were rejected by the model provider." };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "The model provider is rate limiting this demo right now. Try again shortly." };
  }
  if (err instanceof Anthropic.BadRequestError) {
    return { status: 502, message: `The model request was rejected: ${err.message}` };
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return { status: 504, message: "Could not reach the model provider." };
  }
  if (err instanceof Anthropic.APIError) {
    return { status: 502, message: `Model provider error (${err.status}).` };
  }
  return { status: 500, message: "Unexpected server error." };
}

export function handleError(err) {
  const { status, message } = describeError(err);
  if (status >= 500) console.error("[ai-lab]", err);
  return errorResponse(status, message);
}

export function usageOf(message) {
  const u = message && message.usage ? message.usage : {};
  return {
    input_tokens: u.input_tokens || 0,
    output_tokens: u.output_tokens || 0,
    cache_read_input_tokens: u.cache_read_input_tokens || 0,
  };
}

export function textOf(message) {
  return (message.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
