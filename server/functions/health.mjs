// GET /api/health - lets the page know whether the assistant is available.
import { MODELS, isConfigured, json, withCors } from "../lib/claude.mjs";

export const config = { path: "/api/health" };

export default withCors(async () =>
  json({
    ok: true,
    configured: isConfigured(),
    model: MODELS.main,
    features: ["chat", "fit", "draft"],
  })
);
