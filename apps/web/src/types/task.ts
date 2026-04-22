export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface TaskFilters {
  search: string;
  status: "" | TaskStatus;
  priority: "" | TaskPriority;
  sortBy: "createdAt" | "updatedAt" | "dueDate" | "priority" | "status" | "title";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface TaskListMeta {
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filters?: Record<string, unknown>;
}

export interface TaskFormInput {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}
