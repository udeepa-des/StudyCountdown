// ReminderModal.jsx
import { useState, useEffect } from "react";
import "./ReminderModal.css";

const ReminderModal = ({
  isOpen,
  onClose,
  reminderData,
  notificationEmail,
  darkMode,
  onSnooze,
}) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [timeToEvent, setTimeToEvent] = useState(null);

  useEffect(() => {
    if (!isOpen || !reminderData) return;

    // Use the reminder's own scheduled datetime, not the exam target date
    const getReminderDateTime = () => {
      if (reminderData.date && reminderData.time) {
        return new Date(`${reminderData.date}T${reminderData.time}`).getTime();
      }
      // fallback to targetDate only if date+time not available
      if (reminderData.targetDate) {
        return new Date(reminderData.targetDate).getTime();
      }
      return null;
    };

    const reminderDateTime = getReminderDateTime();
    if (!reminderDateTime) return;

    const updateRemaining = () => {
      const now = new Date().getTime();
      const distance = reminderDateTime - now;

      setTimeToEvent(distance);

      if (distance <= 0) {
        setTimeRemaining("Time's up!");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      }
    };

    updateRemaining();
    // Update every second for accuracy when close to firing
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [isOpen, reminderData]);

  useEffect(() => {
    if (isOpen) setIsSnoozed(false);
  }, [isOpen, reminderData?.id]);

  if (!isOpen) return null;

  const getSnoozeStatus = () => {
    if (isSnoozed) return { disabled: true, message: "Snoozed..." };
    if (timeToEvent === null)
      return { disabled: true, message: "Calculating..." };
    if (timeToEvent <= 0)
      return { disabled: true, message: "Event has passed" };
    if (timeToEvent < 5 * 60 * 1000) {
      const minutes = Math.floor(timeToEvent / (1000 * 60));
      const seconds = Math.floor((timeToEvent % (1000 * 60)) / 1000);
      return { disabled: true, message: `Only ${minutes}m ${seconds}s left` };
    }
    return { disabled: false, message: "Snooze (5 min)" };
  };

  const snoozeStatus = getSnoozeStatus();
  const tooCloseToSnooze =
    timeToEvent !== null && timeToEvent > 0 && timeToEvent < 5 * 60 * 1000;

  const handleSnooze = () => {
    if (snoozeStatus.disabled) return;
    setIsSnoozed(true);
    if (onSnooze && reminderData?.id) {
      onSnooze(reminderData.id);
    } else if (onSnooze) {
      onSnooze();
    }
    setTimeout(() => {
      setIsSnoozed(false);
      onClose();
    }, 5000);
  };

  return (
    <div className="reminder-modal-overlay" onClick={onClose}>
      <div
        className={`reminder-modal-content ${darkMode ? "dark-mode" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reminder-modal-header">
          <h2>Reminder Alert!</h2>
          <button className="reminder-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="reminder-modal-body">
          <div className="reminder-message-box">
            <div className="reminder-details">
              <div className="reminder-detail-item">
                <span className="detail-label">Label:</span>
                <span className="detail-value highlight">
                  {reminderData?.label || "Countdown Event"}
                </span>
              </div>
              <div className="reminder-detail-item">
                <span className="detail-label">Reminder Date & Time:</span>
                <span className="detail-value">
                  {reminderData?.date && reminderData?.time
                    ? new Date(
                        `${reminderData.date}T${reminderData.time}`,
                      ).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="reminder-detail-item">
                <span className="detail-label">Reminder set for:</span>
                <span className="detail-value">
                  {reminderData?.reminderTime || "At event time"}
                </span>
              </div>
              <div className="reminder-detail-item">
                <span className="detail-label">Time until reminder:</span>
                <span className="detail-value" style={{ fontWeight: "bold" }}>
                  {timeToEvent !== null && timeToEvent > 0
                    ? timeRemaining
                    : "Time's up!"}
                </span>
              </div>
            </div>
          </div>

          <div className="reminder-notifications-status">
            <div className="notification-status-item">
              <span className="status-icon">📧</span>
              <span className="status-text">
                {notificationEmail
                  ? "Email notification sent"
                  : "Email not configured"}
              </span>
            </div>
          </div>

          <div className="reminder-modal-actions">
            {!isSnoozed && (
              <button
                className={`reminder-snooze-btn ${snoozeStatus.disabled ? "disabled" : ""}`}
                onClick={handleSnooze}
                disabled={snoozeStatus.disabled}
                title={
                  snoozeStatus.disabled
                    ? snoozeStatus.message
                    : "Snooze for 5 minutes"
                }
              >
                {snoozeStatus.message}
              </button>
            )}
            <button className="reminder-dismiss-btn" onClick={onClose}>
              {isSnoozed ? "Snoozed..." : "Dismiss"}
            </button>
          </div>

          {isSnoozed && (
            <div className="reminder-snooze-status">
              <span>⏰ Snoozed for 5 minutes</span>
            </div>
          )}

          {tooCloseToSnooze && (
            <div className="reminder-warning">
              <span>⚠️</span>
              <span>Event is too close to snooze (less than 5 minutes)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
