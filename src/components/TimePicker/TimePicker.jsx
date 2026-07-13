import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./TimePicker.css";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,...55

const to24Hour = (hour12, minute, period) => {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const parseValue = (value) => {
  if (!value) return { hour12: 9, minute: 0, period: "AM" };
  const [hStr, mStr] = value.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m, period };
};

const formatDisplayTime = (value) => {
  if (!value) return "";
  const { hour12, minute, period } = parseValue(value);
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
};

const TimePicker = ({
  value,
  onChange,
  placeholder = "Select time",
  id,
  required,
  "aria-label": ariaLabel,
  className = "",
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [draft, setDraft] = useState(parseValue(value));

  useEffect(() => {
    setDraft(parseValue(value));
  }, [value]);

  const openPicker = () => {
    if (disabled) return;
    setDraft(parseValue(value));
    setShowPicker(true);
  };

  const commit = (next) => {
    setDraft(next);
    onChange(to24Hour(next.hour12, next.minute, next.period));
  };

  const selectHour = (h) => commit({ ...draft, hour12: h });
  const selectMinute = (m) => commit({ ...draft, minute: m });
  const togglePeriod = (p) => commit({ ...draft, period: p });

  const setNow = () => {
    const now = new Date();
    const h = now.getHours();
    const period = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    const minute = (Math.round(now.getMinutes() / 5) * 5) % 60;
    commit({ hour12, minute, period });
    setShowPicker(false);
  };

  return (
    <div className={`tp-container ${className}`}>
      <input
        id={id}
        type="text"
        readOnly
        value={formatDisplayTime(value)}
        placeholder={placeholder}
        onClick={openPicker}
        className="form-input"
        required={required}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
      />

      {showPicker &&
        createPortal(
          <>
            <div className="tp-overlay" onClick={() => setShowPicker(false)} />
            <div className="tp-modal">
              <div className="tp-header">
                <span className="tp-title">Select time</span>
                <button
                  type="button"
                  className="tp-close"
                  onClick={() => setShowPicker(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="tp-body">
                <div className="tp-column">
                  <span className="tp-column-label">Hour</span>
                  <div className="tp-scroll">
                    {HOURS.map((h) => (
                      <button
                        type="button"
                        key={h}
                        className={`tp-cell ${draft.hour12 === h ? "selected" : ""}`}
                        onClick={() => selectHour(h)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tp-column">
                  <span className="tp-column-label">Minute</span>
                  <div className="tp-scroll">
                    {MINUTES.map((m) => (
                      <button
                        type="button"
                        key={m}
                        className={`tp-cell ${draft.minute === m ? "selected" : ""}`}
                        onClick={() => selectMinute(m)}
                      >
                        {String(m).padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tp-column tp-column-period">
                  <span className="tp-column-label">&nbsp;</span>
                  <div className="tp-period-toggle">
                    <button
                      type="button"
                      className={`tp-period-btn ${draft.period === "AM" ? "selected" : ""}`}
                      onClick={() => togglePeriod("AM")}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className={`tp-period-btn ${draft.period === "PM" ? "selected" : ""}`}
                      onClick={() => togglePeriod("PM")}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div className="tp-footer">
                <button type="button" className="tp-now-btn" onClick={setNow}>
                  Now
                </button>
                <button
                  type="button"
                  className="tp-done-btn"
                  onClick={() => setShowPicker(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default TimePicker;
