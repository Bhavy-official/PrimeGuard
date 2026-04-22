import axios from "axios";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { Alert } from "../components/alert";
import { AuthFormShell } from "../components/auth-form-shell";
import { useAuth } from "../hooks/use-auth";

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <AuthFormShell
      footerLinkLabel="Create one"
      footerLinkTo="/register"
      footerText="Need an account?"
      subtitle="Sign in to manage your tasks, monitor execution, and keep your workflow moving."
      title="Access your dashboard"
    >
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setFeedback(null);

          try {
            await login(form);
            setFeedback({ text: "Login successful. Redirecting to the dashboard...", tone: "success" });
            const redirectPath = (location.state as { from?: { pathname?: string } } | null)?.from
              ?.pathname;
            navigate(redirectPath ?? "/dashboard", { replace: true });
          } catch (error) {
            const message = axios.isAxiosError(error)
              ? (error.response?.data?.message as string | undefined) ?? "Login failed."
              : "Login failed.";
            setFeedback({ text: message, tone: "error" });
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {feedback ? <Alert tone={feedback.tone}>{feedback.text}</Alert> : null}

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
            placeholder="Enter your password"
            required
            type="password"
            value={form.password}
          />
        </div>

        <button className="button-primary w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-sm text-slate-400">
          Want to start fresh instead?{" "}
          <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/register">
            Register here
          </Link>
        </p>
      </form>
    </AuthFormShell>
  );
};
