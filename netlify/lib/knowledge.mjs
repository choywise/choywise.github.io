// Knowledge base for the AI assistant.
//
// Sources: the portfolio page (index.html) and Daniel's resume. Keep it
// factual: the chat and the fit/draft features answer ONLY from this file,
// so if you want the assistant to know something new, add it here.

export const PROFILE = {
  name: "Daniel Choi",
  title: "Senior Full Stack AI Engineer | Tech Lead",
  location: "Aurora, CO 80015",
  email: "danielchoi@engineer.com",
  phone: "(814) 351-9376",
  site: "https://dancho14.netlify.app/",
  summary:
    "Full Stack AI Engineer with 10+ years of experience shipping products end to end across backend services, frontend applications, cloud infrastructure and AI integration. " +
    "Has built NLP pipelines, AI-powered automation tools and LLM-driven features in production. Focuses on clean code, tested systems and clear communication.",
  links: {
    linkedin: "https://www.linkedin.com/in/choiwise/",
    github: "https://github.com/choywise",
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
    highlights: [],
  },
  {
    org: "Google",
    role: "Software Engineering Intern, then Software Engineer II (L3) promoted to Software Engineer III (L4)",
    start: "Jun 2013",
    end: "Jun 2016",
    type: "work",
    highlights: [
      "Google Now backend services for voice recognition, predictive search and personalized notifications serving millions of daily users",
      "Reduced latency by 25% by optimizing NLP processing in C++ and Python",
      "Integrated services with Google Cloud Platform for large-scale data processing and high-concurrency workloads",
      "Productionized ML models with data scientists, improving prediction accuracy and inference speed",
    ],
  },
  {
    org: "Toptal",
    role: "Full Stack Software Developer (freelance, multiple client engagements)",
    start: "Aug 2016",
    end: "Mar 2020",
    type: "work",
    highlights: [
      "Backend services in Ruby on Rails and Node.js for a fashion outlet serving millions of members across 20+ markets",
      "Optimized database queries, payment integrations and AWS infrastructure",
      "Migrated a legacy AngularJS app to React/Next.js and built event-planning features (multistep forms, guest management, headless CMS)",
      "Frontend for an AI-powered video creation platform in React",
      "Intent detection and rule-based chatbot flows in Python and Node.js, with human handoff for low-confidence cases",
    ],
  },
  {
    org: "Olive AI",
    role: "Senior Software Engineer",
    start: "Jul 2020",
    end: "Sep 2023",
    type: "work",
    highlights: [
      "Built and maintained the AI and RPA platform that connected fragmented healthcare systems to automate administrative workflows across 900+ hospitals",
      "Led migration of a monolithic backend to AWS microservices (Lambda, SQS, API Gateway), improving availability and reducing operating costs",
      "Built data synchronization pipelines across EMR, EHR and payer-portal integrations with Python and AWS",
      "Led frontend architecture for internal dashboards and operations tooling (React, TypeScript, Webpack) used to monitor automation across hundreds of hospital systems",
      "Frontend performance work: bundle splitting, lazy loading and virtualization for data-heavy views",
      "Infrastructure as code with Terraform and CloudFormation across development, staging and production",
    ],
  },
  {
    org: "Sigma AI",
    role: "Senior Software Engineer | Tech Lead",
    start: "Nov 2023",
    end: "Present",
    type: "work",
    highlights: [
      "Owns frontend and backend architecture for AI products built with React, TypeScript, Next.js, Node.js and Python on AWS and GCP",
      "Implemented a micro-frontend architecture so independent teams can develop, test and deploy product modules",
      "Built an AI sales assistant that automates CRM updates and follow-up sequences for sales teams",
      "NLP pipelines with LangChain and Hugging Face for document processing across client engagements",
      "Designs and maintains GraphQL and REST APIs, CI/CD pipelines and unit/integration test coverage",
      "Mentors junior engineers on architecture decisions and delivery standards",
    ],
  },
];

// Core skills with years of experience, as listed on the Skills section.
export const SKILLS = [
  { name: "React.js", years: 8, aliases: ["react", "reactjs", "react.js"] },
  { name: "Next.js", years: 6, aliases: ["next", "nextjs", "next.js"] },
  { name: "Vue.js", years: 5, aliases: ["vue", "vuejs", "vue.js", "nuxt"] },
  { name: "Angular", years: 4, aliases: ["angular", "angularjs"] },
  { name: "Node.js", years: 8, aliases: ["node", "nodejs", "node.js", "express", "expressjs", "nestjs", "nest"] },
  { name: "Python", years: 7, aliases: ["python", "fastapi", "django", "flask"] },
  { name: "Ruby on Rails", years: 4, aliases: ["ruby", "rails", "ruby on rails", "ror"] },
  { name: "SQL/NoSQL", years: 9, aliases: ["sql", "nosql", "postgres", "postgresql", "mysql", "mongodb", "mongo", "database", "databases", "dynamodb", "redis", "elasticsearch"] },
  { name: "TypeScript", years: 6, aliases: ["typescript", "ts"] },
  { name: "JavaScript", years: 10, aliases: ["javascript", "js", "es6"] },
];

// Additional technologies from the resume (no year counts on the site).
export const TECH = [
  { name: "Go", aliases: ["go", "golang"], context: "backend services" },
  { name: "C++", aliases: ["c++", "cpp"], context: "NLP latency work at Google" },
  { name: "GraphQL", aliases: ["graphql", "apollo"], context: "APIs at Sigma AI" },
  { name: "REST APIs", aliases: ["rest", "rest api", "rest apis", "api design"], context: "APIs across every role" },
  { name: "Supabase", aliases: ["supabase"], context: "backend services" },
  { name: "Firebase", aliases: ["firebase"], context: "backend services" },
  { name: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"], context: "frontend" },
  { name: "Component libraries", aliases: ["mui", "material ui", "chakra", "chakra ui", "shadcn", "radix", "radix ui"], context: "frontend" },
  { name: "LangChain", aliases: ["langchain"], context: "NLP pipelines at Sigma AI" },
  { name: "LangGraph", aliases: ["langgraph"], context: "agent workflows" },
  { name: "Hugging Face", aliases: ["hugging face", "huggingface", "transformers"], context: "NLP pipelines at Sigma AI" },
  { name: "PyTorch", aliases: ["pytorch", "torch"], context: "ML work" },
  { name: "TensorFlow", aliases: ["tensorflow", "tf"], context: "ML work" },
  { name: "CI/CD", aliases: ["ci/cd", "ci", "cicd", "jenkins", "github actions", "gitlab ci", "circleci", "pipelines"], context: "Jenkins, GitHub Actions, GitLab CI, CircleCI" },
  { name: "Message queues", aliases: ["rabbitmq", "kafka", "sqs", "message queue", "event-driven", "event driven"], context: "RabbitMQ, Kafka and AWS SQS" },
  { name: "AWS", aliases: ["aws", "lambda", "api gateway", "cloudformation", "serverless"], context: "serverless migration and infrastructure at Olive AI and Sigma AI" },
  { name: "GCP", aliases: ["gcp", "google cloud", "google cloud platform"], context: "Google and Sigma AI" },
  { name: "Terraform", aliases: ["terraform", "infrastructure as code", "iac"], context: "infrastructure as code at Olive AI" },
  { name: "Micro frontends", aliases: ["micro frontend", "micro-frontend", "microfrontend", "micro frontends", "module federation"], context: "architecture at Sigma AI" },
  { name: "Healthcare integrations", aliases: ["emr", "ehr", "hl7", "fhir", "healthcare", "payer"], context: "Olive AI and hellocare" },
  { name: "Chatbots", aliases: ["chatbot", "chatbots", "intent detection", "conversational"], context: "intent detection and rule-based flows at Toptal, AI sales assistant at Sigma AI" },
  { name: "Webpack", aliases: ["webpack", "vite", "bundling"], context: "frontend tooling" },
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
    aliases: ["voice", "speech", "speech-to-text", "stt", "tts", "whisper", "realtime", "vision", "multimodal", "webrtc", "audio", "nlp", "natural language processing"],
  },
  {
    name: "AI Coding & Computer-Use Agents",
    summary: "Agentic coding workflows and browser automation that take tasks from spec to tested pull request.",
    tools: ["Claude Code", "Cursor", "Playwright", "Computer Use", "CI/CD"],
    aliases: ["claude code", "cursor", "playwright", "computer use", "browser automation", "coding agent", "automation", "rpa"],
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
    blurb: "Fashion outlet serving millions of members across 20+ markets: backend services, database and payment optimization, and a Next.js storefront with search.",
    stack: ["Next.js", "Node.js", "Ruby on Rails", "FastAPI", "MongoDB", "TanStack Query", "Tailwind", "Algolia", "AWS"],
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
// Retrieval chunks. Each chunk is a self-contained passage the chat can cite.
// `title` and `source` are shown to visitors, so keep them readable.
// ---------------------------------------------------------------------------
export const CHUNKS = [
  {
    id: "profile",
    title: "Profile",
    source: "About",
    text:
      "Daniel Choi is a Senior Full Stack AI Engineer and Tech Lead based in Aurora, Colorado, with 10+ years of experience (since 2013) shipping products end to end across backend services, frontend applications, cloud infrastructure and AI integration. " +
      "He has built NLP pipelines, AI-powered automation tools and LLM-driven features in production, and focuses on clean code, tested systems and clear communication. " +
      "Languages: JavaScript, TypeScript, Python, Ruby, Go and SQL.",
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
      "Daniel joined Google as a Software Engineering Intern in June 2013, supporting backend performance and reliability improvements for Google Now during a 12-week internship. " +
      "He converted to full time in August 2013 as Software Engineer II (L3) and was promoted to Software Engineer III (L4) after his first year, staying until June 2016. " +
      "He contributed to Google Now backend services for voice recognition, predictive search and personalized notifications serving millions of daily users; reduced latency by 25% by optimizing NLP processing in C++ and Python; " +
      "integrated services with Google Cloud Platform for large-scale data processing and high-concurrency workloads; and collaborated with data scientists to productionize ML models, improving prediction accuracy and inference speed.",
  },
  {
    id: "toptal",
    title: "Toptal (2016 to 2020)",
    source: "Experience",
    text:
      "From August 2016 to March 2020 Daniel worked as a freelance Full Stack Software Developer through Toptal, delivering full-stack work across multiple client engagements. " +
      "Highlights: backend services in Ruby on Rails and Node.js for a fashion outlet serving millions of members across 20+ markets, including database query, payment integration and AWS infrastructure optimization; " +
      "migrating a legacy AngularJS application to React/Next.js and building event-planning features such as multistep forms, guest management and headless CMS integration; " +
      "frontend development in React for an AI-powered video creation platform; and building intent detection and rule-based chatbot flows in Python and Node.js that connected automated actions to backend systems, with human handoff for low-confidence cases.",
  },
  {
    id: "olive",
    title: "Olive AI (2020 to 2023)",
    source: "Experience",
    text:
      "From July 2020 to September 2023 Daniel was a Senior Software Engineer at Olive AI, a $4B healthcare automation company that used AI and RPA to automate administrative workflows across 900+ hospitals (operations wound down in late 2023). " +
      "He built and maintained the AI and RPA platform that connected fragmented healthcare systems; led the migration of a monolithic backend to AWS microservices using Lambda, SQS and API Gateway, improving availability and reducing operating costs; " +
      "built data synchronization pipelines across EMR, EHR and payer-portal integrations with Python and AWS; led frontend architecture for internal dashboards and operations tooling in React, TypeScript and Webpack used by teams monitoring automation across hundreds of hospital systems; " +
      "drove frontend performance work (bundle splitting, lazy loading, virtualization for data-heavy views); and managed infrastructure as code with Terraform and CloudFormation across development, staging and production.",
  },
  {
    id: "sigma",
    title: "Sigma AI (2023 to present)",
    source: "Experience",
    text:
      "Since November 2023 Daniel has been a Senior Software Engineer and Tech Lead at Sigma AI. He owns frontend and backend architecture for AI products built with React, TypeScript, Next.js, Node.js and Python on AWS and GCP; " +
      "implemented a micro-frontend architecture that lets independent teams develop, test and deploy product modules; built an AI sales assistant that automates CRM updates and follow-up sequences for sales teams; " +
      "implemented NLP pipelines with LangChain and Hugging Face for document processing across client engagements; designs and maintains GraphQL and REST APIs, CI/CD pipelines and unit/integration test coverage; and mentors junior engineers on architecture decisions and delivery standards.",
  },
  {
    id: "ai-shipped",
    title: "AI work shipped to production",
    source: "Experience",
    text:
      "Production AI work Daniel has shipped: an AI sales assistant at Sigma AI that automates CRM updates and follow-up sequences; NLP document-processing pipelines with LangChain and Hugging Face; " +
      "the AI and RPA automation platform at Olive AI connecting healthcare systems across 900+ hospitals; intent-detection chatbot flows with human handoff for Toptal clients; " +
      "NLP latency optimization and productionizing ML models for Google Now; and the Donna product combining speech-to-text and LLM features over real-time WebSockets.",
  },
  {
    id: "skills-frontend",
    title: "Frontend skills",
    source: "Skills",
    text:
      "Frontend: React.js (8+ years), Next.js (6+ years), Vue.js (5+ years) and Angular (4+ years), with TypeScript and modern JavaScript. " +
      "Styling and component libraries: Tailwind CSS, MUI, Chakra UI, Shadcn and Radix UI. Architecture experience includes micro frontends, design systems, Webpack/Vite tooling and performance optimization (bundle splitting, lazy loading, virtualization).",
  },
  {
    id: "skills-backend",
    title: "Backend and data skills",
    source: "Skills",
    text:
      "Backend: Node.js (8+ years) with Express and NestJS, Python (7+ years) with FastAPI, Django and Flask, Ruby on Rails (4+ years), Go, and GraphQL and REST API design. " +
      "Data: SQL and NoSQL (9+ years) including PostgreSQL, MySQL, MongoDB, DynamoDB, Redis and Elasticsearch; messaging with Kafka, RabbitMQ and AWS SQS; backend-as-a-service with Supabase and Firebase.",
  },
  {
    id: "skills-infra",
    title: "Cloud, infrastructure and delivery",
    source: "Skills",
    text:
      "Cloud and infrastructure: AWS (Lambda, SQS, API Gateway, CloudFormation), GCP, Azure, Vercel, Docker and Kubernetes; infrastructure as code with Terraform. " +
      "CI/CD with Jenkins, GitHub Actions, GitLab CI and CircleCI, plus unit and integration test coverage across services.",
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
      "He also fine-tunes open-weight models with LoRA/QLoRA and PEFT in PyTorch and Hugging Face, uses distillation and synthetic data, works with TensorFlow, and serves models on fast GPU inference with vLLM and Ollama.",
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
    id: "leadership",
    title: "Leadership and ways of working",
    source: "Experience",
    text:
      "As Tech Lead at Sigma AI, Daniel owns architecture decisions across frontend and backend, mentors junior engineers on architecture and delivery standards, and maintains CI/CD pipelines and test coverage. " +
      "At Olive AI he led a monolith-to-microservices migration and the frontend architecture for operations tooling. He values clean code, tested systems and clear communication.",
  },
  {
    id: "contact",
    title: "Contact",
    source: "Contact",
    text:
      `You can reach Daniel by email at ${PROFILE.email} or by phone at ${PROFILE.phone}. He is based in ${PROFILE.location}. ` +
      `Profiles: LinkedIn ${PROFILE.links.linkedin}, GitHub ${PROFILE.links.github}, LeetCode ${PROFILE.links.leetcode}.`,
  },
  {
    id: "ai-lab",
    title: "How this assistant works",
    source: "AI Assistant",
    text:
      "This assistant on the portfolio is a working feature built by Daniel. It runs on Netlify Functions that call the Anthropic Claude API. " +
      "The chat is a tool-using agent that searches this knowledge base with BM25 scoring and shows its sources; the Project fit feature returns a structured assessment using schema-constrained outputs; " +
      "the Draft a message feature turns notes into an email that opens in the visitor's own mail client.",
  },
];

export function experienceSummary() {
  return EXPERIENCE.map((e) => {
    const head = `${e.org}: ${e.role} (${e.start} to ${e.end})`;
    return e.highlights && e.highlights.length ? `${head}\n  - ${e.highlights.join("\n  - ")}` : head;
  }).join("\n");
}

export function skillsSummary() {
  const core = SKILLS.map((s) => `${s.name} (${s.years}+ years)`).join(", ");
  const extra = TECH.map((t) => t.name).join(", ");
  return `${core}. Also: ${extra}`;
}

export function capabilitiesSummary() {
  return AI_CAPABILITIES.map((c) => `${c.name}: ${c.tools.join(", ")}`).join("\n");
}

export function projectsSummary() {
  return PROJECTS.map((p) => `${p.name} [${p.stack.join(", ")}] ${p.url}`).join("\n");
}
