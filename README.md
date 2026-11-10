# AI Engineer Portfolio

A modern portfolio website for an AI engineer and backend developer, built with Next.js, TypeScript, and Tailwind CSS. The site presents services, skills, project highlights, and contact information in a polished one-page experience with dedicated sections.

## Overview

This project is designed to showcase:

- AI engineering and backend development expertise
- Service offerings such as agentic AI, RAG systems, and workflow automation
- Key skills and delivery capabilities
- Portfolio case studies and project previews
- Contact and inquiry information for potential clients

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- App Router

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```text
app/
  about/
  components/
  contact/
  projects/
  services/
  skills/
  globals.css
  layout.tsx
  page.tsx
public/
README.md
package.json
```

## Customize the Site

The main content is organized inside the `app/` directory. Common edits include:

- updating personal details and headline in `app/page.tsx`
- changing site metadata in `app/layout.tsx`
- editing service, project, and skill data in `app/page.tsx`
- styling the visual theme in `app/globals.css`

## Deployment

This app is ready to deploy to platforms like Vercel. For a production deployment, connect the repository to Vercel and use the default Next.js build settings.

## Notes

The project includes a custom portfolio layout and reusable shell components for a complete marketing-style personal site focused on AI consulting and product delivery.
