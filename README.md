# Daniel Choi - Portfolio

Static single-page portfolio (jQuery + fullpage.js) with a built-in **AI
Assistant** for visitors, backed by Netlify Functions that call the Anthropic
Claude API.

| Feature | What visitors get | Endpoint |
| --- | --- | --- |
| Ask about Daniel | Streaming chat grounded in this portfolio, with sources and a collapsible lookup trace | `POST /api/chat` |
| Project fit | Describe a project or role, get an honest assessment, relevant work and next step | `POST /api/fit` |
| Draft a message | Turn rough notes into a short email that opens in the visitor's mail app | `POST /api/draft` |
| Health | Tells the page whether the backend is configured | `GET /api/health` |

## Layout

```
index.html, css/, js/, img/, fonts/   the site (copied to dist/ at build time)
netlify/functions/*.mjs               one file per API route
netlify/lib/                          knowledge base, BM25 retrieval, tools, shared helpers
scripts/dev-server.mjs                local server: static site + /api routes on one port
scripts/mock-api.mjs                  canned API responses for UI work without an API key
scripts/smoke-test.mjs                backend tests (live model calls only when a key is set)
scripts/build.mjs                     Netlify build step (copies the site into dist/)
```

## Local development

```bash
npm install
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm run dev                 # http://localhost:8888  (real model calls)
npm run dev -- --mock       # http://localhost:8888  (no key needed, canned responses)
npm run test:functions      # smoke tests
```

The dev server routes `/api/*` to the functions in `netlify/functions` using
the same `Request`/`Response` contract Netlify uses, so no Netlify CLI is
needed. Opening `index.html` through any other static server shows the
assistant as offline, because `/api` only exists on Netlify or the dev server.

## Deploying to Netlify

1. Push this repo. `netlify.toml` sets the build command (`node scripts/build.mjs`),
   the publish directory (`dist`) and the functions directory, and it takes
   precedence over the UI build settings.
2. In the Netlify dashboard add the environment variable **`ANTHROPIC_API_KEY`**
   (Site configuration > Environment variables). Without it the site still
   deploys and the assistant shows an "offline" banner with Daniel's email.
3. Optional: `AI_LAB_MODEL` overrides the model (default `claude-sonnet-5-5`).

## Abuse protection

Every endpoint caps input length and `max_tokens`, and applies a per-IP
sliding-window rate limit (30 requests / 10 minutes per warm function
instance). For stronger protection put the site behind Netlify's rate-limiting
rules or a WAF, and set a spend limit on the Anthropic console.

## Editing what the assistant knows

The chat answers only from `netlify/lib/knowledge.mjs`, and the fit and draft
features use the profile lists at the top of that file. Add or edit chunks
there to teach the assistant new facts, then run `npm run test:functions`.
