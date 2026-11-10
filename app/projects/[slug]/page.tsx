import Link from "next/link";
import { Suspense } from "react";
import { Eyebrow, PageIntro, SiteFooter } from "../../components/site-shell";

async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div className="min-h-screen overflow-x-clip bg-background text-foreground"><PageIntro active="Projects" label="PROJECTS / CASE STUDY" title={<>Project <span className="text-accent">details</span>.</>} description="This case study will be published when the underlying project can be documented with verified context, visuals, and outcomes."/><main><section className="bg-surface"><div className="mx-auto max-w-4xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32"><Eyebrow>CASE STUDY PREPARATION</Eyebrow><h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">The project record is being prepared.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Requested reference: <span className="font-mono text-sm text-accent">{slug}</span>. Project overview, architecture, technologies, features, and learnings will appear here once they are confirmed.</p><div className="mt-10 flex flex-wrap gap-4"><Link href="/projects" className="rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-white">Back to projects</Link><Link href="/contact" className="rounded-md border border-[#344258] px-6 py-3.5 text-sm font-semibold">Discuss a project</Link></div></div></section></main><SiteFooter/></div>;
}
export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) { return <Suspense fallback={<div className="min-h-screen bg-background" />}><CaseStudy params={params}/></Suspense>; }
