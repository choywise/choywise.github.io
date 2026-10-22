// Tiny BM25 retriever over the knowledge chunks.
//
// This is deliberately dependency-free so it runs inside a Cloudflare Worker
// with zero cold-start cost. Swap `retrieve()` for an embedding search
// (pgvector, Pinecone, Voyage, ...) if you want semantic recall; the demo UI
// only cares about the {chunk, score} shape.

import { CHUNKS } from "./knowledge.mjs";

const STOPWORDS = new Set(
  (
    "a an and are as at be by for from has have he her his in is it its of on or that the this to was were will with " +
    "what who when where which how does do did about tell me daniel's your you i me my can could would should"
  ).split(" ")
);

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+.#/\s-]/g, " ")
    .split(/[\s/]+/)
    .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// Light stemming so "agents" matches "agent", "retrieval" ~ "retrieve" etc.
function stem(token) {
  return token
    .replace(/(ings?|ers?|ed|es|s)$/u, (m, _g, offset) => (offset > 3 ? "" : m))
    .replace(/(tion|sion)$/u, (m, _g, offset) => (offset > 3 ? "t" : m));
}

function termsOf(text) {
  return tokenize(text).map(stem);
}

const K1 = 1.4;
const B = 0.75;

// Build the index once per function instance.
const index = (() => {
  const docs = CHUNKS.map((chunk) => {
    const terms = termsOf(`${chunk.title} ${chunk.title} ${chunk.text}`);
    const tf = new Map();
    for (const t of terms) tf.set(t, (tf.get(t) || 0) + 1);
    return { chunk, tf, length: terms.length };
  });
  const avgLength = docs.reduce((s, d) => s + d.length, 0) / docs.length;
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const N = docs.length;
  const idf = new Map();
  for (const [t, n] of df) idf.set(t, Math.log(1 + (N - n + 0.5) / (n + 0.5)));
  return { docs, avgLength, idf };
})();

/**
 * Retrieve the top-k chunks for a query.
 * @returns {{chunk: object, score: number, matched: string[]}[]}
 */
export function retrieve(query, k = 4) {
  const qTerms = [...new Set(termsOf(query))];
  if (qTerms.length === 0) return [];
  const scored = index.docs.map((d) => {
    let score = 0;
    const matched = [];
    for (const t of qTerms) {
      const tf = d.tf.get(t);
      if (!tf) continue;
      const idf = index.idf.get(t) || 0;
      score += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * d.length) / index.avgLength)));
      matched.push(t);
    }
    return { chunk: d.chunk, score, matched };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => ({ ...s, score: Number(s.score.toFixed(3)) }));
}

export function formatContext(results) {
  return results
    .map((r, i) => `[${i + 1}] ${r.chunk.title} (${r.chunk.source})\n${r.chunk.text}`)
    .join("\n\n");
}
