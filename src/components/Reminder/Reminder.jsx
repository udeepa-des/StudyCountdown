// Reminder.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Select from "../Select/Select";
import CalendarPicker from "../CalenderPicker/CalendarPicker";
import TimePicker from "../TimePicker/TimePicker";
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
    exactTime: false,
    isActive: true,
    triggered: false,
    snoozedUntil: null,
  });
  const [isModalOpen, _setIsModalOpen] = useState(false);
  const setIsModalOpen = (val) => {
    console.trace("isModalOpen ->", val);
    _setIsModalOpen(val);
  };

  // Advance unit options for the select
  const advanceUnitOptions = [
    { value: "minutes", label: "Minutes Before" },
    { value: "hours", label: "Hours Before" },
    { value: "days", label: "Days Before" },
  ];

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
    setIsModalOpen(false);
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

  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("add-reminder-modal-overlay")) {
      setIsModalOpen(false);
    }
  };

  const getStatusClass = (reminder) => {
    if (!reminder.isActive) return "inactive";
    if (reminder.snoozedUntil) {
      const now = new Date();
      if (now < new Date(reminder.snoozedUntil)) return "snoozed";
    }
    if (reminder.triggered) return "triggered";
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
    if (triggerTime < now) return "missed";
    return "upcoming";
  };

  return (
    <>
      {shouldDisplay && (
        <div className="reminder-card">
          <div className="reminder-header">
            <h2>Reminders</h2>
            <button
              type="button"
              className="add-reminder-btn-text"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              Add Reminders
            </button>
          </div>

          <div className="reminder-content">
            {loading && (
              <div className="loading-spinner">Loading reminders...</div>
            )}

            <div className="reminders-list">
              {reminders.length === 0 ? (
                <p className="no-reminders">
                  No reminders set. Click Add Reminders to add one.
                </p>
              ) : (
                reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`reminder-item status-${getStatusClass(reminder)}`}
                  >
                    <div className="reminder-card-top">
                      <div className="reminder-title-row">
                        <h3 className="reminder-title">{reminder.label}</h3>
                        <span
                          className={`reminder-status-badge status-${getStatusClass(reminder)}`}
                        >
                          {getReminderStatus(reminder)}
                        </span>
                      </div>
                      <div className="reminder-actions-header">
                        <button
                          onClick={() => handleToggleReminder(reminder.id)}
                          className={`raction-btn ${reminder.isActive ? "raction-btn-active" : "raction-btn-muted"}`}
                          title={reminder.isActive ? "Deactivate" : "Activate"}
                        >
                          <svg
                            className="raction-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="raction-btn raction-btn-delete"
                          title="Delete reminder"
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
                    </div>

                    <div className="reminder-stats-row">
                      <div className="rstat-chip">
                        <svg
                          className="rstat-icon"
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
                        <span className="rstat-value">
                          {formatDateTime(reminder.date, reminder.time)}
                        </span>
                      </div>

                      {parseInt(reminder.advanceNotice) > 0 && (
                        <div className="rstat-chip">
                          <svg
                            className="rstat-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path
                              d="M12 6v6l4 2"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="rstat-value">
                            {reminder.advanceNotice} {reminder.advanceUnit}{" "}
                            before
                          </span>
                        </div>
                      )}

                      {reminder.snoozedUntil &&
                        getStatusClass(reminder) === "snoozed" && (
                          <div className="rstat-chip rstat-chip-snooze">
                            <svg
                              className="rstat-icon"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 0014.9 3M19.5 9a8 8 0 00-14.9-3"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="rstat-value">
                              Until{" "}
                              {new Date(
                                reminder.snoozedUntil,
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
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

      {/* Modal with unique class names */}
      {isModalOpen &&
        createPortal(
          <div
            className="add-reminder-modal-overlay"
            onMouseDown={handleOverlayClick}
          >
            <div
              className={`add-reminder-modal-content ${darkMode ? "dark-mode" : ""}`}
            >
              <div className="add-reminder-modal-header">
                <h4>Add Reminder</h4>
                <button
                  type="button"
                  className="add-reminder-modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="add-reminder-modal-body">
                <div className="add-reminder-form">
                  <input
                    type="text"
                    placeholder="Reminder label *"
                    value={newReminder.label}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, label: e.target.value })
                    }
                    className="form-input"
                  />

                  <label className="add-reminder-checkbox-row">
                    <input
                      type="checkbox"
                      className="exact-time-checkbox"
                      checked={newReminder.exactTime}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          exactTime: e.target.checked,
                          advanceNotice: e.target.checked
                            ? "0"
                            : newReminder.advanceNotice,
                        })
                      }
                    />
                    <span className="checkbox-custom" aria-hidden="true">
                      <svg viewBox="0 0 16 16" className="checkbox-check">
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                    <span className="checkbox-label-text">
                      Remind me at the exact time (no advance notice)
                    </span>
                  </label>

                  <div
                    className={`add-reminder-form-row ${newReminder.exactTime ? "row-disabled" : ""}`}
                  >
                    <div className="add-reminder-advance-control">
                      <input
                        type="number"
                        min="0"
                        value={newReminder.advanceNotice}
                        disabled={newReminder.exactTime}
                        onChange={(e) =>
                          setNewReminder({
                            ...newReminder,
                            advanceNotice: e.target.value,
                          })
                        }
                        className="form-input"
                        placeholder="0"
                      />
                      <Select
                        options={advanceUnitOptions}
                        value={newReminder.advanceUnit}
                        disabled={newReminder.exactTime}
                        onChange={(value) =>
                          setNewReminder({
                            ...newReminder,
                            advanceUnit: value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="add-reminder-form-row">
                    <CalendarPicker
                      value={newReminder.date}
                      onChange={(val) =>
                        setNewReminder({ ...newReminder, date: val })
                      }
                      placeholder="Select date"
                      minDate={new Date().toISOString().split("T")[0]}
                      required
                      aria-label="Reminder date"
                      className="reminder-picker-flex"
                    />
                    <TimePicker
                      value={newReminder.time}
                      onChange={(val) =>
                        setNewReminder({ ...newReminder, time: val })
                      }
                      placeholder="Select time"
                      aria-label="Reminder time"
                      className="reminder-picker-flex"
                    />
                  </div>
                </div>
              </div>

              <div className="add-reminder-modal-footer">
                <button
                  type="button"
                  className="add-reminder-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="add-reminder-save-btn"
                  onClick={handleAddReminder}
                >
                  Add Reminder
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Reminder;
