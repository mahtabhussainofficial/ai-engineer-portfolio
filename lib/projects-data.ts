export type ProjectCategory =
  | "AI & Machine Learning"
  | "Agentic AI & Automation"
  | "Backend & API Development"
  | "Full-Stack Applications";

export const PROJECT_CATEGORIES = [
  "All Projects",
  "AI & Machine Learning",
  "Agentic AI & Automation",
  "Backend & API Development",
  "Full-Stack Applications",
] as const;

export type ProjectFilterCategory = (typeof PROJECT_CATEGORIES)[number];

export interface ProjectRecord {
  readonly id: string;
  readonly slug: string;
  readonly number: string;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly homeCategoryLabel: string;
  readonly status: "Concept Brief" | "Case Study";
  readonly featured: boolean;
  readonly summary: string;
  readonly problem: string;
  readonly solution: string;
  readonly deliverables: readonly string[];
  readonly tags: readonly string[];
  readonly liveUrl?: string;
  readonly repoUrl?: string;
}

/**
 * Initial project records structured for future replacement by a dashboard/CMS data source.
 * Swap `getProjects`, `getFeaturedProjects`, and `getProjectBySlug` to query your database
 * without modifying route components.
 */
export const PROJECTS: readonly ProjectRecord[] = [
  {
    id: "proj-knowledge-assistant",
    slug: "knowledge-assistant",
    number: "01",
    title: "Knowledge Assistant",
    category: "AI & Machine Learning",
    homeCategoryLabel: "RAG / KNOWLEDGE AI",
    status: "Concept Brief",
    featured: true,
    summary:
      "A RAG-based assistant architecture for answering questions from trusted business documents.",
    problem:
      "Teams often struggle to find reliable answers across scattered PDFs, internal guides, and operational documents without risking generic or hallucinated AI responses.",
    solution:
      "Designed a retrieval-augmented generation pipeline that chunks, indexes, and retrieves relevant source passages first, constraining model answers strictly to verified context with source references.",
    deliverables: [
      "Document ingestion and chunking pipeline with metadata filtering",
      "FastAPI query service enforcing grounded, structured responses",
      "Vector retrieval layer built for accurate semantic + keyword lookup",
    ],
    tags: ["Python", "FastAPI", "RAG"],
  },
  {
    id: "proj-workflow-automation",
    slug: "workflow-automation",
    number: "02",
    title: "Workflow Automation",
    category: "Agentic AI & Automation",
    homeCategoryLabel: "AGENTIC AI",
    status: "Concept Brief",
    featured: true,
    summary:
      "Agentic workflow architecture connected to business tools, APIs, and human approval steps.",
    problem:
      "Repetitive multi-step operational tasks across email, ticketing, and internal databases create bottlenecks, while fully autonomous actions introduce unacceptable business risk.",
    solution:
      "Structured an agentic workflow with deterministic tool calling, schema-validated step outputs, and explicit human-in-the-loop approval checkpoints before committing sensitive updates.",
    deliverables: [
      "Tool-calling orchestration connecting external REST APIs and webhooks",
      "Validation schemas and retry handling for reliable multi-step execution",
      "Approval pause/resume flow for sensitive operational actions",
    ],
    tags: ["AI Agents", "APIs", "Human Review"],
  },
  {
    id: "proj-ai-backend-platform",
    slug: "ai-backend-platform",
    number: "03",
    title: "AI Backend Platform",
    category: "Backend & API Development",
    homeCategoryLabel: "FULL-STACK AI",
    status: "Concept Brief",
    featured: true,
    summary:
      "A practical application combining AI capabilities, structured data, and a dependable backend foundation.",
    problem:
      "AI prototypes frequently fail in production because they lack persistent state, clean API boundaries, request validation, and reproducible deployment environments.",
    solution:
      "Architected a modular Python backend separating LLM inference services from transactional persistence, background jobs, and containerized runtime configuration.",
    deliverables: [
      "Typed REST API layer with Pydantic validation and clear error contracts",
      "PostgreSQL persistence schema for users, jobs, and audit trails",
      "Containerized Docker setup for consistent local and cloud deployment",
    ],
    tags: ["Python", "PostgreSQL", "Docker"],
  },
  {
    id: "proj-document-intake-portal",
    slug: "document-intake-portal",
    number: "04",
    title: "Document Intake & Review Portal",
    category: "Full-Stack Applications",
    homeCategoryLabel: "FULL-STACK",
    status: "Concept Brief",
    featured: false,
    summary:
      "An end-to-end web workspace combining automated PDF extraction, validation queues, and ERP-ready export.",
    problem:
      "Operations teams reviewing incoming invoices and forms manually spend hours copying structured fields into downstream tracking systems.",
    solution:
      "Combined an OCR and LLM extraction backend with a clean review interface where operators inspect extracted fields, resolve low-confidence values, and approve clean records.",
    deliverables: [
      "Automated PDF parsing and structured JSON extraction pipeline",
      "Operator review dashboard with confidence highlights and edit controls",
      "Webhook and CSV/API export connectors for ERP synchronization",
    ],
    tags: ["Next.js", "Python", "OCR"],
  },
];

export function getProjects(): readonly ProjectRecord[] {
  return PROJECTS;
}

export function getFeaturedProjects(): readonly ProjectRecord[] {
  return PROJECTS.filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): ProjectRecord | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
