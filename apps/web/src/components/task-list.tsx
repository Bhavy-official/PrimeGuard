import type { Task } from "../types/task";
import { formatDate, priorityTone, statusTone } from "../lib/utils";

interface TaskListProps {
  isLoading: boolean;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
  tasks: Task[];
}

export const TaskList = ({ isLoading, onDelete, onEdit, tasks }: TaskListProps) => {
  if (isLoading) {
    return (
      <div className="panel p-8 text-center text-sm text-slate-400">
        Loading tasks and syncing the latest view...
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="panel p-8 text-center">
        <h3 className="font-display text-2xl font-bold text-white">No tasks found</h3>
        <p className="mt-2 text-sm text-slate-400">
          Try broadening your filters or create a new task to populate the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <article key={task.id} className="panel p-5 transition hover:border-brand-400/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${statusTone[task.status]}`}>{task.status.replace("_", " ")}</span>
                <span className={`badge ${priorityTone[task.priority]}`}>{task.priority}</span>
              </div>
              <h3 className="mt-4 truncate font-display text-2xl font-bold text-white">{task.title}</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {task.description || "No description provided."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 lg:min-w-64">
              <p className="font-semibold text-white">Due</p>
              <p className="mt-1">{formatDate(task.dueDate)}</p>
              <p className="mt-4 font-semibold text-white">Updated</p>
              <p className="mt-1">{formatDate(task.updatedAt)}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="button-secondary" onClick={() => onEdit(task)} type="button">
              Edit
            </button>
            <button className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20" onClick={() => void onDelete(task.id)} type="button">
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};
