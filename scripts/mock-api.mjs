// Canned API responses for `npm run dev -- --mock`.
//
// They reuse the real retrieval index and tool executors so the UI exercises
// the same data shapes as production, but no model is called and no tokens
// are spent. Generated text is clearly marked as mock.

import { retrieve } from "../netlify/lib/retrieval.mjs";
import { runTool, matchSkill } from "../netlify/lib/tools.mjs";
import { SKILLS, TECH, AI_CAPABILITIES, PROJECTS, PROFILE } from "../netlify/lib/knowledge.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

async function body(req) {
  try {
    return JSON.parse(await req.text());
  } catch {
    return {};
  }
}

function firstSentence(text) {
  const m = text.match(/^(.+?[.!?])(\s|$)/);
  return m ? m[1] : text;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function skillsIn(text) {
  const vocab = [
    ...SKILLS.map((s) => ({ name: s.name, terms: [s.name, ...s.aliases] })),
    ...TECH.map((t) => ({ name: t.name, terms: [t.name, ...t.aliases] })),
    ...AI_CAPABILITIES.flatMap((c) => c.tools.map((t) => ({ name: t, terms: [t] }))),
  ];
  const extra = (text.match(/\b(Kubernetes|Docker|GraphQL|Rust|Go|Java|Kafka|Terraform|Snowflake|Spark|Flutter)\b/gi) || []).map(
    (s) => s[0].toUpperCase() + s.slice(1).toLowerCase()
  );
  const found = vocab
    .filter((v) => v.terms.some((t) => t.length > 2 && new RegExp(`\\b${esc(t)}\\b`, "i").test(text)))
    .map((v) => v.name);
  return [...new Set([...found, ...extra])].slice(0, 10);
}

export const routes = [
  {
    path: "/api/health",
    handler: async () => json({ ok: true, configured: true, model: "mock-model", features: ["chat", "fit", "draft"], mock: true }),
  },

  {
    path: "/api/chat",
    handler: async (req) => {
      const { messages = [] } = await body(req);
      const last = messages.length ? String(messages[messages.length - 1].content || "") : "";
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (e) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
          await sleep(500);
          const id = "toolu_mock_1";
          const wantsMatch = /fit|match|role|position|hiring|requirements?/i.test(last);
          const wantsContact = /contact|email|reach|phone/i.test(last);
          const name = wantsMatch ? "match_skills" : wantsContact ? "get_contact" : "search_portfolio";
          const input = wantsMatch ? { required_skills: skillsIn(last).slice(0, 8) } : wantsContact ? {} : { query: last.slice(0, 80) };
          send({ type: "tool_call", id, name, input, turn: 1 });
          await sleep(400);
          const out = await runTool(name, input);
          send({ type: "tool_result", id, name, result: out.text, sources: out.sources, ms: 3 });
          await sleep(400);
          let answer;
          if (wantsMatch) {
            const parsed = JSON.parse(out.text);
            answer =
              `**Mock answer (no API key configured).** Based on what you listed, the match is about **${parsed.match_percent}%**.\n\n` +
              parsed.results.map((r) => `- ${r.skill}: ${r.status} (${r.evidence})`).join("\n") +
              `\n\nWant to talk it through? Email Daniel at ${PROFILE.email}.`;
          } else if (wantsContact) {
            answer = `**Mock answer (no API key configured).** You can reach Daniel at ${PROFILE.email} or ${PROFILE.phone}. He is based in ${PROFILE.location}.`;
          } else {
            const hits = retrieve(last, 2);
            answer = hits.length
              ? `**Mock answer (no API key configured).** Here is what the portfolio says: ${hits.map((h) => firstSentence(h.chunk.text)).join(" ")}`
              : `**Mock answer (no API key configured).** I could not find anything about that on the portfolio. You can email Daniel at ${PROFILE.email}.`;
          }
          for (const word of answer.split(/(\s+)/)) {
            send({ type: "text", delta: word });
            await sleep(16);
          }
          send({ type: "done", usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0 }, turns: 2, model: "mock-model", sources: out.sources, ms: 1800 });
          controller.close();
        },
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" } });
    },
  },

  {
    path: "/api/fit",
    handler: async (req) => {
      const { text = "" } = await body(req);
      await sleep(900);
      const required = skillsIn(text);
      const matched = required.map(matchSkill);
      const gaps = matched.filter((m) => m.status === "unknown").map((m) => m.skill);
      const ratio = required.length ? (required.length - gaps.length) / required.length : 0.7;
      const fit = ratio >= 0.85 ? "strong" : ratio >= 0.6 ? "good" : ratio >= 0.35 ? "partial" : "weak";
      const relevant = PROJECTS.filter((p) => p.stack.some((t) => required.some((r) => t.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(t.toLowerCase()))))
        .slice(0, 3)
        .map((p) => ({ name: p.name, url: p.url, why: `Mock: shares ${p.stack.filter((t) => required.some((r) => t.toLowerCase().includes(r.toLowerCase()))).slice(0, 3).join(", ") || "a similar stack"} with your project.` }));
      return json({
        result: {
          title: (text.match(/^(.{5,60}?)(\n|\.|$)/) || ["", "Your project"])[1].trim(),
          fit,
          summary: `Mock assessment (no API key configured). You described a project involving ${required.slice(0, 4).join(", ") || "a custom web product"}. Daniel would scope it in a short discovery call, then ship it in thin vertical slices with a working demo every week.`,
          approach: [
            "Clarify the user journeys and the data that has to move between systems.",
            "Stand up the core stack early and deploy a thin end-to-end slice.",
            "Add the AI pieces behind feature flags with evals before rollout.",
            "Harden with monitoring, rate limits and a rollback plan.",
          ],
          relevant_projects: relevant,
          relevant_experience: matched.filter((m) => m.status !== "unknown").slice(0, 3).map((m) => m.evidence),
          stack: required.slice(0, 8),
          gaps,
          next_step: "A 30-minute intro call would be enough to confirm scope and timeline.",
        },
        model: "mock-model",
        usage: { input_tokens: 0, output_tokens: 0 },
        ms: 900,
      });
    },
  },

  {
    path: "/api/draft",
    handler: async (req) => {
      const { purpose = "other", notes = "" } = await body(req);
      await sleep(800);
      const subjects = {
        project: "Project inquiry from your portfolio",
        hire: "Full-time opportunity",
        contract: "Contract work inquiry",
        advice: "Quick question",
        other: "Hello from your portfolio site",
      };
      return json({
        draft: {
          subject: subjects[purpose] || subjects.other,
          body:
            `Hi Daniel,\n\nI found your portfolio and wanted to reach out. ${firstSentence(notes.replace(/\s+/g, " ")) || "[Describe what you need]"}\n\n` +
            `Would you be open to a short call next week to talk it through? [Mock draft: no API key configured.]\n\nBest regards,\n[Your name]`,
        },
        to: PROFILE.email,
        model: "mock-model",
        usage: { input_tokens: 0, output_tokens: 0 },
        ms: 800,
      });
    },
  },
];
