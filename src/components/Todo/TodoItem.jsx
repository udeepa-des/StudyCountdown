import { useState, useRef, useEffect } from "react";
import PriorityDropdown from "../PriorityDropdown/PriorityDropdown";
import CalendarPicker from "../CalenderPicker/Calendarpicker";

const priorityLabel = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const TodoItem = ({ todo, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);
  const [draftPriority, setDraftPriority] = useState(todo.priority || "medium");
  const [draftDueDate, setDraftDueDate] = useState(todo.dueDate || "");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  const MAX_LENGTH = 40;
  const shouldTruncate = todo.text.length > MAX_LENGTH;

  const displayText =
    shouldTruncate && !isExpanded
      ? `${todo.text.slice(0, MAX_LENGTH)}...`
      : todo.text;

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEdit = () => {
    setDraftText(todo.text);
    setDraftPriority(todo.priority || "medium");
    setDraftDueDate(todo.dueDate || "");
    setIsEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draftText.trim();
    if (!trimmed) {
      // Don't allow saving an empty task; just revert text
      setDraftText(todo.text);
      return;
    }

    const updates = {};
    if (trimmed !== todo.text) updates.text = trimmed;
    if (draftPriority !== todo.priority) updates.priority = draftPriority;
    if ((draftDueDate || null) !== (todo.dueDate || null))
      updates.dueDate = draftDueDate || null;

    if (Object.keys(updates).length > 0) {
      onUpdate(todo.id, updates);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraftText(todo.text);
    setDraftPriority(todo.priority || "medium");
    setDraftDueDate(todo.dueDate || "");
    setIsEditing(false);
  };

  const overdue = isOverdue(todo.dueDate, todo.completed);
  const formattedDue = formatDate(todo.dueDate);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <li className={`todo-item-card ${todo.completed ? "completed" : ""}`}>
      <div className="todo-card-top">
        <div className="todo-title-row">
          <button
            onClick={() => onToggle(todo.id)}
            className={`action-btn ${todo.completed ? "action-btn-undo" : "action-btn-complete"}`}
            title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
            disabled={isEditing}
          >
            {!todo.completed ? (
              <svg
                className="action-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                className="action-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 14L4 9m0 0l5-5M4 9h9a7 7 0 110 14h-1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {!isEditing && (
            <span className="todo-text" onDoubleClick={startEdit}>
              {displayText}
              {shouldTruncate && (
                <>
                  {" "}
                  <button
                    type="button"
                    className="todo-expand-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                </>
              )}
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="plan-actions-header">
            <button
              className="action-btn action-btn-undo"
              onClick={startEdit}
              title="Edit task"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              className="action-btn action-btn-delete"
              onClick={() => onDelete(todo.id)}
              title="Delete task"
            >
              <svg
                className="raction-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="todo-edit-panel">
          <input
            ref={inputRef}
            className="form-input todo-edit-input"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            maxLength={200}
          />

          <div className="todo-edit-row">
            <PriorityDropdown
              options={priorityOptions}
              value={draftPriority}
              onChange={setDraftPriority}
              className="todo-edit-priority"
            />
            <CalendarPicker
              value={draftDueDate}
              onChange={(value) => setDraftDueDate(value)}
              placeholder="Select date"
              minDate={yesterday.toISOString().split("T")[0]}
              className="todo-edit-date"
            />
          </div>

          <div className="todo-edit-actions">
            <button className="secondary-button" onClick={cancelEdit}>
              Cancel
            </button>
            <button
              className="primary-button"
              onClick={commitEdit}
              disabled={!draftText.trim()}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="plan-stats-row todo-stats-row">
          <span className={`todo-priority-badge priority-${todo.priority}`}>
            {priorityLabel[todo.priority] || "Medium"}
          </span>

          {formattedDue && (
            <span
              className={`stat-chip todo-due-chip ${overdue ? "overdue" : ""}`}
            >
              <svg
                className="stat-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="stat-value">{formattedDue}</span>
            </span>
          )}
        </div>
      )}
    </li>
  );
};

export default TodoItem;
