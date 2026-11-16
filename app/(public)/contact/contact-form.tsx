"use client";

import { FormEvent, useState } from "react";
import { submitPublicContactMessage, type ContactInquiryPayload } from "@/lib/public-api";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

interface FormValues {
  inquiryType: string;
  name: string;
  email: string;
  message: string;
}

const initialFormValues: FormValues = {
  inquiryType: "Web project",
  name: "",
  email: "",
  message: "",
};

const INQUIRY_OPTIONS = [
  "Web project",
  "AI Engineering",
  "Workflow Automation",
  "Backend Systems",
  "Technical Advisory",
  "Other Inquiry",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-zinc-800 bg-[#07080b] px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-colors duration-150 focus:border-[#c4f042] focus:outline-none focus:ring-1 focus:ring-[#c4f042] disabled:opacity-50";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactMessageForm() {
  const [values, setValues] = useState<FormValues>(initialFormValues);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitting = status === "submitting";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    if (values.name.trim().length < 2) {
      setErrorMessage("Please enter your name.");
      setStatus("error");
      return;
    }

    if (!EMAIL_REGEX.test(values.email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    if (values.message.trim().length < 10) {
      setErrorMessage("Please enter a message (at least 10 characters).");
      setStatus("error");
      return;
    }

    setErrorMessage(null);
    setStatus("submitting");

    const payload: ContactInquiryPayload = {
      inquiryMode: values.inquiryType.toLowerCase().includes("advisory")
        ? "advisory"
        : "project",
      name: values.name.trim(),
      email: values.email.trim(),
      subject: `${values.inquiryType} Inquiry`,
      projectType: values.inquiryType,
      message: values.message.trim(),
    };

    try {
      await submitPublicContactMessage(payload);
      setValues(initialFormValues);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not send message. Please try again or email directly.",
      );
    }
  }

  return (
    <div className="rounded-3xl border border-zinc-800/80 bg-[#0c0d12] p-6 sm:p-9 lg:p-10">
      {/* Title matching user's screenshot exactly */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
        Or send a message from here
      </h2>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Top 3 Columns: Inquiry type, Your name, Email address */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {/* Inquiry type */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300">
              Inquiry type
            </label>
            <div className="relative">
              <select
                disabled={isSubmitting}
                value={values.inquiryType}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, inquiryType: e.target.value }));
                  if (status === "error") setStatus("idle");
                }}
                className={`${inputClass} appearance-none pr-10`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.85rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.2em 1.2em`,
                }}
              >
                {INQUIRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0c0d12] text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Your name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300">
              Your name
            </label>
            <input
              type="text"
              required
              name="name"
              autoComplete="name"
              disabled={isSubmitting}
              value={values.name}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, name: e.target.value }));
                if (status === "error") setStatus("idle");
              }}
              className={inputClass}
            />
          </div>

          {/* Email address */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-300">
              Email address
            </label>
            <input
              type="email"
              required
              name="email"
              autoComplete="email"
              disabled={isSubmitting}
              value={values.email}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, email: e.target.value }));
                if (status === "error") setStatus("idle");
              }}
              className={inputClass}
            />
          </div>
        </div>

        {/* Message Textarea: matches highlighted lime ring in screenshot */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-zinc-300">
            Message
          </label>
          <textarea
            required
            name="message"
            rows={6}
            disabled={isSubmitting}
            value={values.message}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, message: e.target.value }));
              if (status === "error") setStatus("idle");
            }}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-[#07080b] p-4 text-sm text-white placeholder:text-zinc-600 transition-colors duration-150 focus:border-[#c4f042] focus:outline-none focus:ring-1 focus:ring-[#c4f042] disabled:opacity-50 resize-none"
          />
        </div>

        {status === "error" && errorMessage && (
          <p className="text-xs text-red-400">{errorMessage}</p>
        )}

        {status === "success" && (
          <div className="rounded-2xl border border-[#c4f042]/30 bg-[#c4f042]/10 p-4 text-xs text-[#c4f042]">
            ✓ Message sent successfully! I will review your requirements and respond shortly.
          </div>
        )}

        {/* Action Button: matches screenshot Electric Lime pill */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-[#c4f042] px-8 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-[#b2e232] hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            <span>{isSubmitting ? "Sending message…" : "Send message"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
