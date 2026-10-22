# Development notes

Single-page portfolio (static HTML, jQuery + fullpage.js) with two AI
sections:

- **AI Engineering** - an overview of capability areas (agents, RAG, frontier
  models, multi-agent systems, fine-tuning, evals, multimodal, coding agents).
- **AI Assistant** - live features visitors can use, backed by Netlify
  Functions that call the Anthropic Claude API.

| Feature | What visitors get | Endpoint |
| --- | --- | --- |
| Ask about Daniel | Streaming chat grounded in the knowledge base, with sources and a collapsible lookup trace | `POST /api/chat` |
| Project fit | Describe a project or role, get an honest assessment, relevant work and a next step | `POST /api/fit` |
| Draft a message | Turn rough notes into a short email that opens in the visitor's own mail app | `POST /api/draft` |
| Health | Tells the page whether the backend is configured | `GET /api/health` |

When the backend is not configured, the assistant shows a single "offline"
banner with the contact email and disables its inputs. Nothing else on the
page depends on it.

## Layout

```
index.html, css/, js/, img/, fonts/   the site (copied to dist/ at build time)
css/assistant.css, js/assistant.js    the AI Assistant front end (no build step)
netlify/functions/*.mjs               one file per API route
netlify/lib/knowledge.mjs             everything the assistant knows (see below)
netlify/lib/retrieval.mjs             BM25 search over the knowledge chunks
netlify/lib/tools.mjs                 tools the chat agent can call
netlify/lib/claude.mjs                Anthropic client, limits, rate limit, error mapping
scripts/dev-server.mjs                local server: static site + /api routes on one port
scripts/mock-api.mjs                  canned API responses for UI work without an API key
scripts/smoke-test.mjs                backend tests (live model calls only when a key is set)
scripts/build.mjs                     Netlify build step (copies the site into dist/)
.claude/launch.json                   preview configs for the Claude desktop app
```

## Local development

```bash
npm install
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm run dev                 # http://localhost:8888  (real model calls)
npm run dev -- --mock       # http://localhost:8888  (no key needed, canned responses)
npm run test:functions      # smoke tests; makes one real call per feature when a key is set
```

The dev server routes `/api/*` to the functions in `netlify/functions` using
the same `Request`/`Response` contract Netlify uses, so the Netlify CLI is not
required. Two things to know:

- Function code is loaded once at startup. After editing anything under
  `netlify/`, restart `npm run dev`. CSS, JS and HTML changes only need a
  page reload.
- Opening `index.html` through any other static server shows the assistant
  as offline, because `/api` only exists on Netlify or this dev server.

## Deploying to Netlify

1. Push the repo. `netlify.toml` sets the build command
   (`node scripts/build.mjs`), the publish directory (`dist`) and the
   functions directory. It takes precedence over the build settings in the
   Netlify UI, so nothing needs changing there.
2. Add the API key: **Site configuration > Environment variables > Add a
   variable**, key `ANTHROPIC_API_KEY`, all scopes and deploy contexts.
3. Optional: `AI_LAB_MODEL` to choose the model (default `claude-sonnet-5-5`;
   `claude-haiku-4-5` is cheaper, `claude-opus-5-5` is the most capable).
4. Trigger a deploy (**Deploys > Trigger deploy**). Variables only apply to
   builds that run after they are added.
5. Check `https://<your-site>/api/health`; it reports `"configured": true`
   once the key is picked up.

Never commit `.env`; it is gitignored. Only the dashboard copy of the key is
used in production.

## Teaching the assistant more

The assistant only knows what is in `netlify/lib/knowledge.mjs`, which was
written from the portfolio page and the resume. To extend it:

- Add chunks to `CHUNKS` for anything the chat should be able to find and
  cite: one self-contained passage per topic (a role, a project, a
  specialty), with a readable `title` and `source`.
- Keep `EXPERIENCE` (with `highlights`), `SKILLS`, `TECH`, `PROJECTS` and
  `AI_CAPABILITIES` in sync; the Project fit and Draft features build the
  profile from those lists, and the skill-matching tool uses the `aliases`
  to recognise technologies recruiters mention.
- Keep it factual. The prompts forbid the model from inventing details, so
  anything missing is answered with "the portfolio does not cover that".

After editing, run `npm run test:functions`. The retrieval tests will tell
you if a new chunk accidentally outranks an existing one for common
questions.

## Abuse protection and cost

Every endpoint caps input length and `max_tokens`, rejects one-word inputs
with a hint instead of a model call, and applies a per-IP sliding-window rate
limit (30 requests per 10 minutes per warm function instance). For stronger
protection put the site behind Netlify's rate-limiting rules or a WAF, and
set a monthly spend limit on the Anthropic console.
