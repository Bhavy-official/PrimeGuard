import type { TaskPriority, TaskStatus } from "../types/task";

export const cn = (...values: Array<string | false | null | undefined>) => {
  return values.filter(Boolean).join(" ");
};

export const formatDate = (value: string | null) => {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatRelativeGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
};

export const priorityTone: Record<TaskPriority, string> = {
  HIGH: "bg-rose-500/15 text-rose-200",
  LOW: "bg-emerald-500/15 text-emerald-200",
  MEDIUM: "bg-amber-500/15 text-amber-200",
};

export const statusTone: Record<TaskStatus, string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-200",
  IN_PROGRESS: "bg-sky-500/15 text-sky-200",
  TODO: "bg-slate-500/20 text-slate-200",
};
