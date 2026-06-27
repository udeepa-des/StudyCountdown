import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "./Calendarpicker.css";

const CalendarPicker = ({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  id,
  required,
  "aria-label": ariaLabel,
  className = "",
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(
    value ? new Date(value) : new Date(),
  );

  // Update viewDate when value changes externally
  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  const floor = minDate ? new Date(minDate) : null;
  if (floor) floor.setHours(0, 0, 0, 0);

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

  const selectDate = (day) => {
    const picked = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    picked.setHours(0, 0, 0, 0);
    if (floor && picked < floor) return;
    onChange(toLocalISO(picked));
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
      cells.push(<div key={`empty-${i}`} className="cp-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const isPast = floor && cellDate <= floor;
      const isSelected = value && toLocalISO(cellDate) === value;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isToday = cellDate.getTime() === today.getTime();

      cells.push(
        <button
          type="button"
          key={day}
          className={`cp-day${isPast ? " disabled" : ""}${
            isSelected ? " selected" : ""
          }${isToday ? " today" : ""}`}
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
    <div className={`cp-container ${className}`}>
      <input
        id={id}
        type="text"
        readOnly
        value={formatDisplayDate(value)}
        placeholder={placeholder}
        onClick={() => setShowCalendar(true)}
        className="form-input"
        required={required}
        aria-label={ariaLabel || placeholder}
      />

      {showCalendar &&
        createPortal(
          <>
            <div
              className="cp-overlay"
              onClick={() => setShowCalendar(false)}
            />
            <div className="cp-modal">
              <div className="cp-header">
                <button
                  type="button"
                  className="cp-nav"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                >
                  &#8249;
                </button>
                <span className="cp-month-label">
                  {viewDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  className="cp-nav"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                >
                  &#8250;
                </button>
              </div>
              <div className="cp-weekdays">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="cp-grid">{renderDays()}</div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default CalendarPicker;
