export type ServiceCategory =
  | "Agents & Voice"
  | "Knowledge & Documents"
  | "LLMs & Evaluation"
  | "Backend & Data";

export const SERVICE_CATEGORIES = [
  "All Services",
  "Agents & Voice",
  "Knowledge & Documents",
  "LLMs & Evaluation",
  "Backend & Data",
] as const;

export type ServiceFilterCategory = (typeof SERVICE_CATEGORIES)[number];

export interface ServiceRecord {
  readonly id: string;
  readonly number: string;
  readonly category: ServiceCategory;
  readonly domain: string;
  readonly title: string;
  readonly description: string;
  readonly tools: readonly string[];
}

export interface ProcessStepRecord {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Initial services catalog structured for future management from a portfolio dashboard/CMS.
 * Swap `getServices` and `getProcessSteps` to query your database without editing UI components.
 */
export const SERVICES: readonly ServiceRecord[] = [
  {
    id: "svc-agentic-ai",
    number: "01",
    category: "Agents & Voice",
    domain: "AUTOMATION",
    title: "Agentic AI & Workflow Automation",
    description:
      "Multi-agent systems and business workflows that connect tools, APIs, databases, and human approvals.",
    tools: ["LangChain", "LangGraph", "CrewAI", "n8n"],
  },
  {
    id: "svc-voice-ai",
    number: "02",
    category: "Agents & Voice",
    domain: "VOICE & CHAT",
    title: "Voice AI & Conversational Agents",
    description:
      "Real-time voice and chat experiences for support, sales, and natural customer conversations.",
    tools: ["Retell AI", "OpenAI Realtime", "ElevenLabs", "Whisper"],
  },
  {
    id: "svc-rag-systems",
    number: "03",
    category: "Knowledge & Documents",
    domain: "KNOWLEDGE AI",
    title: "RAG Systems & Knowledge AI",
    description:
      "Accurate assistants grounded in documents, databases, and business knowledge.",
    tools: ["Pinecone", "Weaviate", "ChromaDB", "Hybrid Search"],
  },
  {
    id: "svc-doc-intelligence",
    number: "04",
    category: "Knowledge & Documents",
    domain: "DOCUMENTS & ERP",
    title: "Document Intelligence & ERP Integration",
    description:
      "OCR, PDF extraction, and document workflows connected to ERP and business systems.",
    tools: ["OCR", "PDF Parsing", "NetSuite", "Oracle"],
  },
  {
    id: "svc-llm-engineering",
    number: "05",
    category: "LLMs & Evaluation",
    domain: "LLM ENGINEERING",
    title: "LLM Integration, Fine-Tuning & Prompt Engineering",
    description:
      "Model selection, structured outputs, function calling, and prompt architecture for focused use cases.",
    tools: ["OpenAI", "Claude", "Gemini", "LoRA / QLoRA"],
  },
  {
    id: "svc-observability",
    number: "06",
    category: "LLMs & Evaluation",
    domain: "EVALUATION",
    title: "Observability & LLM Evaluation",
    description:
      "Tracing, prompt testing, evaluation, and monitoring that make AI behavior easier to improve.",
    tools: ["LangSmith", "Logfire", "Arize Phoenix", "DeepEval"],
  },
  {
    id: "svc-fullstack-ai",
    number: "07",
    category: "Backend & Data",
    domain: "FULL-STACK & APIS",
    title: "Full-Stack AI Applications & Backend",
    description:
      "Production-minded AI applications and APIs built with Python, FastAPI, and modern web tooling.",
    tools: ["Python", "FastAPI", "Django", "Docker"],
  },
  {
    id: "svc-data-integrations",
    number: "08",
    category: "Backend & Data",
    domain: "DATA & INTEGRATIONS",
    title: "Data, Databases & Integrations",
    description:
      "Data pipelines, persistence, and integrations that keep products connected to the systems they depend on.",
    tools: ["PostgreSQL", "MongoDB", "Redis", "REST / GraphQL"],
  },
];

export const PROCESS_STEPS: readonly ProcessStepRecord[] = [
  {
    number: "01",
    title: "Understand the problem",
    description:
      "Clarify goals, users, constraints, and data before choosing a direction.",
  },
  {
    number: "02",
    title: "Plan the solution",
    description:
      "Shape system boundaries and delivery around the actual problem.",
  },
  {
    number: "03",
    title: "Build and integrate",
    description:
      "Implement the experience and connect the APIs, data, and systems it needs.",
  },
  {
    number: "04",
    title: "Test and improve",
    description:
      "Evaluate behavior, strengthen reliability, and use feedback to guide iteration.",
  },
];

export function getServices(): readonly ServiceRecord[] {
  return SERVICES;
}

export function getProcessSteps(): readonly ProcessStepRecord[] {
  return PROCESS_STEPS;
}
