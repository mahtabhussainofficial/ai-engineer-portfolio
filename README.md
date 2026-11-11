# Shabnum H. — AI Engineer Portfolio

> A polished portfolio and service showcase for Shabnum H., an AI Engineer and Backend Developer building practical AI applications, workflow automation, RAG systems, and dependable Python backends.

## Overview

This project is a responsive, dark-themed portfolio website built to present:

- Professional background, experience, education, and certifications
- AI engineering and backend development services
- Project briefs covering RAG, agentic automation, AI platforms, and document workflows
- A structured skills and capability map
- A contact experience for project and advisory inquiries

The site uses typed, centralized content records so the presentation layer can later be connected to a CMS, FastAPI service, or database without redesigning the route components.

## Highlights

- Next.js App Router with route-level metadata
- Responsive layout with reusable navigation, footer, section, card, and CTA components
- Filterable project and service indexes
- Dedicated project detail pages using dynamic routes
- Typed content catalogs for services, projects, skills, profile information, and experience
- Accessible form states and client-side inquiry validation
- Optimized local portrait asset using `next/image`
- Dark visual system built with Tailwind CSS v4

## Technology

- **Framework:** Next.js 16
- **UI:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Fonts:** Geist and Geist Mono via `next/font`
- **Quality:** ESLint with the Next.js configuration

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Portfolio landing page with featured services, projects, skills, process, and feedback |
| `/about` | Biography, engineering approach, career journey, education, and certifications |
| `/services` | Filterable catalog of AI engineering and backend services |
| `/projects` | Filterable project and case-study index |
| `/projects/[slug]` | Detailed project brief |
| `/skills` | Full capability map across AI, backend, data, infrastructure, and workflow |
| `/contact` | Project/advisory inquiry form and contact channels |

## Getting Started

### Prerequisites

- Node.js compatible with the installed Next.js version
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm run start
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

```text
app/
├── (public)/                 Public route group and page implementations
│   ├── about/
│   ├── contact/
│   ├── projects/
│   ├── services/
│   └── skills/
├── components/               Shared site shell and UI primitives
├── globals.css               Global styles and design tokens
├── layout.tsx                Root metadata, fonts, and document layout
├── loading.tsx               Loading state
└── not-found.tsx             Not-found state
lib/
├── about-data.ts             Biography and background content
├── experience-data.ts        Career, education, and certification records
├── projects-data.ts         Project catalog and project helpers
├── services-data.ts         Service catalog and process steps
├── site-config.ts            Site profile, metadata, and contact channels
└── skills-data.ts            Skill layers, groups, and featured skills
public/
└── shabnum-portrait.jpg     Portfolio portrait asset
```

## Customization

Most portfolio content can be updated without changing page components:

1. Update identity, metadata, contact channels, and social placeholders in [`lib/site-config.ts`](./lib/site-config.ts).
2. Update biography and principles in [`lib/about-data.ts`](./lib/about-data.ts).
3. Update career, education, and certification entries in [`lib/experience-data.ts`](./lib/experience-data.ts).
4. Update service offerings and process steps in [`lib/services-data.ts`](./lib/services-data.ts).
5. Update project briefs in [`lib/projects-data.ts`](./lib/projects-data.ts).
6. Update the capability map in [`lib/skills-data.ts`](./lib/skills-data.ts).
7. Adjust global colors, spacing, and typography in [`app/globals.css`](./app/globals.css).

Add a project `slug` to `PROJECTS` to make it available through `/projects/[slug]`. Featured records are automatically used by the homepage previews.

## Contact Form Status

The contact form currently provides a polished, client-side preview flow:

- Validates required fields in the browser
- Supports project and advisory inquiry modes
- Shows loading, validation, success, and error states
- Does **not** send or persist messages yet

The submission handler is intentionally isolated in `app/(public)/contact/contact-form.tsx`, making it straightforward to replace the preview with a real API request when an inquiry backend is available.

## Deployment

The application is ready for deployment on Vercel or another platform that supports Next.js:

1. Push the repository to a Git provider.
2. Import the repository into the hosting platform.
3. Use `npm run build` as the build command.
4. Use `npm run start` for a self-hosted production process, when required.

No environment variables are currently required for the portfolio frontend.

## License

This repository is a personal portfolio project. Contact the repository owner before reusing its branding, copy, imagery, or portfolio content.
