# Hi, I'm Daniel 👋

**Senior Full Stack AI Engineer · Tech Lead** 

I have been building software for a living since 2013: backend services,
frontend apps, cloud infrastructure and, for the last few years, AI features
that actually make it to production. I care about clean code, tested systems
and clear communication. Roughly in that order on a good day, and in reverse
on a deadline.

This repository is my portfolio site: **[choywise.github.io](https://choywise.github.io/)**.
It has a live AI assistant you can ask about me. It only knows what I have
told it, so it will not make things up. Engineering notes for the site are in
[DEVELOPMENT.md](DEVELOPMENT.md).

## The engineer

**What I am good at**

- Owning a product end to end: API design, data model, UI, CI/CD,
  infrastructure, and the on-call that follows.
- Putting AI into products: NLP pipelines, LLM features, retrieval,
  agents and automation that survive contact with users.
- Frontend architecture at scale: micro frontends, design systems, and the
  unglamorous performance work (bundle splitting, lazy loading, virtualized
  data views).
- Cloud and infrastructure as code on AWS and GCP: serverless migrations,
  event-driven pipelines, Terraform.
- Leading small teams: architecture decisions, code review, mentoring, and
  keeping delivery boring in the best possible sense.

**Daily tools**

| | |
| --- | --- |
| Languages | TypeScript / JavaScript, Python, Ruby, Go, SQL |
| Frontend | React, Next.js, Vue, Tailwind, Radix / Shadcn / MUI / Chakra |
| Backend | Node (Express, NestJS), Python (FastAPI, Django, Flask), Rails, GraphQL, REST |
| AI / ML | LangChain, LangGraph, RAG, Hugging Face, PyTorch, TensorFlow, Claude / OpenAI / Gemini APIs |
| Data | PostgreSQL, MySQL, MongoDB, DynamoDB, Redis, Elasticsearch, Kafka, RabbitMQ |
| Infra | AWS, GCP, Terraform, Docker, GitHub Actions, Jenkins, GitLab CI, CircleCI |

**Where I have been, briefly**

Google (backend for Google Now), freelance through Toptal (fashion
e-commerce, chatbots, an AI video platform), Olive AI (healthcare automation
across hundreds of hospitals), and now Sigma AI, where I lead frontend and
backend architecture for AI products. The details are on the site, or just
ask the assistant.

## The human

- Senior engineer by day, superdad by night. Two jobs, and the unpaid one is
  harder.
- I like building things that make people say "wow", and I am suspicious of
  things that look impressive but do not work.

## Honest self-review

**Strengths**

- Calm when production is on fire. I debug by narrowing, not by guessing.
- I communicate early and plainly: what is done, what is not, what is risky.
- I finish things. Shipping beats polishing, and then I polish.

**Weaknesses (working on them)**

- I can over-engineer when nobody stops me. A deadline fixes this.
- I would rather refactor than write documentation. This README is practice.
- I say yes to too many side projects. See: this repository.

## Habits

- Tests before the second bug, not after the fifth.
- Small pull requests with a clear "why" in the description.
- One AI experiment a week, thrown away if it does not earn its keep.
- Coffee, then code. Family first, always.

## Say hello

- Email: [danielchoi@engineer.com](mailto:danielchoi@engineer.com)
- LinkedIn: [linkedin.com/in/danicho3](https://www.linkedin.com/in/danicho3/)
- LeetCode: [MadSkyDev](https://leetcode.com/MadSkyDev/)
- Or use the "Draft a message" feature on the site and let the assistant
  write the first version for you.

---

## About this repository

The site is static (HTML, CSS, a little jQuery) and is served by GitHub
Pages. The AI assistant's backend lives in `server/functions` as plain
`Request -> Response` handlers and runs on a small serverless host, because
GitHub Pages cannot execute code.

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env   # local only, gitignored
npm run dev                  # site + /api on http://localhost:8888
npm run dev -- --mock        # same, with canned answers and no API key
npm run test:functions       # backend smoke tests
```

**Hosting the API.** `.github/workflows/deploy-api.yml` deploys
`worker/index.mjs` to Cloudflare Workers on every push that touches the
backend. It needs three repository secrets: `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID` and `ANTHROPIC_API_KEY` (`AI_LAB_MODEL` is optional).
After the first deploy, put the Worker URL into `window.ASSISTANT_API_BASE`
in `index.html`. `wrangler.toml` lists the origins allowed to call the API.
Netlify also works (`netlify.toml` is kept for that); then the API is
same-origin and `ASSISTANT_API_BASE` stays empty.

**What the assistant knows** is in `server/lib/knowledge.mjs`. It answers
only from that file, so add a chunk there when you want it to learn
something new, then run the tests.
