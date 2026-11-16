export interface ExperienceRecord {
  readonly id: string;
  readonly period: string;
  readonly role: string;
  readonly organization: string;
  readonly summary: string;
  readonly displayOrder: number;
}

export interface EducationRecord {
  readonly id: string;
  readonly period: string;
  readonly degree: string;
  readonly institution: string;
  readonly tag?: string;
  readonly displayOrder: number;
}

export interface CertificationRecord {
  readonly id: string;
  readonly year: string;
  readonly title: string;
  readonly issuer: string;
  readonly tag?: string;
  readonly displayOrder: number;
}

/**
 * Career timeline, academic credentials, and certifications structured to map cleanly
 * to SQLAlchemy models and FastAPI `/experience` admin endpoints.
 */
export const CAREER_JOURNEY: readonly ExperienceRecord[] = [
  {
    id: "exp-independent",
    period: "2023 — Present",
    role: "AI Systems Engineer & Backend Consultant",
    organization: "Independent Practice",
    summary:
      "Delivering production multi-agent workflows, grounded RAG retrieval systems, and high-reliability Python APIs for international clients.",
    displayOrder: 1,
  },
  {
    id: "exp-product-studio",
    period: "2021 — 2023",
    role: "Backend & AI Integration Developer",
    organization: "Enterprise AI & Cloud Systems",
    summary:
      "Engineered typed FastAPI microservices, document extraction pipelines, and PostgreSQL data persistence layers.",
    displayOrder: 2,
  },
  {
    id: "exp-engineering-team",
    period: "2019 — 2021",
    role: "Software & Automation Engineer",
    organization: "Software Engineering Practice",
    summary:
      "Developed business automation pipelines, REST integrations, and high-throughput background job processing.",
    displayOrder: 3,
  },
];

export const EDUCATION_ENTRIES: readonly EducationRecord[] = [
  {
    id: "edu-cs-bs",
    period: "2015 — 2019",
    degree: "B.S. in Computer Science",
    institution: "COMSATS University Islamabad",
    tag: "Accredited CS Degree",
    displayOrder: 1,
  },
];

export const CERTIFICATION_ENTRIES: readonly CertificationRecord[] = [
  {
    id: "cert-llm-agents",
    year: "2024",
    title: "LLM Engineering & Agentic Workflows",
    issuer: "DeepLearning.AI",
    tag: "LangChain & Multi-Agent Architecture",
    displayOrder: 1,
  },
  {
    id: "cert-python-fastapi",
    year: "2023",
    title: "Backend Architecture with Python & FastAPI",
    issuer: "Meta / Python Software Foundation",
    tag: "Typed APIs & PostgreSQL Schema",
    displayOrder: 2,
  },
];

export function getCareerJourney(): readonly ExperienceRecord[] {
  return CAREER_JOURNEY;
}

export function getEducationEntries(): readonly EducationRecord[] {
  return EDUCATION_ENTRIES;
}

export function getCertificationEntries(): readonly CertificationRecord[] {
  return CERTIFICATION_ENTRIES;
}
