export type SocialIconName = "mail" | "linkedin" | "github" | "briefcase";

export interface ConnectChannel {
  readonly id: string;
  readonly label: string;
  readonly handlePlaceholder: string;
  readonly icon: SocialIconName;
  readonly href?: string;
  readonly external?: boolean;
  readonly status?: "soon";
}

export interface SiteProfile {
  readonly initials: string;
  readonly ownerName: string;
  readonly brandName: string;
  readonly tagline: string;
  readonly metaTitleDefault: string;
  readonly metaTitleTemplate: string;
  readonly metaDescription: string;
  readonly directEmail: string | undefined;
  readonly cvUrl: string | undefined;
  readonly techNote: string;
  readonly copyrightYear: number;
  readonly copyrightNote: string;
}

export interface HeroContent {
  readonly eyebrow: string;
  readonly headingPrimary: string;
  readonly headingSecondary: string;
  readonly summary: string;
  readonly specializations: readonly string[];
  readonly portraitAlt: string;
}

export interface HomeAboutPreview {
  readonly eyebrow: string;
  readonly sideNote: string;
  readonly title: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
}

export interface ProfileHighlightRecord {
  readonly id: string;
  readonly index: string;
  readonly value: string;
  readonly suffix?: string;
  readonly label: string;
}

export interface FeedbackRecord {
  readonly id: string;
  readonly title: string;
  readonly rating: string;
  readonly source: string;
  readonly stars: string;
}

/**
 * Central site profile & homepage config structured for future FastAPI / PostgreSQL management.
 * Swap exported getter functions to fetch persisted settings without editing UI components.
 */
export const SITE_PROFILE: SiteProfile = {
  initials: "SH",
  ownerName: "Shabnum H.",
  brandName: "SHABNUM H.",
  tagline:
    "AI Engineer & Backend Developer — building practical AI workflows, RAG systems, and dependable Python backends.",
  metaTitleDefault: "Shabnum H. | AI Engineer & Backend Developer",
  metaTitleTemplate: "%s | Shabnum H.",
  metaDescription:
    "Shabnum H. builds practical AI applications, workflow automation, and reliable backend systems for growing businesses.",
  directEmail: undefined,
  cvUrl: undefined,
  techNote: "AI / BACKEND / SYSTEMS",
  copyrightYear: 2026,
  copyrightNote: "Built with Next.js & Tailwind CSS.",
};

export const CONNECT_CHANNELS: readonly ConnectChannel[] = [
  {
    id: "email",
    label: "Email",
    handlePlaceholder: "Use the contact form to inquire",
    icon: "mail",
    href: "/contact",
    external: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handlePlaceholder: "Profile link coming soon",
    icon: "linkedin",
    status: "soon",
  },
  {
    id: "github",
    label: "GitHub",
    handlePlaceholder: "Profile link coming soon",
    icon: "github",
    status: "soon",
  },
  {
    id: "upwork",
    label: "Upwork",
    handlePlaceholder: "Freelance profile link coming soon",
    icon: "briefcase",
    status: "soon",
  },
];

export const HOME_HERO: HeroContent = {
  eyebrow: "HELLO, I'M SHABNUM H.",
  headingPrimary: "AI Engineer &",
  headingSecondary: "Backend Developer.",
  summary:
    "I build AI systems that automate workflows, analyze business data, and turn complex ideas into reliable products that create measurable value.",
  specializations: [
    "Agentic AI",
    "RAG Systems",
    "Python & FastAPI",
    "Workflow Automation",
  ],
  portraitAlt: "Portrait of Shabnum H., AI Engineer and Backend Developer",
};

export const HOME_ABOUT_PREVIEW: HomeAboutPreview = {
  eyebrow: "01 / ABOUT SHABNUM",
  sideNote:
    "AI Engineer ready to transform business operations through thoughtful automation.",
  title: "I build systems that move businesses forward.",
  description:
    "With 5+ years of experience in production AI systems, I help teams automate workflows, unlock insights, and deliver AI applications that are useful beyond the demo.",
  ctaLabel: "Read more about me",
  ctaHref: "/about",
};

export const PROFILE_HIGHLIGHTS_META = {
  eyebrow: "AT A GLANCE",
  title: "Built for practical progress.",
  note: "A few profile highlights from Shabnum's current professional record.",
} as const;

export const PROFILE_HIGHLIGHTS: readonly ProfileHighlightRecord[] = [
  {
    id: "highlight-experience",
    index: "01 / EXPERIENCE",
    value: "5+",
    label: "Years building production AI systems",
  },
  {
    id: "highlight-projects",
    index: "02 / PROJECTS",
    value: "7",
    label: "Completed freelance jobs",
  },
  {
    id: "highlight-delivery",
    index: "03 / DELIVERY",
    value: "63",
    label: "Tracked hours of client work",
  },
  {
    id: "highlight-rating",
    index: "04 / RATING",
    value: "5.0",
    suffix: "★",
    label: "Client rating shown on profile",
  },
];

export const CLIENT_FEEDBACK: readonly FeedbackRecord[] = [
  {
    id: "fb-senior-ai-agent",
    title: "Senior AI Agent & LLM Developer",
    rating: "5.0",
    source: "Upwork profile feedback",
    stars: "★★★★★",
  },
  {
    id: "fb-ai-consultant",
    title: "AI Consultant Needed to Build a Simple AI Agent",
    rating: "5.0",
    source: "Upwork profile feedback",
    stars: "★★★★★",
  },
  {
    id: "fb-client-summary",
    title: "Client feedback",
    rating: "5 reviews",
    source: "Verified profile feedback",
    stars: "★★★★★",
  },
];

export function getSiteProfile(): SiteProfile {
  return SITE_PROFILE;
}

export function getConnectChannels(): readonly ConnectChannel[] {
  return CONNECT_CHANNELS;
}

export function getHomeHero(): HeroContent {
  return HOME_HERO;
}

export function getHomeAboutPreview(): HomeAboutPreview {
  return HOME_ABOUT_PREVIEW;
}

export function getProfileHighlights(): readonly ProfileHighlightRecord[] {
  return PROFILE_HIGHLIGHTS;
}

export function getClientFeedback(): readonly FeedbackRecord[] {
  return CLIENT_FEEDBACK;
}
