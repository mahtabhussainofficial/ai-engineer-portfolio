export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  group: "core" | "content" | "admin";
  description: string;
  badge?: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/admin",
    group: "core",
    description: "System metrics, activity feed, and unread inquiries",
  },
  {
    id: "projects",
    label: "Projects",
    href: "/admin/projects",
    group: "content",
    description: "Case studies, technical architectures, and live demos",
  },
  {
    id: "services",
    label: "Services",
    href: "/admin/services",
    group: "content",
    description: "Engineering service offerings, tooling, and tiers",
  },
  {
    id: "skills",
    label: "Skills",
    href: "/admin/skills",
    group: "content",
    description: "AI, backend, and delivery skill inventory",
  },
  {
    id: "career",
    label: "Career",
    href: "/admin/career",
    group: "content",
    description: "Experience timeline, education, and verified credentials",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    href: "/admin/testimonials",
    group: "content",
    description: "Client feedback, executive endorsements, and reviews",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/admin/messages",
    group: "admin",
    description: "Inbound contact submissions, inquiries, and triage",
  },
  {
    id: "media",
    label: "Media",
    href: "/admin/media",
    group: "admin",
    description: "Asset library, external CDN references, and cover photos",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    group: "admin",
    description: "Whitelisted public page configurations and site metadata",
  },
  {
    id: "sessions",
    label: "Sessions",
    href: "/admin/sessions",
    group: "admin",
    description: "Active device logins, tokens, and revocation management",
  },
];
