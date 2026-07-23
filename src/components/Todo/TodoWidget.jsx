import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import "./Todo.css";

const TodoWidget = ({
  todos,
  loading,
  filter,
  setFilter,
  onAddTodo,
  onToggle,
  onUpdate,
  onDelete,
  onClearCompleted,
}) => {
  return (
    <div className="card todo-card">
      <h2>To-Do</h2>
      <TodoForm onAddTodo={onAddTodo} />
      <TodoList
        todos={todos}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
        onToggle={onToggle}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onClearCompleted={onClearCompleted}
      />
    </div>
  );
};

export default TodoWidget;
