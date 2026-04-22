import type { ReactNode } from "react";

import { cn } from "../lib/utils";

interface AlertProps {
  children: ReactNode;
  tone: "error" | "success" | "info";
}

const toneClasses: Record<AlertProps["tone"], string> = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-100",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
};

export const Alert = ({ children, tone }: AlertProps) => {
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm", toneClasses[tone])}>{children}</div>;
};
