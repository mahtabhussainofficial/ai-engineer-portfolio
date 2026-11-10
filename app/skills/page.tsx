import { Eyebrow, PageIntro, SiteFooter } from "../components/site-shell";

const skillGroups = [
  {
    number: "01",
    title: "Programming Languages",
    description: "Languages used to shape AI products, application logic, and maintainable software foundations.",
    items: ["Python", "JavaScript", "TypeScript"],
  },
  {
    number: "02",
    title: "Backend Development",
    description: "Tools for building clear service boundaries, APIs, validation, and dependable application behavior.",
    items: ["FastAPI", "Django", "REST APIs", "Pydantic", "Full-Stack Development"],
  },
  {
    number: "03",
    title: "AI & Machine Learning",
    description: "Core concepts and application patterns for turning models into useful product capabilities.",
    items: ["Artificial Intelligence", "Machine Learning", "Generative AI", "Automation"],
  },
  {
    number: "04",
    title: "LLMs & AI Engineering",
    description: "Practical building blocks for grounded, tool-using, and context-aware intelligent systems.",
    items: ["Prompt Engineering", "Retrieval Augmented Generation", "AI Chatbot", "Large Language Model", "LangChain", "AI Agent Development", "OpenAI API", "Claude API"],
  },
  {
    number: "05",
    title: "Databases",
    description: "Persistence and data foundations for applications that need reliable access to structured information.",
    items: ["PostgreSQL", "MongoDB", "Redis"],
  },
  {
    number: "06",
    title: "DevOps & Cloud",
    description: "Delivery and runtime tools that support repeatable development and dependable deployments.",
    items: ["DevOps Engineering", "Docker", "Linux", "Cloud Platforms", "Environment Configuration"],
  },
  {
    number: "07",
    title: "Tools & Development Workflow",
    description: "Everyday tools for version control, collaboration, documentation, and thoughtful iteration.",
    items: ["CrewAI", "OpenClaw", "Git", "GitHub", "API Documentation", "Testing Workflows", "Chatbot Development", "Business Process Automation"],
  },
];

export default function SkillsPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <PageIntro
        active="Skills"
        label="SKILLS / TECHNOLOGIES"
        title={<>A practical <span className="text-accent">toolkit</span>.</>}
        description="A clear overview of the languages, frameworks, and engineering practices used to build AI-powered applications and dependable backend systems."
      />
      <main>
        <section className="bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-28">
            <div className="mb-12 max-w-2xl">
              <Eyebrow>CAPABILITY GROUPS</Eyebrow>
              <p className="mt-5 text-lg leading-8 text-muted">
                Skills are grouped by the role they play in a system rather than presented as proficiency scores. The collection can grow as verified experience and future work are added.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {skillGroups.map((group) => (
                <article key={group.number} className="glass-panel glass-hover rounded-xl p-6 sm:p-8 md:min-h-[21rem]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-xs text-accent">{group.number}</span>
                    <span className="font-mono text-[10px] tracking-widest text-muted">SKILL GROUP</span>
                  </div>
                  <h2 className="mt-10 text-2xl font-medium leading-tight">{group.title}</h2>
                  <p className="mt-4 max-w-md leading-7 text-muted">{group.description}</p>
                  <ul className="mt-8 flex flex-wrap gap-2 border-t border-[#293547] pt-4 text-sm text-accent">
                    {group.items.map((item) => <li key={item} className="rounded-full border border-white/10 px-3 py-1.5">{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
