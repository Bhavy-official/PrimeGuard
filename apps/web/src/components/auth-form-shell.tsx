import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthFormShellProps extends PropsWithChildren {
  footerLinkLabel: string;
  footerLinkTo: string;
  footerText: string;
  subtitle: string;
  title: string;
}

export const AuthFormShell = ({
  children,
  footerLinkLabel,
  footerLinkTo,
  footerText,
  subtitle,
  title,
}: AuthFormShellProps): ReactNode => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-grid px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-panel backdrop-blur lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden bg-gradient-to-br from-brand-600/30 via-slate-950 to-sky-950 p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-brand-200">PrimeGuard</p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight text-white">
              Build momentum with a secure execution workspace.
            </h1>
            <p className="mt-6 max-w-md text-base text-slate-300">
              Authentication, role-based access, and task operations in one focused command
              center.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Access + refresh tokens",
              "Protected task workflows",
              "Paginated dashboard views",
              "Clean operational feedback",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Welcome back</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-white">{title}</h2>
          <p className="mt-3 text-sm text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-sm text-slate-400">
            {footerText}{" "}
            <Link className="font-semibold text-brand-300 hover:text-brand-200" to={footerLinkTo}>
              {footerLinkLabel}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};
