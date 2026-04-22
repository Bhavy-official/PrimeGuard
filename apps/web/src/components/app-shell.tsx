import type { PropsWithChildren, ReactNode } from "react";

import { formatRelativeGreeting } from "../lib/utils";
import { useAuth } from "../hooks/use-auth";

export const AppShell = ({ children }: PropsWithChildren): ReactNode => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-hero-grid">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="panel mb-6 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-200/80">
              {formatRelativeGreeting()}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white">
              PrimeTrade Control Deck
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Stay on top of your execution pipeline with clean task tracking, fast filtering,
              and secure session management.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <p className="font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-slate-400">
                {user?.email} · {user?.role}
              </p>
            </div>
            <button className="button-secondary" onClick={() => void logout()} type="button">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
