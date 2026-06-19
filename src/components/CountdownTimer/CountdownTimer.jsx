import { useEffect, useState } from "react";
import "./CountdownTimer.css";

const CountdownTimer = ({ countdown, setIsTargetSet, onDelete, targetName }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
    setIsTargetSet(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this countdown?")) {
      onDelete();
    }
  };

  return (
    <section className="countdown-container">
      <div className="countdown-header">
        <h2 className="target-name">
          {targetName ? `Countdown to ${targetName}` : "Countdown to Target"}
        </h2>
        <div className="countdown-actions">
          <button
            onClick={handleEdit}
            aria-label="Edit target date"
            className="countdown-action-button edit"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete countdown"
            className="countdown-action-button delete"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
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
          <div className="countdown-value seconds">{timeLeft.seconds}</div>
          <div className="countdown-label">Seconds</div>
        </div>
      </div>
    </section>
  );
};

export default CountdownTimer;
