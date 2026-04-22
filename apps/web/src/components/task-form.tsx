import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import type { Task, TaskFormInput } from "../types/task";

interface TaskFormProps {
  initialTask?: Task | null;
  isSubmitting: boolean;
  onCancelEdit?: () => void;
  onSubmit: (values: TaskFormInput) => Promise<void>;
}

const defaultValues: TaskFormInput = {
  description: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "TODO",
  title: "",
};

export const TaskForm = ({ initialTask, isSubmitting, onCancelEdit, onSubmit }: TaskFormProps) => {
  const [values, setValues] = useState<TaskFormInput>(defaultValues);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!initialTask) {
      setValues(defaultValues);
      setDueDate(null);
      return;
    }

    setValues({
      description: initialTask.description ?? "",
      dueDate: initialTask.dueDate ?? "",
      priority: initialTask.priority,
      status: initialTask.status,
      title: initialTask.title,
    });

    setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate) : null);
  }, [initialTask]);

  return (
    <form
      className="panel p-5"
      onSubmit={(event) => {
        event.preventDefault();

        const payload = {
          ...values,
          dueDate: dueDate ? dueDate.toISOString() : "",
        };

        void onSubmit(payload);
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            {initialTask ? "Edit Task" : "Create Task"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Capture, prioritize, and update execution work without leaving the dashboard.
          </p>
        </div>

        {initialTask ? (
          <button className="button-secondary" onClick={onCancelEdit} type="button">
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            className="input"
            id="title"
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Enter a task title"
            required
            value={values.title}
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            className="input min-h-28"
            id="description"
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Add optional context"
            value={values.description}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label" htmlFor="priority">
              Priority
            </label>
            <select
              className="input"
              id="priority"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  priority: event.target.value as TaskFormInput["priority"],
                }))
              }
              value={values.priority}
            >
              {["LOW", "MEDIUM", "HIGH"].map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              className="input"
              id="status"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  status: event.target.value as TaskFormInput["status"],
                }))
              }
              value={values.status}
            >
              {["TODO", "IN_PROGRESS", "COMPLETED"].map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Due Date</label>
            <DatePicker
              selected={dueDate}
              onChange={(date: Date | null) => setDueDate(date)}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select due date"
              className="input"
              minDate={new Date()}
              isClearable
              popperClassName="z-50"
            />
          </div>
        </div>
      </div>

      <button className="button-primary mt-6 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving..." : initialTask ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
};