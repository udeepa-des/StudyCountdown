import { useState } from "react";
import { FaPlus, FaRegCalendarAlt } from "react-icons/fa";
import PriorityDropdown from "../PriorityDropdown/PriorityDropdown";
import CalendarPicker from "../CalenderPicker/Calendarpicker";

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

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <form className="todo-form-card" onSubmit={handleSubmit}>
      <div className="todo-form-row">
        <input
          type="text"
          className="form-input"
          placeholder="Add a new task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
        />
        <CalendarPicker
          value={dueDate}
          onChange={(value) => setDueDate(value)}
          placeholder="Select date"
          minDate={yesterday.toISOString().split("T")[0]}
          required
          className="reminder-picker-flex"
        />
        <PriorityDropdown
          options={priorityOptions}
          value={priority}
          onChange={(value) => setPriority(value)}
          placeholder="Select priority..."
        />
        <button
          type="submit"
          className="primary-button todo-add-button"
          disabled={!text.trim() || submitting}
        >
          <FaPlus size={12} />
          <span>Create Todo</span>
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
