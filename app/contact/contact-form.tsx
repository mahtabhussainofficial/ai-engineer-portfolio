"use client";

import { FormEvent, useState } from "react";
import { Eyebrow } from "../components/site-shell";

type InquiryMode = "project" | "advisory";

const projectTypes = [
  "AI application",
  "Agentic workflow",
  "RAG or knowledge system",
  "Backend or API",
  "Something else",
] as const;

const modeCopy: Record<
  InquiryMode,
  {
    tabLabel: string;
    heading: string;
    subtitle: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
  }
> = {
  project: {
    tabLabel: "Start a Project",
    heading: "Let's Build Together",
    subtitle:
      "Share your project goals, workflow bottleneck, or backend system requirements.",
    subjectPlaceholder: "What would you like to build?",
    messagePlaceholder: "Tell me about your project scope, data, or timeline...",
    submitLabel: "Send Inquiry",
  },
  advisory: {
    tabLabel: "Advisory & Roles",
    heading: "Technical Advisory & Roles",
    subtitle:
      "Explore AI architecture reviews, automation consulting, or engineering collaborations.",
    subjectPlaceholder: "Role, audit, or collaboration topic",
    messagePlaceholder:
      "Share context on the role, team, or architecture questions you are exploring...",
    submitLabel: "Send Message",
  },
};

const fieldClass =
  "mt-2 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/90 px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-subtle focus:border-accent";

export function ContactInquiryPanel() {
  const [mode, setMode] = useState<InquiryMode>("project");
  const [submitted, setSubmitted] = useState(false);

  const activeCopy = modeCopy[mode];

  function handleModeChange(nextMode: InquiryMode) {
    setMode(nextMode);
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div id="contact-form" className="min-w-0 space-y-4">
      {/* Mode Switcher */}
      <div
        role="tablist"
        aria-label="Inquiry type"
        className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#233044] bg-[#111823] p-1.5"
      >
        {(["project", "advisory"] as const).map((key) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleModeChange(key)}
              className={`rounded-lg px-2.5 py-2.5 text-center text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-[#172130]/60 hover:text-foreground"
              }`}
            >
              {modeCopy[key].tabLabel}
            </button>
          );
        })}
      </div>

      {/* Form Card */}
      <section
        aria-labelledby="contact-form-heading"
        className="section-frame rounded-2xl p-5 sm:p-8"
      >
        <Eyebrow>
          {mode === "project" ? "PROJECT BRIEF" : "CONSULTATION"}
        </Eyebrow>
        <h2
          id="contact-form-heading"
          className="mt-2.5 text-2xl font-semibold tracking-[-0.02em] text-foreground"
        >
          {activeCopy.heading}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {activeCopy.subtitle}
        </p>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block min-w-0 text-sm font-medium text-foreground">
              Full Name
              <input
                required
                name="name"
                autoComplete="name"
                className={fieldClass}
                placeholder="Your full name"
              />
            </label>

            <label className="block min-w-0 text-sm font-medium text-foreground">
              Email Address
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                className={fieldClass}
                placeholder="you@company.com"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block min-w-0 text-sm font-medium text-foreground">
              Subject
              <input
                required
                name="subject"
                className={fieldClass}
                placeholder={activeCopy.subjectPlaceholder}
              />
            </label>

            <label className="block min-w-0 text-sm font-medium text-foreground">
              Project Type
              <select
                required
                name="projectType"
                defaultValue=""
                className={fieldClass}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block min-w-0 text-sm font-medium text-foreground">
            Message
            <textarea
              required
              name="message"
              rows={5}
              className={fieldClass}
              placeholder={activeCopy.messagePlaceholder}
            />
          </label>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto"
            >
              <span>{activeCopy.submitLabel}</span>
              <span aria-hidden="true">↗</span>
            </button>

            <span className="font-mono text-[11px] text-subtle">
              Free initial consultation · Prototype form
            </span>
          </div>

          {submitted ? (
            <div
              role="status"
              className="rounded-xl border border-[#2b3c54] bg-[#172130]/75 p-4 text-sm leading-6 text-muted"
            >
              <p className="font-medium text-foreground">
                Form submission preview
              </p>
              <p className="mt-1">
                Your message was not sent yet because the backend delivery
                endpoint will be connected alongside the portfolio dashboard.
              </p>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}
