import type { ApiResponse } from "../types/api";
import type { Task, TaskFilters, TaskFormInput, TaskListMeta } from "../types/task";
import { apiClient } from "./client";

const buildTaskParams = (filters: TaskFilters) => {
  return {
    limit: filters.limit,
    page: filters.page,
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
};

export const taskApi = {
  async list(filters: TaskFilters) {
    const response = await apiClient.get<ApiResponse<Task[]>>("/tasks", {
      params: buildTaskParams(filters),
    });

    return {
      items: response.data.data ?? [],
      meta: (response.data.meta ?? {}) as TaskListMeta,
      message: response.data.message,
    };
  },

  async create(payload: TaskFormInput) {
    const response = await apiClient.post<ApiResponse<Task>>("/tasks", {
      ...payload,
      dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined,
    });
    return response.data;
  },

  async update(taskId: string, payload: Partial<TaskFormInput>) {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}`, {
      ...payload,
      ...(payload.dueDate !== undefined
        ? { dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : null }
        : {}),
    });
    return response.data;
  },

  async remove(taskId: string) {
    const response = await apiClient.delete<ApiResponse<undefined>>(`/tasks/${taskId}`);
    return response.data;
  },
};
