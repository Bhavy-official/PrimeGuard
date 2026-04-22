import axios from "axios";
import { useEffect, useState } from "react";

import { taskApi } from "../api/task-api";
import { Alert } from "../components/alert";
import { AppShell } from "../components/app-shell";
import { PaginationControls } from "../components/pagination-controls";
import { TaskFiltersPanel } from "../components/task-filters";
import { TaskForm } from "../components/task-form";
import { TaskList } from "../components/task-list";
import { useAuth } from "../hooks/use-auth";
import type { Task, TaskFilters, TaskFormInput } from "../types/task";

const defaultFilters: TaskFilters = {
  limit: 10,
  page: 1,
  priority: "",
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  status: "",
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    totalItems: 0,
    totalPages: 1,
  });
  const [feedback, setFeedback] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null);

  const loadTasks = async () => {
    setIsLoading(true);

    try {
      const response = await taskApi.list(filters);
      setTasks(response.items);
      setPagination(
        response.meta.pagination ?? {
          limit: filters.limit,
          page: filters.page,
          totalItems: response.items.length,
          totalPages: 1,
        },
      );
      setFeedback({ text: response.message, tone: "info" });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined) ?? "Failed to load tasks."
        : "Failed to load tasks.";
      setFeedback({ text: message, tone: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, [filters]);

  const handleSubmit = async (values: TaskFormInput) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (editingTask) {
        const response = await taskApi.update(editingTask.id, values);
        setFeedback({ text: response.message, tone: "success" });
      } else {
        const response = await taskApi.create(values);
        setFeedback({ text: response.message, tone: "success" });
      }

      setEditingTask(null);
      await loadTasks();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined) ?? "Failed to save task."
        : "Failed to save task.";
      setFeedback({ text: message, tone: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const response = await taskApi.remove(taskId);
      setFeedback({ text: response.message, tone: "success" });

      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }

      await loadTasks();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined) ?? "Failed to delete task."
        : "Failed to delete task.";
      setFeedback({ text: message, tone: "error" });
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.6fr]">
        <div className="space-y-6">
          <section className="panel p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-brand-300">Operator Snapshot</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-white">
              {user?.firstName}, your workflow is live.
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Loaded</p>
                <p className="mt-3 text-3xl font-extrabold text-white">{pagination.totalItems}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current Page</p>
                <p className="mt-3 text-3xl font-extrabold text-white">{pagination.page}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Access Level</p>
                <p className="mt-3 text-3xl font-extrabold text-white">{user?.role}</p>
              </div>
            </div>
          </section>

          <TaskForm
            initialTask={editingTask}
            isSubmitting={isSubmitting}
            onCancelEdit={() => setEditingTask(null)}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="space-y-6">
          {feedback ? <Alert tone={feedback.tone}>{feedback.text}</Alert> : null}

          <TaskFiltersPanel filters={filters} onChange={setFilters} />

          <TaskList isLoading={isLoading} onDelete={handleDelete} onEdit={setEditingTask} tasks={tasks} />

          <PaginationControls
            currentPage={pagination.page}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            totalPages={pagination.totalPages}
          />
        </div>
      </div>
    </AppShell>
  );
};
