"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiClientError } from "@/lib/admin/api-client";
import { useAuth } from "@/lib/admin/auth-context";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Rate-limit countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          setErrorBanner(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || countdown !== null) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorBanner("Please enter your administrator email address.");
      return;
    }
    if (!password) {
      setErrorBanner("Please enter your administrator password.");
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);

    try {
      await login({
        email: trimmedEmail,
        password,
      });
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setErrorBanner("Invalid email or password. Please check your credentials.");
        } else if (err.status === 429) {
          const retrySec = err.retryAfter || 300;
          setCountdown(retrySec);
          setErrorBanner(
            `Rate limit exceeded. Too many failed attempts. Please wait ${retrySec}s.`
          );
        } else {
          setErrorBanner(err.message || "Authentication failed. Please try again.");
        }
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setErrorBanner(
          "Unable to connect to the backend API server. Ensure the backend service is running."
        );
      } else {
        setErrorBanner("An unexpected error occurred during authentication.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-accent">
            ADMINISTRATION / PORTFOLIO CMS
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
            Control Center Sign In
          </h1>
          <p className="mt-2 text-sm text-muted">
            Authenticated access for the portfolio owner.
          </p>
        </div>

        {/* Card Frame */}
        <section className="section-frame rounded-2xl p-6 sm:p-8">
          {errorBanner && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-base" aria-hidden="true">
                  ⚠
                </span>
                <div className="flex-1 leading-5">
                  <p>{errorBanner}</p>
                  {countdown !== null && (
                    <p className="mt-1 font-mono text-xs text-red-300">
                      Unlocking in {countdown}s...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium text-foreground"
              >
                Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting || countdown !== null}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-2 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/90 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-foreground"
                >
                  Password
                </label>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs text-accent hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isSubmitting || countdown !== null}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-2 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/90 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || countdown !== null}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden="true"
                  />
                  <span>Signing in...</span>
                </>
              ) : countdown !== null ? (
                <span>Rate limited ({countdown}s)</span>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#1e293b] pt-4 text-center">
            <Link
              href="/"
              className="font-mono text-xs text-subtle transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              ← Return to public website
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
