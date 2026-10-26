// Tools the portfolio agent can call. Each tool has a strict JSON schema
// (so the model's arguments always validate) and a local executor.

import {
  AI_CAPABILITIES,
  EXPERIENCE,
  PROFILE,
  PROJECTS,
  SKILLS,
  TECH,
  experienceSummary,
} from "./knowledge.mjs";
import { retrieve } from "./retrieval.mjs";

export const TOOL_DEFINITIONS = [
  {
    name: "search_portfolio",
    description:
      "Full-text search over Daniel Choi's portfolio knowledge base (profile, experience, skills, AI capabilities, projects, contact). Use this first for any factual question about Daniel.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Short keyword query, e.g. 'RAG vector database' or 'Google'." },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_experience",
    description: "Return Daniel's full education and work timeline in chronological order.",
    strict: true,
    input_schema: { type: "object", properties: {}, required: [], additionalProperties: false },
  },
  {
    name: "list_projects",
    description:
      "List Daniel's portfolio projects with their tech stacks and links. Pass a technology name to filter (empty string returns all projects).",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        tech: { type: "string", description: "Technology to filter by, e.g. 'React', 'Python', 'Kafka'. Empty string for no filter." },
      },
      required: ["tech"],
      additionalProperties: false,
    },
  },
  {
    name: "match_skills",
    description:
      "Compare a list of required skills against Daniel's skills, AI capabilities and project stacks. Returns per-skill evidence and an overall match percentage. Use for 'is Daniel a fit for X role' questions.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        required_skills: {
          type: "array",
          items: { type: "string" },
          description: "Skills or technologies required by the role, e.g. ['React', 'LangGraph', 'Kubernetes'].",
        },
      },
      required: ["required_skills"],
      additionalProperties: false,
    },
  },
  {
    name: "get_contact",
    description: "Return Daniel's contact details and public profiles.",
    strict: true,
    input_schema: { type: "object", properties: {}, required: [], additionalProperties: false },
  },
];

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9+#. ]/g, " ").replace(/\s+/g, " ").trim();

function includesEither(a, b) {
  return a.includes(b) || b.includes(a);
}

/** Evidence lookup for a single skill name. */
export function matchSkill(skill) {
  const q = norm(skill);
  if (!q) return { skill, status: "unknown", evidence: "" };

  for (const s of SKILLS) {
    if ([s.name, ...s.aliases].some((a) => includesEither(norm(a), q))) {
      return { skill, status: "strong", evidence: `${s.name}: ${s.years}+ years of experience` };
    }
  }
  for (const t of TECH) {
    if ([t.name, ...t.aliases].some((a) => includesEither(norm(a), q))) {
      return { skill, status: "strong", evidence: `${t.name} (${t.context})` };
    }
  }
  for (const c of AI_CAPABILITIES) {
    const hit = [...c.tools, ...c.aliases].find((a) => includesEither(norm(a), q));
    if (hit) return { skill, status: "strong", evidence: `${c.name} (${hit})` };
  }
  const projects = PROJECTS.filter((p) => p.stack.some((t) => includesEither(norm(t), q)));
  if (projects.length) {
    return {
      skill,
      status: "related",
      evidence: `Used in project${projects.length > 1 ? "s" : ""}: ${projects.map((p) => p.name).join(", ")}`,
    };
  }
  return { skill, status: "unknown", evidence: "Not listed on the portfolio" };
}

const projectSource = (p) => ({
  id: `project-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  title: p.name,
  source: "Projects",
  url: p.url,
});

/**
 * Execute a tool. Returns `{ text, sources }`: `text` goes back to the model,
 * `sources` lets the UI show where an answer came from.
 */
export async function runTool(name, input) {
  switch (name) {
    case "search_portfolio": {
      const results = retrieve(String(input.query || ""), 4);
      if (!results.length) {
        return { text: "No matching passages. Try different keywords or ask Daniel directly.", sources: [] };
      }
      return {
        text: results.map((r, i) => `[${i + 1}] ${r.chunk.title}\n${r.chunk.text}`).join("\n\n"),
        sources: results.map((r) => ({ id: r.chunk.id, title: r.chunk.title, source: r.chunk.source })),
      };
    }
    case "get_experience": {
      return {
        text: experienceSummary(),
        sources: [{ id: "experience", title: "Experience timeline", source: "Experience" }],
      };
    }
    case "list_projects": {
      const tech = norm(input.tech || "");
      const list = tech ? PROJECTS.filter((p) => p.stack.some((t) => includesEither(norm(t), tech))) : PROJECTS;
      if (!list.length) return { text: `No portfolio projects list "${input.tech}" in their stack.`, sources: [] };
      return {
        text: list.map((p) => `${p.name} - ${p.blurb}${p.stack.length ? ` Stack: ${p.stack.join(", ")}.` : ""} URL: ${p.url}`).join("\n"),
        sources: list.map(projectSource),
      };
    }
    case "match_skills": {
      const required = Array.isArray(input.required_skills) ? input.required_skills.slice(0, 25) : [];
      const results = required.map(matchSkill);
      const score = results.length
        ? Math.round(
            (results.reduce((s, r) => s + (r.status === "strong" ? 1 : r.status === "related" ? 0.5 : 0), 0) /
              results.length) *
              100
          )
        : 0;
      return {
        text: JSON.stringify({ match_percent: score, results }, null, 2),
        sources: [{ id: "skills", title: "Skills", source: "Skills" }],
      };
    }
    case "get_contact": {
      return {
        text: JSON.stringify({ ...PROFILE, experience_count: EXPERIENCE.length }, null, 2),
        sources: [{ id: "contact", title: "Contact", source: "Contact" }],
      };
    }
    default:
      return { text: `Unknown tool: ${name}`, sources: [] };
  }
}
