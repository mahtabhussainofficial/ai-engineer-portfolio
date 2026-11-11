export type SkillLayerId = "ai" | "backend" | "delivery";

export interface SkillGroupRecord {
  readonly id: string;
  readonly layer: SkillLayerId;
  readonly number: string;
  readonly domain: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
}

export interface SkillLayerMeta {
  readonly id: SkillLayerId;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}

export const SKILL_LAYERS: readonly SkillLayerMeta[] = [
  {
    id: "ai",
    eyebrow: "LAYER 01 / INTELLIGENCE",
    title: "AI & LLM Engineering",
    description:
      "Core AI paradigms, retrieval architectures, and model interfaces.",
  },
  {
    id: "backend",
    eyebrow: "LAYER 02 / APPLICATION & DATA",
    title: "Backend & Persistence",
    description:
      "Languages, typed API services, and structured database systems.",
  },
  {
    id: "delivery",
    eyebrow: "LAYER 03 / RUNTIME & TOOLING",
    title: "Infrastructure & Workflow",
    description:
      "Multi-agent tooling, containerization, and day-to-day delivery.",
  },
];

/**
 * Initial skill groups structured for future management from a portfolio dashboard/CMS.
 * Swap `getSkillGroups` to query your database without modifying page components.
 */
export const SKILL_GROUPS: readonly SkillGroupRecord[] = [
  {
    id: "skill-ai-ml",
    layer: "ai",
    number: "01",
    domain: "INTELLIGENCE",
    title: "AI & Machine Learning",
    description:
      "Core concepts and application patterns for turning models into useful product capabilities.",
    items: [
      "Artificial Intelligence",
      "Machine Learning",
      "Generative AI",
      "Automation",
    ],
  },
  {
    id: "skill-llm-engineering",
    layer: "ai",
    number: "02",
    domain: "LLM SYSTEMS",
    title: "LLMs & AI Engineering",
    description:
      "Practical building blocks for grounded, tool-using, and context-aware intelligent systems.",
    items: [
      "Prompt Engineering",
      "Retrieval Augmented Generation",
      "AI Chatbot",
      "Large Language Model",
      "LangChain",
      "AI Agent Development",
      "OpenAI API",
      "Claude API",
    ],
  },
  {
    id: "skill-languages",
    layer: "backend",
    number: "03",
    domain: "CORE LANGUAGES",
    title: "Programming Languages",
    description:
      "Languages used to shape AI products, application logic, and maintainable foundations.",
    items: ["Python", "JavaScript", "TypeScript"],
  },
  {
    id: "skill-backend",
    layer: "backend",
    number: "04",
    domain: "API LAYER",
    title: "Backend Development",
    description:
      "Tools for building clear service boundaries, APIs, validation, and reliable behavior.",
    items: [
      "FastAPI",
      "Django",
      "REST APIs",
      "Pydantic",
      "Full-Stack Development",
    ],
  },
  {
    id: "skill-databases",
    layer: "backend",
    number: "05",
    domain: "PERSISTENCE",
    title: "Databases",
    description:
      "Persistence and data foundations for structured, reliable application storage.",
    items: ["PostgreSQL", "MongoDB", "Redis"],
  },
  {
    id: "skill-devops",
    layer: "delivery",
    number: "06",
    domain: "INFRASTRUCTURE",
    title: "DevOps & Cloud",
    description:
      "Delivery and runtime tools that support repeatable builds and dependable deployments.",
    items: [
      "DevOps Engineering",
      "Docker",
      "Linux",
      "Cloud Platforms",
      "Environment Configuration",
    ],
  },
  {
    id: "skill-workflow",
    layer: "delivery",
    number: "07",
    domain: "ORCHESTRATION & WORKFLOW",
    title: "Tools & Development Workflow",
    description:
      "Frameworks and engineering practices for multi-agent orchestration, documentation, and testing.",
    items: [
      "CrewAI",
      "OpenClaw",
      "Git",
      "GitHub",
      "API Documentation",
      "Testing Workflows",
      "Chatbot Development",
      "Business Process Automation",
    ],
  },
];

export function getSkillGroups(): readonly SkillGroupRecord[] {
  return SKILL_GROUPS;
}

export function getSkillLayers(): readonly SkillLayerMeta[] {
  return SKILL_LAYERS;
}

export function getTotalSkillCount(): number {
  return SKILL_GROUPS.reduce((sum, group) => sum + group.items.length, 0);
}
