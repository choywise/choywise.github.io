// Smoke test for the assistant backend.
//
//   node scripts/smoke-test.mjs
//
// Without ANTHROPIC_API_KEY it checks retrieval, the tool executors, request
// validation and the "not configured" responses. With a key it also makes one
// real round-trip per feature (this spends a small number of tokens).

import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  const env = await readFile(path.join(ROOT, ".env"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#") && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
} catch {}

const { retrieve } = await import("../netlify/lib/retrieval.mjs");
const { runTool, matchSkill } = await import("../netlify/lib/tools.mjs");
const { isConfigured, MODELS } = await import("../netlify/lib/claude.mjs");
const health = (await import("../netlify/functions/health.mjs")).default;
const chat = (await import("../netlify/functions/chat.mjs")).default;
const fit = (await import("../netlify/functions/fit.mjs")).default;
const draft = (await import("../netlify/functions/draft.mjs")).default;

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.log(`  FAIL ${name}\n       ${err.message}`);
    process.exitCode = 1;
  }
}

const post = (fn, data) =>
  fn(new Request("http://localhost/api/x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) }), { ip: "127.0.0.1" });

// Read the body only on failure, so a passing response can still be parsed.
async function expectOk(res) {
  if (res.status !== 200) throw new Error(`expected 200, got ${res.status}: ${await res.text()}`);
  return res;
}

console.log("\nRetrieval");
await test("Google question retrieves the Google chunk first", () => {
  assert.equal(retrieve("What did Daniel do at Google?")[0].chunk.id, "google");
});
await test("RAG question retrieves the RAG chunk first", () => {
  assert.equal(retrieve("Which vector databases does he use for RAG?")[0].chunk.id, "ai-rag");
});
await test("contact question retrieves contact chunk", () => {
  assert.equal(retrieve("How can I contact Daniel by email?")[0].chunk.id, "contact");
});
await test("Kafka question retrieves Sporttrade", () => {
  assert.equal(retrieve("Has he worked with Kafka?")[0].chunk.id, "project-sporttrade");
});
await test("empty query returns nothing", () => {
  assert.deepEqual(retrieve("the and of"), []);
});

console.log("\nTools");
await test("list_projects filters by tech and reports sources", async () => {
  const out = await runTool("list_projects", { tech: "kafka" });
  assert.match(out.text, /Sporttrade/);
  assert.doesNotMatch(out.text, /Otrium/);
  assert.equal(out.sources[0].title, "Sporttrade");
  assert.match(out.sources[0].url, /^https:/);
});
await test("match_skills scores strong/related/unknown", async () => {
  const out = JSON.parse((await runTool("match_skills", { required_skills: ["React", "Kubernetes", "COBOL"] })).text);
  assert.equal(out.results[0].status, "strong");
  assert.equal(out.results[1].status, "related");
  assert.equal(out.results[2].status, "unknown");
  assert.equal(out.match_percent, 50);
});
await test("matchSkill recognizes AI tooling", () => {
  assert.equal(matchSkill("LangGraph").status, "strong");
  assert.equal(matchSkill("pgvector").status, "strong");
});
await test("search_portfolio returns numbered passages with sources", async () => {
  const out = await runTool("search_portfolio", { query: "Olive AI" });
  assert.match(out.text, /^\[1\] /);
  assert.equal(out.sources[0].id, "olive");
});

console.log("\nFunctions (validation and configuration)");
await test("health reports configuration state and model", async () => {
  const res = await health(new Request("http://localhost/api/health"));
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.configured, isConfigured());
  assert.equal(data.model, MODELS.main);
  assert.deepEqual(data.features, ["chat", "fit", "draft"]);
});

if (!isConfigured()) {
  for (const [name, fn, payload] of [
    ["chat", chat, { messages: [{ role: "user", content: "hi" }] }],
    ["fit", fit, { text: "A React app" }],
    ["draft", draft, { purpose: "project", notes: "hi" }],
  ]) {
    await test(`${name} returns 503 when no API key is configured`, async () => {
      const res = await post(fn, payload);
      assert.equal(res.status, 503);
      const data = await res.json();
      assert.equal(data.configured, false);
    });
  }
  await test("wrong method returns 405", async () => {
    const res = await fit(new Request("http://localhost/api/fit"), { ip: "127.0.0.1" });
    assert.equal(res.status, 405);
  });
  console.log("\n  (skipping live model calls: set ANTHROPIC_API_KEY to run them)");
} else {
  console.log(`\nLive model calls (${MODELS.main})`);
  await test("chat streams tool calls, sources and text", async () => {
    const res = await post(chat, { messages: [{ role: "user", content: "Which projects used Kafka, and is Daniel a fit for a React + Python role?" }] });
    await expectOk(res);
    const raw = await res.text();
    const events = raw.split("\n\n").filter((l) => l.startsWith("data: ")).map((l) => JSON.parse(l.slice(6)));
    const types = new Set(events.map((e) => e.type));
    assert.ok(types.has("tool_call"), "expected at least one tool_call");
    assert.ok(types.has("text"), "expected text");
    const done = events.find((e) => e.type === "done");
    assert.ok(done, "expected done");
    assert.ok(done.sources.length > 0, "expected sources");
    const text = events.filter((e) => e.type === "text").map((e) => e.delta).join("");
    console.log("        tools:", events.filter((e) => e.type === "tool_call").map((e) => e.name).join(", "));
    console.log("       ", text.slice(0, 200).replace(/\n/g, " "));
  });
  await test("fit returns a structured assessment", async () => {
    const res = await post(fit, { text: "We need a healthcare dashboard: React front end, Python/FastAPI API, PostgreSQL, HL7/FHIR integration and an LLM-powered summary feature. Also need Rust for one service." });
    await expectOk(res);
    const data = await res.json();
    assert.ok(["strong", "good", "partial", "weak"].includes(data.result.fit));
    assert.ok(data.result.approach.length >= 3);
    console.log("        fit:", data.result.fit, "| gaps:", data.result.gaps.join(", ") || "none");
  });
  await test("draft returns a subject and body", async () => {
    const res = await post(draft, { purpose: "project", notes: "We are a small fintech startup and need a React + Node dashboard with an AI assistant. Timeline is about 3 months." });
    await expectOk(res);
    const data = await res.json();
    assert.ok(data.draft.subject.length > 5);
    assert.match(data.draft.body, /Daniel/);
    console.log("        subject:", data.draft.subject);
  });
}

console.log(`\n${passed} test(s) passed${process.exitCode ? ", some FAILED" : ""}\n`);
