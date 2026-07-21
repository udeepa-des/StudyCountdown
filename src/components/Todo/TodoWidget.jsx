import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import ConfirmationPopup from "../ConfirmationPopup/ConfirmationPopup";
import "./Todo.css";

const STORAGE_KEY = "userTodos";

const TodoWidget = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const persistLocal = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/todos");
      setTodos(response.data || []);
      persistLocal(response.data || []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      const saved = localStorage.getItem(STORAGE_KEY);
      setTodos(saved ? JSON.parse(saved) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (newTodo) => {
    const optimistic = {
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
      ...newTodo,
    };
    const updated = [optimistic, ...todos];
    setTodos(updated);
    persistLocal(updated);

    try {
      const response = await axios.post("/api/todos", newTodo);
      const withServerId = updated.map((t) =>
        t.id === optimistic.id ? response.data : t,
      );
      setTodos(withServerId);
      persistLocal(withServerId);
      toast.success("Task added");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Saved locally — couldn't reach the server");
    }
  };

  const handleToggle = async (id) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTodos(updated);
    persistLocal(updated);

    try {
      await axios.patch(`/api/todos/${id}/toggle`);
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast.error("Couldn't sync task status");
    }
  };

  const handleUpdate = async (id, fields) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, ...fields } : t));
    setTodos(updated);
    persistLocal(updated);

    try {
      await axios.put(`/api/todos/${id}`, fields);
      toast.success("Task updated");
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Couldn't sync the update");
    }
  };

  const requestDelete = (id) => {
    setTodoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!todoToDelete) return;
    setIsDeleting(true);
    try {
      const updated = todos.filter((t) => t.id !== todoToDelete);
      setTodos(updated);
      persistLocal(updated);
      await axios.delete(`/api/todos/${todoToDelete}`);
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Something went wrong when deleting the task");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setTodoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setTodoToDelete(null);
  };

  const requestClearCompleted = () => setShowClearDialog(true);

  const confirmClearCompleted = async () => {
    setIsDeleting(true);
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    try {
      const updated = todos.filter((t) => !t.completed);
      setTodos(updated);
      persistLocal(updated);
      await Promise.all(
        completedIds.map((id) => axios.delete(`/api/todos/${id}`)),
      );
      toast.success("Completed tasks cleared");
    } catch (error) {
      console.error("Error clearing completed todos:", error);
      toast.error("Something went wrong clearing completed tasks");
    } finally {
      setIsDeleting(false);
      setShowClearDialog(false);
    }
  };

  return (
    <div className="card todo-card">
      <h2>To-Do</h2>
      <TodoForm onAddTodo={handleAddTodo} />
      <TodoList
        todos={todos}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
        onToggle={handleToggle}
        onDelete={requestDelete}
        onUpdate={handleUpdate}
        onClearCompleted={requestClearCompleted}
      />

      <ConfirmationPopup
        isOpen={showDeleteDialog}
        message="Are you sure you want to delete this task?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Deleting..."
      />

      <ConfirmationPopup
        isOpen={showClearDialog}
        message="Delete all completed tasks?"
        onConfirm={confirmClearCompleted}
        onCancel={() => setShowClearDialog(false)}
        confirmLabel="Clear"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        loadingLabel="Clearing..."
      />
    </div>
  );
};

export default TodoWidget;
