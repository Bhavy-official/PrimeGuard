import axios from "axios";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { Alert } from "../components/alert";
import { AuthFormShell } from "../components/auth-form-shell";
import { useAuth } from "../hooks/use-auth";

export const RegisterPage = () => {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <AuthFormShell
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
      footerText="Already have an account?"
      subtitle="Create your secure workspace account and start managing tasks right away."
      title="Create your account"
    >
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setFeedback(null);

          try {
            await register(form);
            setFeedback({ text: "Registration successful. Redirecting to the dashboard...", tone: "success" });
            navigate("/dashboard", { replace: true });
          } catch (error) {
            const message = axios.isAxiosError(error)
              ? (error.response?.data?.message as string | undefined) ?? "Registration failed."
              : "Registration failed.";
            setFeedback({ text: message, tone: "error" });
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {feedback ? <Alert tone={feedback.tone}>{feedback.text}</Alert> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="firstName">
              First Name
            </label>
            <input
              className="input"
              id="firstName"
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              placeholder="Ava"
              required
              value={form.firstName}
            />
          </div>

          <div>
            <label className="label" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="input"
              id="lastName"
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              placeholder="Sharma"
              required
              value={form.lastName}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            className="input"
            id="email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            required
            type="email"
            value={form.email}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            className="input"
            id="password"
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Use a strong password"
            required
            type="password"
            value={form.password}
          />
          <p className="mt-2 text-xs text-slate-500">
            Use at least 8 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>

        <button className="button-primary w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-sm text-slate-400">
          Already have access?{" "}
          <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/login">
            Sign in instead
          </Link>
        </p>
      </form>
    </AuthFormShell>
  );
};
