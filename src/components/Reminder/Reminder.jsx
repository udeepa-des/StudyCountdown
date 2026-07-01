// Reminder.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./Reminder.css";

const Reminder = ({
  shouldDisplay,
  darkMode,
  onReminderTrigger,
  targetName,
  targetDate,
  notificationEmail,
  onSnoozeReady,
  phone,
}) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newReminder, setNewReminder] = useState({
    label: "",
    date: "",
    time: "09:00",
    advanceNotice: "0",
    advanceUnit: "hours",
    isActive: true,
    triggered: false,
    snoozedUntil: null, // Track when snooze ends
  });
  const [isAdding, setIsAdding] = useState(false);

  // Load reminders from API on mount
  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(response.data || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      // Fallback to localStorage if API fails
      const savedReminders = localStorage.getItem("userReminders");
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } finally {
      setLoading(false);
    }
  };

  // Save reminders to API whenever they change
  const saveRemindersToAPI = async (updatedReminders) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/reminders",
        { reminders: updatedReminders },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      localStorage.setItem("userReminders", JSON.stringify(updatedReminders));
    } catch (error) {
      console.error("Error saving reminders:", error);
      localStorage.setItem("userReminders", JSON.stringify(updatedReminders));
    }
  };

  // Check reminders every 30 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      let hasChanges = false;

      const updatedReminders = reminders.map((reminder) => {
        if (!reminder.isActive) return reminder;

        let updated = { ...reminder };

        // Snooze expiry check
        if (updated.snoozedUntil) {
          const snoozeEnd = new Date(updated.snoozedUntil);
          if (now >= snoozeEnd) {
            updated.snoozedUntil = null;
            updated.triggered = false;
            hasChanges = true;
          } else {
            return updated; // still snoozed
          }
        }

        if (updated.triggered) return updated;

        const reminderDateTime = new Date(`${updated.date}T${updated.time}`);
        let advanceMs = 0;
        switch (updated.advanceUnit) {
          case "minutes":
            advanceMs = parseInt(updated.advanceNotice) * 60 * 1000;
            break;
          case "hours":
            advanceMs = parseInt(updated.advanceNotice) * 60 * 60 * 1000;
            break;
          case "days":
            advanceMs = parseInt(updated.advanceNotice) * 24 * 60 * 60 * 1000;
            break;
          default:
            advanceMs = 0;
        }

        const triggerTime = new Date(reminderDateTime.getTime() - advanceMs);
        const timeDiff = now - triggerTime;

        // 90s window covers the 30s polling gap
        if (timeDiff >= 0 && timeDiff < 90000) {
          updated.triggered = true;
          hasChanges = true;
          triggerReminder(updated);
        }

        return updated;
      });

      if (hasChanges) {
        setReminders(updatedReminders);
        saveRemindersToAPI(updatedReminders);
      }
    };

    const interval = setInterval(checkReminders, 30000);
    checkReminders();
    return () => clearInterval(interval);
  }, [reminders]);

  const triggerReminder = (reminder) => {
    if (onReminderTrigger) {
      onReminderTrigger({
        id: reminder.id,
        label: reminder.label,
        date: reminder.date,
        time: reminder.time,
        targetName: targetName || reminder.label,
        targetDate: reminder.date,
        reminderTime: `${reminder.advanceNotice} ${reminder.advanceUnit} before`,
        notificationEmail,
        phone,
        reminder,
      });
    }
  };

  const snoozeReminder = (reminderId) => {
    setReminders((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== reminderId) return r;
        const snoozeUntil = new Date();
        snoozeUntil.setMinutes(snoozeUntil.getMinutes() + 5);
        return {
          ...r,
          snoozedUntil: snoozeUntil.toISOString(),
          triggered: false, // false so check loop can re-trigger after snooze
        };
      });
      saveRemindersToAPI(updated);
      return updated;
    });
  };

  useEffect(() => {
    if (typeof onSnoozeReady === "function") {
      onSnoozeReady(snoozeReminder);
    }
  }, [reminders]);

  // Handle snooze from modal
  const handleSnooze = (reminderId) => {
    const updatedReminders = reminders.map((r) => {
      if (r.id === reminderId) {
        const snoozeUntil = new Date();
        snoozeUntil.setMinutes(snoozeUntil.getMinutes() + 5);
        return {
          ...r,
          snoozedUntil: snoozeUntil.toISOString(),
          triggered: true, // Keep triggered true during snooze
        };
      }
      return r;
    });

    setReminders(updatedReminders);
    saveRemindersToAPI(updatedReminders);
  };

  const handleAddReminder = async () => {
    if (!newReminder.label || !newReminder.date) {
      alert("Please fill in all required fields");
      return;
    }
    const reminder = {
      id: Date.now().toString(),
      ...newReminder,
      triggered: false,
      snoozedUntil: null,
      createdAt: new Date().toISOString(),
    };
    const updatedReminders = [...reminders, reminder];
    setReminders(updatedReminders);
    await saveRemindersToAPI(updatedReminders);
    setNewReminder({
      label: "",
      date: "",
      time: "09:00",
      advanceNotice: "0",
      advanceUnit: "hours",
      isActive: true,
      triggered: false,
      snoozedUntil: null,
    });
    setIsAdding(false);
  };

  const handleDeleteReminder = async (id) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      const updatedReminders = reminders.filter((r) => r.id !== id);
      setReminders(updatedReminders);
      await saveRemindersToAPI(updatedReminders);
    }
  };

  const handleToggleReminder = async (id) => {
    const updatedReminders = reminders.map((r) =>
      r.id === id
        ? { ...r, isActive: !r.isActive, triggered: false, snoozedUntil: null }
        : r,
    );
    setReminders(updatedReminders);
    await saveRemindersToAPI(updatedReminders);
  };

  const formatDateTime = (date, time) => {
    if (!date) return "Not set";
    try {
      return new Date(`${date}T${time}`).toLocaleString();
    } catch {
      return `${date} ${time}`;
    }
  };

  const getReminderStatus = (reminder) => {
    if (!reminder.isActive) return "Inactive";

    // Check if snoozed
    if (reminder.snoozedUntil) {
      const snoozeEnd = new Date(reminder.snoozedUntil);
      const now = new Date();
      if (now < snoozeEnd) {
        const diff = snoozeEnd - now;
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `Snoozed (${minutes}m ${seconds}s)`;
      }
    }

    if (reminder.triggered) return "Triggered ✓";

    const now = new Date();
    const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
    let advanceMs = 0;

    switch (reminder.advanceUnit) {
      case "minutes":
        advanceMs = parseInt(reminder.advanceNotice) * 60 * 1000;
        break;
      case "hours":
        advanceMs = parseInt(reminder.advanceNotice) * 60 * 60 * 1000;
        break;
      case "days":
        advanceMs = parseInt(reminder.advanceNotice) * 24 * 60 * 60 * 1000;
        break;
      default:
        advanceMs = 0;
    }

    const triggerTime = new Date(reminderDateTime.getTime() - advanceMs);

    if (triggerTime < now) {
      return "Missed";
    }

    const diff = reminderDateTime.getTime() - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `In ${days}d ${hours}h ${minutes}m`;
  };

  return (
    <>
      {shouldDisplay && (
        <div className={"reminder-card"}>
          <div className="reminder-header">
            <div className="reminder-icon">🔔</div>
            <h3>Reminders</h3>
            <button
              className="add-reminder-btn"
              onClick={() => setIsAdding(!isAdding)}
            >
              {isAdding ? "✕" : "+"}
            </button>
          </div>

          <div className="reminder-content">
            {loading && (
              <div className="loading-spinner">Loading reminders...</div>
            )}

            {isAdding && (
              <div className="reminder-form">
                <input
                  type="text"
                  placeholder="Reminder label *"
                  value={newReminder.label}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, label: e.target.value })
                  }
                  className="reminder-input"
                />

                <div className="form-row">
                  <input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, date: e.target.value })
                    }
                    className="reminder-input"
                    required
                  />
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, time: e.target.value })
                    }
                    className="reminder-input"
                  />
                </div>

                <div className="form-row">
                  <div className="advance-control">
                    <input
                      type="number"
                      min="0"
                      value={newReminder.advanceNotice}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          advanceNotice: e.target.value,
                        })
                      }
                      className="reminder-input advance-input"
                      placeholder="0"
                    />
                    <select
                      value={newReminder.advanceUnit}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          advanceUnit: e.target.value,
                        })
                      }
                      className="reminder-select"
                    >
                      <option value="minutes">Minutes Before</option>
                      <option value="hours">Hours Before</option>
                      <option value="days">Days Before</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-reminder-btn"
                    onClick={handleAddReminder}
                  >
                    Add Reminder
                  </button>
                </div>
              </div>
            )}

            <div className="reminders-list">
              {reminders.length === 0 ? (
                <p className="no-reminders">
                  No reminders set. Click + to add one.
                </p>
              ) : (
                reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`reminder-item ${!reminder.isActive ? "inactive" : ""} ${reminder.triggered ? "triggered" : ""} ${reminder.snoozedUntil ? "snoozed" : ""}`}
                  >
                    <div className="reminder-info">
                      <div className="reminder-label">
                        <span className="reminder-title">{reminder.label}</span>
                        <span className="reminder-status">
                          {getReminderStatus(reminder)}
                        </span>
                      </div>
                      <div className="reminder-datetime">
                        📅 {formatDateTime(reminder.date, reminder.time)}
                      </div>
                      {parseInt(reminder.advanceNotice) > 0 && (
                        <div className="reminder-advance">
                          ⏰ {reminder.advanceNotice} {reminder.advanceUnit}{" "}
                          before
                        </div>
                      )}
                      {reminder.snoozedUntil && (
                        <div className="reminder-snooze-info">
                          🔄 Snoozed until:{" "}
                          {new Date(reminder.snoozedUntil).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    <div className="reminder-actions">
                      <button
                        className={`toggle-btn ${reminder.isActive ? "active" : "inactive"}`}
                        onClick={() => handleToggleReminder(reminder.id)}
                        title={reminder.isActive ? "Deactivate" : "Activate"}
                      >
                        {reminder.isActive ? "🔔" : "🔕"}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        title="Delete reminder"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {reminders.length > 0 && (
              <div className="reminder-summary">
                <span>
                  Total: {reminders.length} | Active:{" "}
                  {reminders.filter((r) => r.isActive).length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Reminder;
