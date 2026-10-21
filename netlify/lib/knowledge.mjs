// Knowledge base for the AI Lab demos.
//
// Everything in here is derived from the public portfolio page (index.html).
// Keep it factual: the agent and the RAG demo answer ONLY from these chunks,
// so if you want the demos to know something new, add a chunk here.

export const PROFILE = {
  name: "Daniel Choi",
  title: "Senior Full Stack AI Engineer | Tech Lead",
  location: "Aurora, CO 80015",
  email: "danielchoi@engineer.com",
  phone: "(814) 351-9376",
  site: "https://dancho14.netlify.app/",
  links: {
    linkedin: "https://www.linkedin.com/in/choiwise/",
    github: "https://github.com/legendm00n",
    bluesky: "https://bsky.app/profile/danich6.bsky.social/",
    leetcode: "https://leetcode.com/MadSkyDev/",
  },
};

export const EXPERIENCE = [
  {
    org: "University of Colorado Denver",
    role: "B.S. in Computer Science",
    start: "2009",
    end: "2013",
    type: "education",
  },
  {
    org: "Google",
    role: "Software Engineering Intern, then Software Engineer II/III",
    start: "Jun 2013",
    end: "Jun 2016",
    type: "work",
  },
  {
    org: "Toptal",
    role: "Full Stack Software Developer (freelance)",
    start: "Aug 2016",
    end: "Mar 2020",
    type: "work",
  },
  {
    org: "Olive AI",
    role: "Senior Software Engineer",
    start: "Jul 2020",
    end: "Sep 2023",
    type: "work",
  },
  {
    org: "Sigma AI",
    role: "Senior Software Engineer | Tech Lead",
    start: "Nov 2023",
    end: "Present",
    type: "work",
  },
];

// Core skills with years of experience, as listed on the Skills section.
export const SKILLS = [
  { name: "React.js", years: 8, aliases: ["react", "reactjs", "react.js"] },
  { name: "Next.js", years: 6, aliases: ["next", "nextjs", "next.js"] },
  { name: "Vue.js", years: 5, aliases: ["vue", "vuejs", "vue.js", "nuxt"] },
  { name: "Angular", years: 4, aliases: ["angular", "angularjs"] },
  { name: "Node.js", years: 8, aliases: ["node", "nodejs", "node.js", "express", "nestjs"] },
  { name: "Python", years: 7, aliases: ["python", "fastapi", "django", "flask"] },
  { name: "Ruby on Rails", years: 4, aliases: ["ruby", "rails", "ruby on rails", "ror"] },
  { name: "SQL/NoSQL", years: 9, aliases: ["sql", "nosql", "postgres", "postgresql", "mysql", "mongodb", "mongo", "database", "databases"] },
  { name: "TypeScript", years: 6, aliases: ["typescript", "ts"] },
  { name: "JavaScript", years: 10, aliases: ["javascript", "js", "es6"] },
];

// AI capability areas with the tools behind them (AI Engineering section).
export const AI_CAPABILITIES = [
  {
    name: "Agentic AI",
    summary: "Agents that plan, call tools and finish multi-step workflows, with human-in-the-loop checkpoints.",
    tools: ["LangGraph", "Claude Agent SDK", "OpenAI Agents SDK", "MCP", "Tool Use"],
    aliases: ["agent", "agents", "agentic", "langgraph", "mcp", "tool use", "function calling", "agent sdk"],
  },
  {
    name: "RAG & Knowledge Systems",
    summary: "Chunking, embeddings, hybrid search and reranking for grounded, cited answers over private data.",
    tools: ["pgvector", "Pinecone", "Qdrant", "LlamaIndex", "GraphRAG", "Reranking"],
    aliases: ["rag", "retrieval", "retrieval augmented generation", "vector", "embeddings", "pgvector", "pinecone", "qdrant", "llamaindex", "vector database", "semantic search"],
  },
  {
    name: "Frontier Models",
    summary: "Streaming, structured outputs, prompt caching and model routing across the latest frontier LLMs.",
    tools: ["Claude", "GPT", "Gemini", "Llama", "Vercel AI SDK", "Bedrock"],
    aliases: ["llm", "llms", "claude", "anthropic", "openai", "gpt", "gemini", "llama", "bedrock", "vercel ai sdk", "prompt engineering", "structured outputs", "prompt caching"],
  },
  {
    name: "Multi-Agent Systems",
    summary: "Orchestrator/worker topologies, shared memory and task delegation across specialized agents.",
    tools: ["CrewAI", "AutoGen", "Temporal", "Event-driven", "A2A"],
    aliases: ["multi-agent", "multi agent", "crewai", "autogen", "temporal", "orchestration", "a2a"],
  },
  {
    name: "Fine-Tuning & Model Serving",
    summary: "LoRA/QLoRA fine-tuning, distillation and synthetic data, served on fast GPU inference.",
    tools: ["PyTorch", "Hugging Face", "LoRA / PEFT", "vLLM", "Ollama"],
    aliases: ["fine-tuning", "fine tuning", "finetuning", "lora", "qlora", "peft", "pytorch", "hugging face", "huggingface", "vllm", "ollama", "machine learning", "ml", "model serving", "inference"],
  },
  {
    name: "Evals, Guardrails & Observability",
    summary: "LLM-as-judge evals, red-teaming, PII guardrails and tracing so AI features ship safely and stay reliable.",
    tools: ["LangSmith", "Langfuse", "Promptfoo", "Guardrails", "OpenTelemetry"],
    aliases: ["evals", "evaluation", "guardrails", "observability", "langsmith", "langfuse", "promptfoo", "red teaming", "safety", "tracing", "opentelemetry"],
  },
  {
    name: "Multimodal & Voice AI",
    summary: "Real-time voice agents, speech-to-text, vision and document understanding wired into web and mobile apps.",
    tools: ["Whisper", "Realtime API", "TTS", "Vision", "WebRTC"],
    aliases: ["voice", "speech", "speech-to-text", "stt", "tts", "whisper", "realtime", "vision", "multimodal", "webrtc", "audio"],
  },
  {
    name: "AI Coding & Computer-Use Agents",
    summary: "Agentic coding workflows and browser automation that take tasks from spec to tested pull request.",
    tools: ["Claude Code", "Cursor", "Playwright", "Computer Use", "CI/CD"],
    aliases: ["claude code", "cursor", "playwright", "computer use", "browser automation", "coding agent", "ci/cd", "automation"],
  },
];

export const PROJECTS = [
  {
    name: "Sporttrade",
    url: "https://platform.getsporttrade.com/",
    blurb: "Sports trading platform with real-time markets, mobile apps and streaming infrastructure.",
    stack: ["Ember.js", "Go", "Ruby", "PostgreSQL", "Kafka", "Kubernetes", "AWS", "Swift", "Kotlin", "ELK"],
  },
  {
    name: "hellocare",
    url: "https://hellocare.solaborate.com/",
    blurb: "Virtual care and telehealth platform with real-time video and healthcare data integrations.",
    stack: ["React", "Vite", "Redux", "WebRTC", "Socket.IO", "Node.js", "Azure", "HL7", "FHIR"],
  },
  {
    name: "Donna",
    url: "https://app.askdonna.com/",
    blurb: "AI assistant product combining speech-to-text and LLM features over real-time WebSockets.",
    stack: ["React Router v7", "TypeScript", "Tailwind CSS", "Base UI", "Speech-to-Text", "LLM", "WebSockets", "AWS"],
  },
  {
    name: "Otrium",
    url: "https://otrium.com/",
    blurb: "Fashion e-commerce platform with search, personalization and a Next.js storefront.",
    stack: ["Next.js", "Node.js", "FastAPI", "MongoDB", "TanStack Query", "Tailwind", "Algolia"],
  },
  {
    name: "Bookvid",
    url: "https://bookvid.com",
    blurb: "Video booking platform for creators and experts.",
    stack: ["React", "Next.js", "Node.js", "Python", "Vercel", "AWS", "Docker"],
  },
  {
    name: "Cheap Holiday",
    url: "https://cheapholidays.holiday/",
    blurb: "Travel deals website.",
    stack: ["HTML/CSS", "JavaScript", "jQuery", "PHP"],
  },
  {
    name: "iMartTree",
    url: "https://www.imarttree.com/",
    blurb: "E-commerce storefront built with Vue.",
    stack: ["Vue.js", "Vuetify", "Vue Bootstrap", "PHP"],
  },
  {
    name: "House Sell",
    url: "https://www.cosmocabinets.com/",
    blurb: "Real-estate and cabinetry business site on Laravel.",
    stack: ["Laravel", "Node.js", "PHP", "JavaScript"],
  },
];

// ---------------------------------------------------------------------------
// Retrieval chunks. Each chunk is a self-contained passage the RAG demo can
// cite. `title` and `source` are shown to visitors, so keep them readable.
// ---------------------------------------------------------------------------
export const CHUNKS = [
  {
    id: "profile",
    title: "Profile",
    source: "About",
    text:
      "Daniel Choi is a Senior Full Stack AI Engineer and Tech Lead based in Aurora, Colorado. " +
      "He has worked as a software developer since 2013, building everything from polished UIs to full-stack applications with React/Next.js, Vue.js, Node.js, Ruby on Rails and Python. " +
      "Recently he has focused on AI engineering: integrating LLM features, agents, retrieval and machine learning into product stacks so apps become more powerful and user friendly.",
  },
  {
    id: "education",
    title: "Education",
    source: "Experience",
    text: "Daniel earned a B.S. in Computer Science from the University of Colorado Denver (2009 to 2013).",
  },
  {
    id: "google",
    title: "Google (2013 to 2016)",
    source: "Experience",
    text:
      "Daniel joined Google as a Software Engineering Intern in June 2013 and converted to a full-time Software Engineer (levels II and III) from August 2013 until June 2016.",
  },
  {
    id: "toptal",
    title: "Toptal (2016 to 2020)",
    source: "Experience",
    text:
      "From August 2016 to March 2020 Daniel worked as a freelance Full Stack Software Developer through the Toptal network, delivering web applications for a range of clients.",
  },
  {
    id: "olive",
    title: "Olive AI (2020 to 2023)",
    source: "Experience",
    text: "From July 2020 to September 2023 Daniel was a Senior Software Engineer at Olive AI.",
  },
  {
    id: "sigma",
    title: "Sigma AI (2023 to present)",
    source: "Experience",
    text:
      "Since November 2023 Daniel has been a Senior Software Engineer and Tech Lead at Sigma AI, where he leads engineering work on AI-powered products.",
  },
  {
    id: "skills-frontend",
    title: "Frontend skills",
    source: "Skills",
    text:
      "Frontend: React.js (8+ years), Next.js (6+ years), Vue.js (5+ years) and Angular (4+ years). Daniel also works daily with TypeScript and modern JavaScript, Tailwind CSS and component libraries such as Radix UI and Base UI.",
  },
  {
    id: "skills-backend",
    title: "Backend and data skills",
    source: "Skills",
    text:
      "Backend and data: Node.js (8+ years), Python (7+ years), Ruby on Rails (4+ years) and SQL/NoSQL databases (9+ years) including PostgreSQL, MySQL and MongoDB. Cloud and infrastructure experience spans AWS, Azure, Vercel, Docker and Kubernetes.",
  },
  {
    id: "ai-agents",
    title: "Agentic and multi-agent AI",
    source: "AI Engineering",
    text:
      "Daniel builds agentic AI systems: agents that plan, call tools and complete multi-step workflows with human-in-the-loop checkpoints, using LangGraph, the Claude Agent SDK, the OpenAI Agents SDK, MCP (Model Context Protocol) and native tool use. " +
      "For multi-agent systems he designs orchestrator/worker topologies with shared memory and task delegation using CrewAI, AutoGen, Temporal, event-driven architectures and the A2A protocol.",
  },
  {
    id: "ai-rag",
    title: "RAG and knowledge systems",
    source: "AI Engineering",
    text:
      "Daniel builds retrieval-augmented generation (RAG) pipelines: document chunking, embeddings, hybrid keyword plus vector search, reranking and citation-grounded answers over private data. " +
      "Tooling includes pgvector, Pinecone, Qdrant, LlamaIndex and GraphRAG.",
  },
  {
    id: "ai-models",
    title: "Frontier models and fine-tuning",
    source: "AI Engineering",
    text:
      "Daniel integrates frontier LLMs such as Claude, GPT, Gemini and Llama with streaming, structured outputs, prompt caching and model routing tuned for cost and latency, using the Vercel AI SDK and Amazon Bedrock. " +
      "He also fine-tunes open-weight models with LoRA/QLoRA and PEFT in PyTorch and Hugging Face, uses distillation and synthetic data, and serves models on fast GPU inference with vLLM and Ollama.",
  },
  {
    id: "ai-quality",
    title: "Evals, guardrails and multimodal AI",
    source: "AI Engineering",
    text:
      "To ship AI safely Daniel runs LLM-as-judge evals, red-teaming, PII guardrails and tracing with LangSmith, Langfuse, Promptfoo and OpenTelemetry. " +
      "He also builds multimodal and voice experiences (real-time voice agents, speech-to-text with Whisper, the Realtime API, text-to-speech, vision and document understanding over WebRTC) and uses AI coding agents such as Claude Code, Cursor, Playwright and computer-use automation in his workflow.",
  },
  ...PROJECTS.map((p) => ({
    id: `project-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title: `Project: ${p.name}`,
    source: "Projects",
    text: `${p.name} (${p.url}): ${p.blurb} Tech stack: ${p.stack.join(", ")}.`,
  })),
  {
    id: "contact",
    title: "Contact",
    source: "Contact",
    text:
      `You can reach Daniel by email at ${PROFILE.email} or by phone at ${PROFILE.phone}. He is based in ${PROFILE.location}. ` +
      `Profiles: LinkedIn ${PROFILE.links.linkedin}, GitHub ${PROFILE.links.github}, Bluesky ${PROFILE.links.bluesky}, LeetCode ${PROFILE.links.leetcode}.`,
  },
  {
    id: "ai-lab",
    title: "How this AI Lab works",
    source: "AI Lab",
    text:
      "The AI Lab on this portfolio is a working demo built by Daniel. It runs on Netlify Functions that call the Anthropic Claude API. " +
      "The Agent demo uses native tool use with a visible tool-call trace; the RAG demo retrieves passages from this knowledge base with BM25 scoring and answers with numbered citations; " +
      "the Job Match demo returns a structured JSON analysis using schema-constrained structured outputs; and the Guardrails demo runs a classification pass for prompt injection and PII before answering.",
  },
];

export function experienceSummary() {
  return EXPERIENCE.map((e) => `${e.org}: ${e.role} (${e.start} to ${e.end})`).join("\n");
}

export function skillsSummary() {
  return SKILLS.map((s) => `${s.name} (${s.years}+ years)`).join(", ");
}

export function capabilitiesSummary() {
  return AI_CAPABILITIES.map((c) => `${c.name}: ${c.tools.join(", ")}`).join("\n");
}

export function projectsSummary() {
  return PROJECTS.map((p) => `${p.name} [${p.stack.join(", ")}] ${p.url}`).join("\n");
}
