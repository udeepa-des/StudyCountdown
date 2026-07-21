import { useState, useRef, useEffect } from "react";
import { FaCheck, FaTrash, FaPen, FaTimes } from "react-icons/fa";

const priorityLabel = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};

const TodoItem = ({ todo, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = draftText.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdate(todo.id, { text: trimmed });
    } else {
      setDraftText(todo.text);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraftText(todo.text);
    setIsEditing(false);
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <button
        className={`todo-checkbox ${todo.completed ? "checked" : ""}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        {todo.completed && <FaCheck size={11} />}
      </button>

      <div className="todo-content">
        {isEditing ? (
          <input
            ref={inputRef}
            className="form-input todo-edit-input"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            onBlur={commitEdit}
            maxLength={200}
          />
        ) : (
          <span className="todo-text" onDoubleClick={() => setIsEditing(true)}>
            {todo.text}
          </span>
        )}

        <div className="todo-meta">
          <span className={`todo-priority-badge priority-${todo.priority}`}>
            {priorityLabel[todo.priority] || "Medium"}
          </span>
          {todo.dueDate && (
            <span
              className={`todo-due-badge ${isOverdue(todo.dueDate, todo.completed) ? "overdue" : ""}`}
            >
              {new Date(todo.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        {isEditing ? (
          <button
            className="action-button todo-icon-button"
            onClick={cancelEdit}
            aria-label="Cancel edit"
          >
            <FaTimes />
          </button>
        ) : (
          <button
            className="action-button todo-icon-button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit task"
          >
            <FaPen size={12} />
          </button>
        )}
        <button
          className="action-button delete-button todo-icon-button"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
        >
          <FaTrash size={12} />
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
