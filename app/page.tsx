import Link from "next/link";
import Image from "next/image";
import { Eyebrow, SiteFooter, SiteHeader } from "./components/site-shell";

const services = [
  ["01", "Agentic AI & Workflow Automation", "Multi-agent systems, tool calling, and approval flows that reduce repetitive business work."],
  ["02", "Voice AI & Conversational Agents", "Real-time voice agents for customer support, sales, and natural conversations."],
  ["03", "RAG Systems & Knowledge AI", "Grounded AI assistants that turn business documents and databases into useful answers."],
  ["04", "Document Intelligence & ERP Integration", "OCR, PDF extraction, and document workflows connected to existing ERP systems."],
  ["05", "LLM Integration & Prompt Engineering", "Model selection, structured outputs, function calling, and cost-conscious LLM applications."],
  ["06", "Observability & LLM Evaluation", "Prompt testing, tracing, evaluation, and feedback loops for reliable AI behavior."],
  ["07", "Full-Stack AI Applications & Backend", "Production-minded AI web apps and APIs built with Python, FastAPI, and modern tooling."],
  ["08", "Data, Databases & Integrations", "PostgreSQL, MongoDB, Redis, ETL, and business integrations that keep systems connected."],
] as const;
const skills = [
  ["Artificial Intelligence", "Machine Learning / Generative AI / AI Chatbot / AI Agent Development"],
  ["LLM Engineering", "Prompt Engineering / RAG / Large Language Models / LangChain / OpenAI API / Claude API"],
  ["Automation", "Business Process Automation / CrewAI / OpenClaw / Workflow Design"],
  ["Backend & Product", "Python / FastAPI / Full-Stack Development / Chatbot Development"],
  ["Delivery", "DevOps Engineering / Docker / APIs / Integrations"],
];
const feedback = [
  ["Senior AI Agent & LLM Developer", "5.0", "Upwork profile feedback"],
  ["AI Consultant Needed to Build a Simple AI Agent", "5.0", "Upwork profile feedback"],
  ["Client feedback", "5 reviews", "Verified profile feedback"],
];
const projectPreviews = [
  ["01", "Knowledge Assistant", "A RAG-based assistant concept for answering questions from trusted business documents.", "RAG / Knowledge AI", ["Python", "FastAPI", "Vector Search"]],
  ["02", "Workflow Automation", "An editable case-study placeholder for agentic workflows connected to business tools and approval steps.", "Agentic AI / Automation", ["AI Agents", "APIs", "Human Review"]],
  ["03", "AI Backend Platform", "A practical application concept combining an AI feature, structured data, and a dependable backend foundation.", "Full-Stack AI", ["Python", "PostgreSQL", "Docker"]],
] as const;
const experienceEntries = [
  ["01", "AI Engineer", "Sample AI Studio", "2022 — Present", "Editable placeholder for production AI systems, agentic workflows, and knowledge assistants.", ["AI Agents", "RAG", "LLM Applications"]],
  ["02", "Backend Developer", "Independent Projects", "2020 — 2022", "Editable placeholder for Python APIs, integrations, data workflows, and dependable backend foundations.", ["Python", "FastAPI", "PostgreSQL"]],
  ["03", "Automation Consultant", "Selected Client Work", "2019 — 2020", "Editable placeholder for workflow automation, chatbot experiences, and practical process improvements.", ["Automation", "Chatbots", "APIs"]],
] as const;

export default function Home() {
  return <div className="min-h-screen overflow-x-clip bg-background text-foreground"><SiteHeader /><main>
    <section id="home" className="border-b border-[#293547]">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:items-center lg:gap-20 lg:px-8 lg:py-32">
        <div>
          <p className="mb-6 font-mono text-xs tracking-[0.18em] text-accent">HELLO, I&apos;M SHABNUM H.</p>
          <h1 className="max-w-4xl text-[clamp(3rem,7vw,6.8rem)] font-semibold leading-[0.95] tracking-[-0.06em]">AI Engineer &amp;<br /><span className="text-muted">Backend Developer.</span></h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">I build AI systems that automate workflows, analyze business data, and turn complex ideas into reliable products that create measurable value.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className="rounded-md bg-primary px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">View projects <span className="ml-2">↗</span></a>
            <Link href="/contact" className="rounded-md border border-[#344258] px-6 py-3.5 text-center text-sm font-semibold transition-colors hover:border-accent hover:text-accent">Contact me</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[28rem] lg:justify-self-end">
          <div className="mx-auto w-full max-w-[22rem] rounded-full border border-accent/50 bg-[#111823] p-2 shadow-[0_24px_70px_rgba(59,130,246,0.16)]">
            <Image src="/portrait-placeholder.svg" alt="Portrait placeholder for Shabnum H." width={720} height={880} className="aspect-square w-full rounded-full object-cover" priority />
          </div>
        </div>
      </div>
    </section>
    <section id="about" className="border-b border-[#293547] bg-surface"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-8"><div><Eyebrow>01 / ABOUT SHABNUM</Eyebrow><p className="mt-4 max-w-xs text-sm leading-6 text-muted">AI Engineer ready to transform business operations through thoughtful automation.</p></div><div className="max-w-3xl"><h2 className="text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.045em]">I build systems that move businesses forward.</h2><p className="mt-6 text-lg leading-8 text-muted">With 5+ years of experience in production AI systems, I help teams automate workflows, unlock insights, and deliver AI applications that are useful beyond the demo.</p><Link href="/about" className="mt-8 inline-flex text-sm font-medium text-accent hover:underline">Read more about me →</Link></div></div></section>
    <section className="border-b border-[#293547]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>AT A GLANCE</Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Built for practical progress.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">A few profile highlights from Shabnum&apos;s current professional record.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="stat-item glass-panel glass-hover rounded-xl p-5 sm:p-6">
            <span className="font-mono text-[10px] tracking-[0.16em] text-accent">01 / EXPERIENCE</span>
            <strong className="mt-7 block text-4xl font-semibold tracking-[-0.05em]">5+</strong>
            <span className="mt-2 block text-sm text-muted">Years building production AI systems</span>
          </div>
          <div className="stat-item glass-panel glass-hover rounded-xl p-5 sm:p-6">
            <span className="font-mono text-[10px] tracking-[0.16em] text-accent">02 / PROJECTS</span>
            <strong className="mt-7 block text-4xl font-semibold tracking-[-0.05em]">7</strong>
            <span className="mt-2 block text-sm text-muted">Completed freelance jobs</span>
          </div>
          <div className="stat-item glass-panel glass-hover rounded-xl p-5 sm:p-6">
            <span className="font-mono text-[10px] tracking-[0.16em] text-accent">03 / DELIVERY</span>
            <strong className="mt-7 block text-4xl font-semibold tracking-[-0.05em]">63</strong>
            <span className="mt-2 block text-sm text-muted">Tracked hours of client work</span>
          </div>
          <div className="stat-item glass-panel glass-hover rounded-xl p-5 sm:p-6">
            <span className="font-mono text-[10px] tracking-[0.16em] text-accent">04 / RATING</span>
            <strong className="mt-7 block text-4xl font-semibold tracking-[-0.05em]">5.0<span className="ml-1 text-lg text-accent">★</span></strong>
            <span className="mt-2 block text-sm text-muted">Client rating shown on profile</span>
          </div>
        </div>
      </div>
    </section>
    <section id="services" className="border-b border-[#293547] bg-surface"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8"><div className="max-w-3xl"><Eyebrow>02 / SERVICES</Eyebrow><h2 className="mt-4 text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.045em]">Capabilities for useful products.</h2><p className="mt-5 text-lg leading-7 text-muted">A clear set of services for intelligent applications, automation, and dependable technical foundations.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2">{services.map(([number,title,description]) => <article key={number} className="glass-panel glass-hover rounded-xl p-6 sm:p-7"><span className="font-mono text-xs text-accent">{number}</span><h3 className="mt-8 text-lg font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{description}</p></article>)}</div><Link href="/services" className="mt-10 inline-flex text-sm font-medium text-accent hover:underline">View all services →</Link></div></section>
    <section id="projects" className="border-b border-[#293547]"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-3xl"><Eyebrow>03 / PROJECTS</Eyebrow><h2 className="mt-4 text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.045em]">Selected work directions.</h2><p className="mt-5 text-lg leading-7 text-muted">Editable project concepts showing the kind of AI and backend work this portfolio is prepared to present.</p></div><Link href="/projects" className="text-sm font-medium text-accent hover:underline">View project index →</Link></div><div className="mt-12 grid gap-4 md:grid-cols-3">{projectPreviews.map(([number,title,description,category,tags]) => <article key={number} className="glass-panel glass-hover flex min-h-[20rem] flex-col rounded-xl p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><span className="font-mono text-xs text-accent">{number}</span><span className="text-right font-mono text-[10px] tracking-widest text-muted">{category}</span></div><h3 className="mt-12 text-2xl font-medium leading-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{description}</p><div className="mt-auto flex flex-wrap gap-2 border-t border-[#293547] pt-5">{tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-accent">{tag}</span>)}</div></article>)}</div></div></section>
    <section id="skills" className="border-b border-[#293547] bg-surface"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-8"><div><Eyebrow>04 / SKILLS</Eyebrow><h2 className="mt-4 text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.045em]">The tools behind the work.</h2><p className="mt-5 max-w-md leading-7 text-muted">A short preview of the stack. Visit the dedicated Skills page for the complete capability map.</p><Link href="/skills" className="mt-8 inline-flex text-sm font-medium text-accent hover:underline">Explore all skills →</Link></div><div className="divide-y divide-[#293547] border-y border-[#293547]">{skills.slice(0, 3).map(([name,items],index) => <div key={name} className="grid gap-3 py-6 sm:grid-cols-[3rem_12rem_minmax(0,1fr)]"><span className="font-mono text-xs text-accent">0{index+1}</span><h3 className="font-medium">{name}</h3><p className="text-sm leading-6 text-muted">{items}</p></div>)}</div></div></section>
    <section className="border-b border-[#293547]"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl"><Eyebrow>05 / EXPERIENCE</Eyebrow><h2 className="mt-4 text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.045em]">A sample path through AI engineering.</h2><p className="mt-6 text-lg leading-8 text-muted">Editable sample entries for the roles, systems, and responsibilities that will be replaced with verified details.</p></div><span className="rounded-full border border-accent/30 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-accent">SAMPLE CONTENT</span></div><div className="mt-12 grid gap-4 md:grid-cols-3">{experienceEntries.map(([number,role,company,period,description,tags]) => <article key={number} className="glass-panel glass-hover flex min-h-[22rem] flex-col rounded-xl p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><span className="font-mono text-xs text-accent">{number}</span><span className="font-mono text-[10px] tracking-widest text-muted">{period}</span></div><h3 className="mt-10 text-2xl font-medium">{role}</h3><p className="mt-2 text-sm text-accent">{company}</p><p className="mt-5 text-sm leading-6 text-muted">{description}</p><div className="mt-auto flex flex-wrap gap-2 border-t border-[#293547] pt-5">{tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-accent">{tag}</span>)}</div></article>)}</div></div></section>
    <section className="border-b border-[#293547] bg-surface overflow-hidden"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Eyebrow>06 / CLIENT FEEDBACK</Eyebrow><h2 className="mt-4 text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.045em]">Trusted for thoughtful delivery.</h2></div><p className="text-sm text-muted">Feedback shown from the supplied Upwork profile.</p></div><div className="feedback-track mt-12 flex w-max gap-4 lg:grid lg:w-full lg:grid-cols-4">{[...feedback, ...feedback].map(([title,rating,source], index) => <article key={`${title}-${index}`} className="feedback-card glass-panel w-[min(20rem,80vw)] rounded-xl p-6 lg:w-full"><div className="flex items-center justify-between gap-4"><span className="text-sm text-accent">★★★★★</span><span className="font-mono text-xs text-muted">{rating}</span></div><h3 className="mt-8 text-lg font-medium leading-snug">{title}</h3><p className="mt-3 text-sm text-muted">{source}</p></article>)}</div></div></section>
    <section id="contact"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-28 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20 lg:px-8"><div><Eyebrow>07 / CONTACT</Eyebrow><h2 className="mt-5 max-w-4xl text-[clamp(2.6rem,6vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.06em]">Let&apos;s build something useful<span className="text-accent">.</span></h2><p className="mt-6 max-w-xl text-lg leading-8 text-muted">Free consultation before starting. Share the problem, and let&apos;s find a practical path forward.</p></div><Link href="/contact" className="rounded-md bg-primary px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-accent">Start a conversation <span className="ml-2">↗</span></Link></div></section>
  </main><SiteFooter /></div>;
}
