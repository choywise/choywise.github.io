// POST /api/fit - "Is Daniel a fit for my project / role?"
//
// Request:  { text: string }   a project or role description from a visitor
// Response: { result: FitResult, model, usage, ms }
//
// The model answers through a schema-constrained structured output, so the
// page can render a tidy, consistent card instead of free-form prose.

// The SDK's zodOutputFormat helper converts schemas with zod v4's JSON Schema
// generator, so schemas must be built with the v4 API (zod >= 3.25 ships it
// under "zod/v4"; a v3 schema makes the helper throw).
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  LIMITS,
  MODELS,
  effortOptions,
  getClient,
  guardRequest,
  handleError,
  HttpError,
  json,
  readJson,
  requireText,
  usageOf,
} from "../lib/claude.mjs";
import {
  PROFILE,
  PROJECTS,
  capabilitiesSummary,
  experienceSummary,
  projectsSummary,
  skillsSummary,
} from "../lib/knowledge.mjs";

export const config = { path: "/api/fit" };

export const FitResult = z.object({
  title: z.string().describe("Short name for the visitor's project or role, at most six words"),
  fit: z.enum(["strong", "good", "partial", "weak"]),
  summary: z
    .string()
    .describe("Two or three sentences, addressed to the visitor, on what they need and how Daniel would approach it"),
  approach: z
    .array(z.string())
    .describe("Three to five concrete steps or architecture choices Daniel would propose, one sentence each"),
  relevant_projects: z
    .array(z.object({ name: z.string(), why: z.string() }))
    .describe("Up to three portfolio projects from the profile that are relevant, with a one-line reason. Use exact project names."),
  relevant_experience: z
    .array(z.string())
    .describe("Up to three bullets citing experience, skills or AI capabilities from the profile that apply"),
  stack: z.array(z.string()).describe("Suggested technologies, short names, at most eight"),
  gaps: z.array(z.string()).describe("Requirements the profile does not clearly cover; empty if none"),
  next_step: z.string().describe("One sentence suggesting how to proceed, for example a short intro call"),
});

const SYSTEM_PROMPT = `You help visitors of ${PROFILE.name}'s portfolio decide whether he is a good fit for what they need. Daniel is a ${PROFILE.title}.

The visitor will describe a project they want built, or a role they are hiring for. Answer as a thoughtful consultant speaking to the visitor ("you"), using ONLY the profile below for facts about Daniel. Be honest: if something is not covered by the profile, list it under gaps and lower the fit rating. Do not invent projects, employers or metrics.

Profile:

Experience:
${experienceSummary()}

Core skills: ${skillsSummary()}

AI engineering capabilities:
${capabilitiesSummary()}

Projects:
${projectsSummary()}`;

export default async (req, context) => {
  const blocked = guardRequest(req, context);
  if (blocked) return blocked;

  try {
    const body = await readJson(req);
    const text = requireText(body.text, { field: "text", max: LIMITS.longInputChars });
    if (text.length < 25) {
      throw new HttpError(400, "Tell me a bit more first: what you are building, for whom, and roughly what stack or timeline you have in mind.");
    }
    const startedAt = Date.now();
    const model = MODELS.main;
    const effort = effortOptions(model, "low").output_config || {};

    const message = await getClient().messages.parse({
      model,
      max_tokens: 2048,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `Here is what I need:\n\n${text}` }],
      output_config: { ...effort, format: zodOutputFormat(FitResult) },
    });

    if (message.stop_reason === "refusal") {
      throw new HttpError(422, "I can't assess that request. Try describing the project or role in a different way.");
    }
    const result = message.parsed_output;
    if (!result) throw new HttpError(502, "The assistant returned an unreadable answer. Please try again.");

    // Attach links for projects the model named (exact names from the profile).
    result.relevant_projects = (result.relevant_projects || []).slice(0, 3).map((p) => {
      const known = PROJECTS.find((k) => k.name.toLowerCase() === String(p.name).toLowerCase());
      return known ? { ...p, name: known.name, url: known.url } : p;
    });

    return json({ result, model, usage: usageOf(message), ms: Date.now() - startedAt });
  } catch (err) {
    return handleError(err);
  }
};
