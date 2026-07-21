import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const TodoForm = ({ onAddTodo }) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await onAddTodo({
        text: trimmed,
        priority,
        dueDate: dueDate || null,
      });
      setText("");
      setPriority("medium");
      setDueDate("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-input todo-text-input"
        placeholder="Add a new task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
      />

      <div className="todo-form-row">
        <select
          className="form-input todo-priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          className="form-input todo-date-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button
          type="submit"
          className="primary-button todo-add-button"
          disabled={!text.trim() || submitting}
        >
          <FaPlus />
          <span>Add</span>
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
