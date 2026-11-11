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

/**
 * Central site profile & connect config structured for future dashboard management.
 * Populate `directEmail`, `cvUrl`, and external `href` URLs once verified details are configured.
 */
export const SITE_PROFILE = {
  initials: "SH",
  ownerName: "Shabnum H.",
  brandName: "SHABNUM H.",
  tagline:
    "AI Engineer & Backend Developer — building practical AI workflows, RAG systems, and dependable Python backends.",
  directEmail: undefined as string | undefined,
  cvUrl: undefined as string | undefined,
  techNote: "AI / BACKEND / SYSTEMS",
} as const;

export const CONNECT_CHANNELS: readonly ConnectChannel[] = [
  {
    id: "email",
    label: "Email",
    handlePlaceholder: "Editable email placeholder",
    icon: "mail",
    href: "/contact",
    external: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handlePlaceholder: "Editable LinkedIn link placeholder",
    icon: "linkedin",
    status: "soon",
  },
  {
    id: "github",
    label: "GitHub",
    handlePlaceholder: "Editable GitHub link placeholder",
    icon: "github",
    status: "soon",
  },
  {
    id: "upwork",
    label: "Upwork",
    handlePlaceholder: "Editable Upwork profile placeholder",
    icon: "briefcase",
    status: "soon",
  },
];
