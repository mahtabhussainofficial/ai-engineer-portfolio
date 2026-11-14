"use client";

import { FormEvent, useState } from "react";
import { Eyebrow } from "@/app/components/site-shell";
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
  "mt-2 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/90 px-4 py-3 text-sm text-foreground transition-colors duration-200 placeholder:text-subtle focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

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
  const [lastPreviewMode, setLastPreviewMode] = useState<InquiryMode>("project");

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
      setLastPreviewMode(payload.inquiryMode);
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
        className="grid grid-cols-2 gap-1.5 rounded-xl border border-[#233044] bg-[#111823] p-1.5"
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
              className={`rounded-lg px-2.5 py-2.5 text-center text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-primary text-white hover:bg-primary-hover"
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

        <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block min-w-0 text-sm font-medium text-foreground">
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
                aria-describedby={
                  fieldErrors.name ? "contact-name-error" : undefined
                }
                className={`${fieldClass} ${
                  fieldErrors.name ? "border-red-400/70" : ""
                }`}
                placeholder="Your full name"
              />
              {fieldErrors.name ? (
                <span
                  id="contact-name-error"
                  className="mt-1.5 block text-xs font-normal text-red-300"
                >
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>

            <label className="block min-w-0 text-sm font-medium text-foreground">
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
                aria-describedby={
                  fieldErrors.email ? "contact-email-error" : undefined
                }
                className={`${fieldClass} ${
                  fieldErrors.email ? "border-red-400/70" : ""
                }`}
                placeholder="you@company.com"
              />
              {fieldErrors.email ? (
                <span
                  id="contact-email-error"
                  className="mt-1.5 block text-xs font-normal text-red-300"
                >
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block min-w-0 text-sm font-medium text-foreground">
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
                aria-describedby={
                  fieldErrors.subject ? "contact-subject-error" : undefined
                }
                className={`${fieldClass} ${
                  fieldErrors.subject ? "border-red-400/70" : ""
                }`}
                placeholder={activeCopy.subjectPlaceholder}
              />
              {fieldErrors.subject ? (
                <span
                  id="contact-subject-error"
                  className="mt-1.5 block text-xs font-normal text-red-300"
                >
                  {fieldErrors.subject}
                </span>
              ) : null}
            </label>

            <label className="block min-w-0 text-sm font-medium text-foreground">
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
                aria-describedby={
                  fieldErrors.projectType ? "contact-type-error" : undefined
                }
                className={`${fieldClass} ${
                  fieldErrors.projectType ? "border-red-400/70" : ""
                }`}
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
              {fieldErrors.projectType ? (
                <span
                  id="contact-type-error"
                  className="mt-1.5 block text-xs font-normal text-red-300"
                >
                  {fieldErrors.projectType}
                </span>
              ) : null}
            </label>
          </div>

          <label className="block min-w-0 text-sm font-medium text-foreground">
            Message
            <textarea
              required
              name="message"
              rows={5}
              disabled={isSubmitting}
              value={values.message}
              onChange={(event) =>
                handleFieldChange("message", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={
                fieldErrors.message ? "contact-message-error" : undefined
              }
              className={`${fieldClass} ${
                fieldErrors.message ? "border-red-400/70" : ""
              }`}
              placeholder={activeCopy.messagePlaceholder}
            />
            {fieldErrors.message ? (
              <span
                id="contact-message-error"
                className="mt-1.5 block text-xs font-normal text-red-300"
              >
                {fieldErrors.message}
              </span>
            ) : null}
          </label>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-65 sm:w-auto"
            >
              <span>
                {isSubmitting ? "Sending inquiry…" : activeCopy.submitLabel}
              </span>
              {!isSubmitting ? <span aria-hidden="true">↗</span> : null}
            </button>

            <span className="font-mono text-[11px] text-subtle">
              Free initial consultation · Online delivery coming soon
            </span>
          </div>

          {status === "error" && errorBanner ? (
            <div
              role="alert"
              className="rounded-xl border border-red-400/40 bg-[#1a131a]/80 p-4 text-sm leading-6 text-red-200"
            >
              <p className="font-medium text-red-100">Check required details</p>
              <p className="mt-1">{errorBanner}</p>
            </div>
          ) : null}

          {status === "success" ? (
            <div
              role="status"
              className="rounded-xl border border-[#2b3c54] bg-[#172130]/75 p-4 text-sm leading-6 text-muted"
            >
              <p className="font-medium text-foreground">
                Inquiry preview prepared (not sent)
              </p>
              <p className="mt-1">
                Your{" "}
                {lastPreviewMode === "project"
                  ? "project brief"
                  : "advisory inquiry"}{" "}
                passed validation in preview mode, and your message has not been
                sent yet because automated form delivery is not active yet.
                Please reach out via the available contact channels if you need
                an immediate response.
              </p>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}
