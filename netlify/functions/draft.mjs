// POST /api/draft - draft a short email from the visitor to Daniel.
//
// Request:  { purpose: "project" | "hire" | "contract" | "advice" | "other", notes: string }
// Response: { draft: { subject, body }, to, model, usage, ms }
//
// Nothing is stored or sent server-side; the page opens the visitor's own
// email client with the draft prefilled.

// Schemas must use the zod v4 API; see fit.mjs.
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
import { PROFILE } from "../lib/knowledge.mjs";

export const config = { path: "/api/draft" };

const PURPOSES = {
  project: "they have a project they would like Daniel to build or help build",
  hire: "they are hiring for a full-time role and want to talk to Daniel about it",
  contract: "they are looking for contract or freelance help",
  advice: "they would like advice or have a quick technical question",
  other: "they want to get in touch",
};

export const Draft = z.object({
  subject: z.string().describe("Email subject line, under 70 characters"),
  body: z
    .string()
    .describe(
      "Plain-text email body of 70 to 150 words: greeting to Daniel, one paragraph with the visitor's context and ask, a clear next step, and a sign-off with the placeholder [Your name]. Use placeholders in square brackets for details the visitor did not provide."
    ),
});

const SYSTEM_PROMPT = `You draft short, warm, professional emails from a website visitor to ${PROFILE.name}, a ${PROFILE.title}.

Rules:
- Use only what the visitor wrote. Put any detail they did not provide (company, timeline, budget, their name) in square-bracket placeholders rather than inventing it.
- Do not invent facts about Daniel. You may reference that the visitor found him through his portfolio.
- Plain text only. No markdown, no bullet points, no subject line inside the body.`;

export default async (req, context) => {
  const blocked = guardRequest(req, context);
  if (blocked) return blocked;

  try {
    const body = await readJson(req);
    const purposeKey = Object.prototype.hasOwnProperty.call(PURPOSES, body.purpose) ? body.purpose : "other";
    const notes = requireText(body.notes, { field: "notes", max: LIMITS.longInputChars });
    if (notes.length < 15) {
      throw new HttpError(400, "Add a few notes first: who you are, what you need, and anything Daniel should know. I will turn that into the email.");
    }
    const startedAt = Date.now();
    const model = MODELS.main;
    const effort = effortOptions(model, "low").output_config || {};

    const message = await getClient().messages.parse({
      model,
      max_tokens: 1024,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: `Purpose: ${PURPOSES[purposeKey]}.\n\nThe visitor's notes:\n"""\n${notes}\n"""\n\nDraft the email.`,
        },
      ],
      output_config: { ...effort, format: zodOutputFormat(Draft) },
    });

    if (message.stop_reason === "refusal") {
      throw new HttpError(422, "I can't draft that message. Try rephrasing your notes.");
    }
    const draft = message.parsed_output;
    if (!draft) throw new HttpError(502, "The assistant returned an unreadable draft. Please try again.");

    return json({ draft, to: PROFILE.email, model, usage: usageOf(message), ms: Date.now() - startedAt });
  } catch (err) {
    return handleError(err);
  }
};
