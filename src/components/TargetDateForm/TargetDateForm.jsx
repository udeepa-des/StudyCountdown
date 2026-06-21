import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import "./TargetDateForm.css";

const TargetDateForm = ({
  handleSetTargetDate,
  targetName,
  setTargetName,
  targetDate,
  setTargetDate,
  setCountdown,
  setIsTargetSet,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(
    targetDate ? new Date(targetDate) : new Date(),
  );
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetDate || !targetName) return;
    handleSetTargetDate(targetDate, targetName);
    setCountdown("Calculating..");
    setIsTargetSet(true);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toLocalISO = (d) => {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().split("T")[0];
  };

  const openCalendar = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
    setShowCalendar(true);
  };

  const selectDate = (day) => {
    const picked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    picked.setHours(0, 0, 0, 0);
    if (picked < today) return;
    setTargetDate(toLocalISO(picked));
    setShowCalendar(false);
  };

  const changeMonth = (delta) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1),
    );
  };

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);
      const isPast = cellDate < today;
      const isSelected = targetDate && toLocalISO(cellDate) === targetDate;

      cells.push(
        <button
          type="button"
          key={day}
          className={`calendar-day ${isPast ? "disabled" : ""} ${
            isSelected ? "selected" : ""
          }`}
          disabled={isPast}
          onClick={() => selectDate(day)}
        >
          {day}
        </button>,
      );
    }

    return cells;
  };

  return (
    <section className="target-card">
      <h2>Set Your Target</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          placeholder="Target name (e.g., Final Exams)"
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
          className="form-input"
          required
        />
        <div className="date-picker-container">
          <input
            ref={inputRef}
            id="target-date"
            type="text"
            readOnly
            value={formatDisplayDate(targetDate)}
            placeholder="Select target date"
            onClick={openCalendar}
            className="date-picker"
            required
            aria-label="Select target date"
          />

          {showCalendar &&
            createPortal(
              <>
                <div
                  className="calendar-overlay"
                  onClick={() => setShowCalendar(false)}
                />
                <div
                  className="calendar-modal"
                  style={{
                    top: coords.top,
                    left: coords.left,
                    // minWidth: coords.width,
                  }}
                >
                  <div className="calendar-header">
                    <button
                      type="button"
                      className="calendar-nav"
                      onClick={() => changeMonth(-1)}
                    >
                      &#8249;
                    </button>
                    <span className="calendar-month-label">
                      {viewDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      className="calendar-nav"
                      onClick={() => changeMonth(1)}
                    >
                      &#8250;
                    </button>
                  </div>
                  <div className="calendar-weekdays">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="calendar-grid">{renderDays()}</div>
                </div>
              </>,
              document.body,
            )}
        </div>
        <div className="primary-btn-container">
          <button type="submit" className="primary-button">
            Set Target Date
          </button>
        </div>
      </form>
    </section>
  );
};

export default TargetDateForm;
