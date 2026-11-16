"use client";

import { FormEvent, useState } from "react";
import { Eyebrow, primaryButtonClass } from "@/app/components/site-shell";
import { submitPublicContactMessage } from "@/lib/public-api";

type InquiryMode = "project" | "advisory";
type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export interface ContactInquiryPayload {
  readonly inquiryMode: InquiryMode;
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly projectType: string;
  readonly message: string;
}

interface FormValues {
  name: string;
  email: string;
  subject: string;
  projectType: string;
  message: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialFormValues: FormValues = {
  name: "",
  email: "",
  subject: "",
  projectType: "",
  message: "",
};

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
      "Share your project goals, workflow bottlenecks, or backend architecture requirements.",
    subjectPlaceholder: "What system would you like to engineer?",
    messagePlaceholder: "Describe your project scope, data source, or timeline...",
    submitLabel: "Send Inquiry",
  },
  advisory: {
    tabLabel: "Advisory & Roles",
    heading: "Technical Advisory & Roles",
    subtitle:
      "Explore AI architecture reviews, automation audits, or full-time / contract engineering roles.",
    subjectPlaceholder: "Role, technical audit, or collaboration topic",
    messagePlaceholder:
      "Share details about the role, team, or architecture decisions you are evaluating...",
    submitLabel: "Send Message",
  },
};

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-[#0e1015] px-3.5 py-2.5 text-sm text-white transition-colors duration-150 placeholder:text-zinc-600 focus:border-[#c4f042] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInquiry(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name (at least 2 characters).";
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.subject.trim().length < 3) {
    errors.subject = "Please enter a brief subject (at least 3 characters).";
  }

  if (!values.projectType.trim()) {
    errors.projectType = "Please select a project category.";
  }

  if (values.message.trim().length < 15) {
    errors.message =
      "Please share at least 15 characters describing your goals or questions.";
  }

  return errors;
}

export function ContactInquiryPanel() {
  const [mode, setMode] = useState<InquiryMode>("project");
  const [values, setValues] = useState<FormValues>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const activeCopy = modeCopy[mode];
  const isSubmitting = status === "submitting";

  function handleModeChange(nextMode: InquiryMode) {
    if (isSubmitting) return;
    setMode(nextMode);
    if (status === "success" || status === "error") {
      setStatus("idle");
    }
    setErrorBanner(null);
  }

  function handleFieldChange<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (status === "error") {
      setStatus("idle");
      setErrorBanner(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateInquiry(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setStatus("error");
      setErrorBanner("Please review the highlighted fields before continuing.");
      return;
    }

    const payload: ContactInquiryPayload = {
      inquiryMode: mode,
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      projectType: values.projectType.trim(),
      message: values.message.trim(),
    };

    setFieldErrors({});
    setErrorBanner(null);
    setStatus("submitting");

    try {
      await submitPublicContactMessage(payload);
      setValues(initialFormValues);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorBanner(
        err instanceof Error
          ? err.message
          : "Unable to send your inquiry right now. Please try again.",
      );
    }
  }

  return (
    <div id="contact-form" className="min-w-0 space-y-4">
      {/* Mode Switcher */}
      <div
        role="group"
        aria-label="Inquiry type"
        className="flex gap-2"
      >
        {(["project", "advisory"] as const).map((key) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              type="button"
              disabled={isSubmitting}
              aria-pressed={isActive}
              onClick={() => handleModeChange(key)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#c4f042] text-zinc-950 font-bold"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
              }`}
            >
              {modeCopy[key].tabLabel}
            </button>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="dev-card rounded-2xl p-6 sm:p-8">
        <Eyebrow>
          {mode === "project" ? "Project Brief" : "Consultation"}
        </Eyebrow>
        <h2
          id="contact-form-heading"
          className="mt-2 text-xl font-bold text-white sm:text-2xl"
        >
          {activeCopy.heading}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          {activeCopy.subtitle}
        </p>

        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0 text-xs font-mono uppercase tracking-wider text-zinc-400">
              Full Name
              <input
                required
                name="name"
                autoComplete="name"
                disabled={isSubmitting}
                value={values.name}
                onChange={(event) =>
                  handleFieldChange("name", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.name)}
                className={`${fieldClass} ${
                  fieldErrors.name ? "border-red-500" : ""
                }`}
                placeholder="Your full name"
              />
              {fieldErrors.name ? (
                <span className="mt-1 block text-xs font-normal text-red-400">
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>

            <label className="block min-w-0 text-xs font-mono uppercase tracking-wider text-zinc-400">
              Email Address
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={values.email}
                onChange={(event) =>
                  handleFieldChange("email", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.email)}
                className={`${fieldClass} ${
                  fieldErrors.email ? "border-red-500" : ""
                }`}
                placeholder="you@company.com"
              />
              {fieldErrors.email ? (
                <span className="mt-1 block text-xs font-normal text-red-400">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0 text-xs font-mono uppercase tracking-wider text-zinc-400">
              Subject
              <input
                required
                name="subject"
                disabled={isSubmitting}
                value={values.subject}
                onChange={(event) =>
                  handleFieldChange("subject", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.subject)}
                className={`${fieldClass} ${
                  fieldErrors.subject ? "border-red-500" : ""
                }`}
                placeholder={activeCopy.subjectPlaceholder}
              />
              {fieldErrors.subject ? (
                <span className="mt-1 block text-xs font-normal text-red-400">
                  {fieldErrors.subject}
                </span>
              ) : null}
            </label>

            <label className="block min-w-0 text-xs font-mono uppercase tracking-wider text-zinc-400">
              Project Type
              <select
                required
                name="projectType"
                disabled={isSubmitting}
                value={values.projectType}
                onChange={(event) =>
                  handleFieldChange("projectType", event.target.value)
                }
                aria-invalid={Boolean(fieldErrors.projectType)}
                className={`${fieldClass} ${
                  fieldErrors.projectType ? "border-red-500" : ""
                }`}
              >
                <option value="" disabled className="bg-[#111318] text-zinc-400">
                  Select a category
                </option>
                {projectTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#111318] text-white">
                    {type}
                  </option>
                ))}
              </select>
              {fieldErrors.projectType ? (
                <span className="mt-1 block text-xs font-normal text-red-400">
                  {fieldErrors.projectType}
                </span>
              ) : null}
            </label>
          </div>

          <label className="block min-w-0 text-xs font-mono uppercase tracking-wider text-zinc-400">
            Message
            <textarea
              required
              name="message"
              rows={4}
              disabled={isSubmitting}
              value={values.message}
              onChange={(event) =>
                handleFieldChange("message", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.message)}
              className={`${fieldClass} ${
                fieldErrors.message ? "border-red-500" : ""
              }`}
              placeholder={activeCopy.messagePlaceholder}
            />
            {fieldErrors.message ? (
              <span className="mt-1 block text-xs font-normal text-red-400">
                {fieldErrors.message}
              </span>
            ) : null}
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={primaryButtonClass}
            >
              <span>
                {isSubmitting ? "Sending…" : activeCopy.submitLabel}
              </span>
              {!isSubmitting ? <span aria-hidden="true">↗</span> : null}
            </button>

            <span className="font-mono text-[11px] text-zinc-400">
              Direct inbox · Reply within 24h
            </span>
          </div>

          {status === "error" && errorBanner ? (
            <div
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
            >
              <p className="font-semibold text-red-100">Check required details</p>
              <p className="mt-0.5">{errorBanner}</p>
            </div>
          ) : null}

          {status === "success" ? (
            <div
              role="status"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200"
            >
              <p className="font-bold text-emerald-100">
                Inquiry sent successfully
              </p>
              <p className="mt-0.5 text-emerald-300">
                Thank you! Your message has been received. I will review and reply shortly.
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
