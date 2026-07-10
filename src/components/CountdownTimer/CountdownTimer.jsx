import { useEffect, useState, useRef } from "react";
import "./CountdownTimer.css";

const CountdownTimer = ({
  countdown,
  setIsTargetSet,
  onDelete,
  targetName,
  isEditing,
  setIsEditing,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const prevSeconds = useRef(timeLeft.seconds);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    if (prevSeconds.current !== timeLeft.seconds) {
      setTick(true);
      const t = setTimeout(() => setTick(false), 350);
      prevSeconds.current = timeLeft.seconds;
      return () => clearTimeout(t);
    }
  }, [timeLeft.seconds]);

  useEffect(() => {
    const parseCountdown = () => {
      if (!countdown || countdown === "EXPIRED") {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const daysMatch = countdown.match(/(\d+)d/);
      const hoursMatch = countdown.match(/(\d+)h/);
      const minutesMatch = countdown.match(/(\d+)m/);
      const secondsMatch = countdown.match(/(\d+)s/);

      return {
        days: daysMatch ? parseInt(daysMatch[1]) : 0,
        hours: hoursMatch ? parseInt(hoursMatch[1]) : 0,
        minutes: minutesMatch ? parseInt(minutesMatch[1]) : 0,
        seconds: secondsMatch ? parseInt(secondsMatch[1]) : 0,
      };
    };

    setTimeLeft(parseCountdown());
  }, [countdown]);

  const handleEdit = () => {
    setIsEditing(true);
    setIsTargetSet(false);
  };

  return (
    <>
      <section className="countdown-container">
        <div className="countdown-header">
          <h2 className="header-title countdown-title">
            Countdown to&nbsp;
            <span className="target-name">
              {targetName ? targetName : "Target"}
            </span>
          </h2>
        </div>

        <div className="countdown-grid">
          <div className="countdown-card">
            <div className="countdown-value">{timeLeft.days}</div>
            <div className="countdown-label">Days</div>
          </div>
          <div className="countdown-card">
            <div className="countdown-value">{timeLeft.hours}</div>
            <div className="countdown-label">Hours</div>
          </div>
          <div className="countdown-card">
            <div className="countdown-value">{timeLeft.minutes}</div>
            <div className="countdown-label">Minutes</div>
          </div>
          <div className="countdown-card">
            <div className={`countdown-value seconds ${tick ? "tick" : ""}`}>
              {timeLeft.seconds}
            </div>
            <div className="countdown-label">Seconds</div>
          </div>

          <div className="countdown-actions">
            <button
              onClick={handleEdit}
              aria-label="Edit target date"
              className="countdown-action-button edit"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.36 5.64l-1.77 1.77M7.41 16.59l-1.77 1.77M18.36 18.36l-1.77-1.77M7.41 7.41L5.64 5.64" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              aria-label="Delete countdown"
              className="countdown-action-button delete"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v8" />
                <path d="M7 5.5a8 8 0 1 0 10 0" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CountdownTimer;
