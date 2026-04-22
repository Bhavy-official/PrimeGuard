import type { ChangeEvent } from "react";

import type { TaskFilters } from "../types/task";

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export const TaskFiltersPanel = ({ filters, onChange }: TaskFiltersProps) => {
  const handleChange =
    (field: keyof TaskFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const nextValue = event.target.value;

      onChange({
        ...filters,
        [field]:
          field === "page" || field === "limit"
            ? Number(nextValue)
            : nextValue,
        page: field === "page" ? Number(nextValue) : 1,
      });
    };

  return (
    <div className="panel p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <label className="label" htmlFor="search">
            Search
          </label>
          <input
            className="input"
            id="search"
            onChange={handleChange("search")}
            placeholder="Search by title or description"
            value={filters.search}
          />
        </div>

        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select className="input" id="status" onChange={handleChange("status")} value={filters.status}>
            <option value="">All statuses</option>
            {["TODO", "IN_PROGRESS", "COMPLETED"].map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select className="input" id="priority" onChange={handleChange("priority")} value={filters.priority}>
            <option value="">All priorities</option>
            {["LOW", "MEDIUM", "HIGH"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="sortBy">
            Sort By
          </label>
          <select className="input" id="sortBy" onChange={handleChange("sortBy")} value={filters.sortBy}>
            {["createdAt", "updatedAt", "dueDate", "priority", "status", "title"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div>
            <label className="label" htmlFor="sortOrder">
              Sort Order
            </label>
            <select className="input min-w-32" id="sortOrder" onChange={handleChange("sortOrder")} value={filters.sortOrder}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="limit">
              Page Size
            </label>
            <select className="input min-w-28" id="limit" onChange={handleChange("limit")} value={filters.limit}>
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="button-secondary"
          onClick={() =>
            onChange({
              limit: 10,
              page: 1,
              priority: "",
              search: "",
              sortBy: "createdAt",
              sortOrder: "desc",
              status: "",
            })
          }
          type="button"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
