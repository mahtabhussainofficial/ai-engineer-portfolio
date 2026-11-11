export interface AboutProfileRecord {
  readonly eyebrow: string;
  readonly headlinePrimary: string;
  readonly headlineSecondary: string;
  readonly portraitCaption: string;
  readonly portraitAlt: string;
  readonly bioParagraphs: readonly string[];
}

export interface ApproachPrincipleRecord {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

/**
 * About page profile & engineering principles structured for future FastAPI / PostgreSQL integration.
 */
export const ABOUT_PROFILE: AboutProfileRecord = {
  eyebrow: "ABOUT / PROFESSIONAL BIO",
  headlinePrimary: "Practical AI engineering,",
  headlineSecondary: "built on solid backend craft.",
  portraitCaption: "SHABNUM H. · AI & BACKEND",
  portraitAlt: "Portrait of Shabnum H., AI Engineer and Backend Developer",
  bioParagraphs: [
    "I'm Shabnum H., an AI Engineer and Backend Developer focused on turning everyday operational bottlenecks into reliable software. My work connects applied AI—RAG pipelines, tool-using agents, and workflow automation—with clean Python services and dependable APIs.",
    "I care far more about production reliability than flashy demos: grounding answers in trusted business data, enforcing structured outputs, keeping humans in the loop for sensitive actions, and leaving codebases clear enough for teams to build on.",
  ],
};

export const APPROACH_PRINCIPLES: readonly ApproachPrincipleRecord[] = [
  {
    id: "principle-problem",
    number: "01",
    title: "Start with the problem",
    description:
      "Clarify workflows, edge cases, and data quality before choosing a model or framework.",
  },
  {
    id: "principle-predictable",
    number: "02",
    title: "Make AI predictable",
    description:
      "Rely on retrieval grounding, strict schemas, and testing loops rather than prompt guesswork.",
  },
  {
    id: "principle-foundations",
    number: "03",
    title: "Build clean foundations",
    description:
      "Pair AI logic with modular FastAPI services, clear database models, and observable behavior.",
  },
];

export function getAboutProfile(): AboutProfileRecord {
  return ABOUT_PROFILE;
}

export function getApproachPrinciples(): readonly ApproachPrincipleRecord[] {
  return APPROACH_PRINCIPLES;
}
