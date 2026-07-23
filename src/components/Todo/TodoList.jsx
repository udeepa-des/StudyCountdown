import { useState, useMemo } from "react";
import TodoItem from "./TodoItem";
import Select from "../Select/Select";

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

const sortOptions = [
  { value: "priority", label: "Priority" },
  { value: "dueDate", label: "Due date" },
  { value: "createdAt-desc", label: "Newest first" },
  { value: "createdAt-asc", label: "Oldest first" },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const sortTodos = (todos, sortBy) => {
  const compareFns = {
    priority: (a, b) => {
      const aP = PRIORITY_ORDER[a.priority] ?? PRIORITY_ORDER.medium;
      const bP = PRIORITY_ORDER[b.priority] ?? PRIORITY_ORDER.medium;
      if (aP !== bP) return aP - bP;

      if (!a.dueDate && !b.dueDate)
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    },

    dueDate: (a, b) => {
      if (!a.dueDate && !b.dueDate)
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    },

    "createdAt-asc": (a, b) => new Date(a.createdAt) - new Date(b.createdAt),

    "createdAt-desc": (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  };

  const compareFn = compareFns[sortBy] || compareFns["createdAt-desc"];

  // Completed items always sink to the bottom, regardless of sort choice
  const active = todos.filter((t) => !t.completed).sort(compareFn);
  const completed = todos.filter((t) => t.completed).sort(compareFn);

  return [...active, ...completed];
};

const TodoList = ({
  todos,
  filter,
  setFilter,
  loading,
  onToggle,
  onDelete,
  onUpdate,
  onClearCompleted,
}) => {
  const [sortBy, setSortBy] = useState("createdAt-desc");

  const filtered = useMemo(() => {
    const byFilter = todos.filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    });
    return sortTodos(byFilter, sortBy);
  }, [todos, filter, sortBy]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <div className="todo-list-container">
      <div className="todo-list-header">
        <div className="tabs-container todo-filter-tabs">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`tab-button ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="todo-list-header-right">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e)}
          />
          {/* <select
            className="todo-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort tasks by"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                Sort: {opt.label}
              </option>
            ))}
          </select> */}

          {completedCount > 0 && (
            <button
              className="secondary-button todo-clear-button"
              onClick={onClearCompleted}
            >
              Clear completed
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {filter === "completed"
            ? "No completed tasks yet."
            : filter === "active"
              ? "Nothing pending — nice work!"
              : "No tasks yet. Add one above."}
        </div>
      ) : (
        <ul className="todo-items-list scrollable-container">
          {filtered.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      )}

      <p className="todo-count">
        {activeCount} {activeCount === 1 ? "task" : "tasks"} left
        <span className="task-separator">|</span>
        {completedCount} {completedCount === 1 ? "task" : "tasks"} completed
      </p>
    </div>
  );
};

export default TodoList;
