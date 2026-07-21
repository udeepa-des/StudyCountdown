import TodoItem from "./TodoItem";

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

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
  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

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

        {completedCount > 0 && (
          <button
            className="secondary-button todo-clear-button"
            onClick={onClearCompleted}
          >
            Clear completed
          </button>
        )}
      </div>

      <p className="todo-count">
        {activeCount} {activeCount === 1 ? "task" : "tasks"} left
      </p>

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
        <ul className="plans-list todo-items-list scrollable-container">
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
    </div>
  );
};

export default TodoList;
