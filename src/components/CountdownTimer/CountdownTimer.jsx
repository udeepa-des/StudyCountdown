import { useEffect } from "react";
import "./CountdownTimer.css";

const CountdownTimer = ({ countdown, setIsTargetSet }) => {
  const parseCountdown = (countdownStr) => {
    if (!countdownStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const daysMatch = countdownStr.match(/(\d+)d/);
    const hoursMatch = countdownStr.match(/(\d+)h/);
    const minutesMatch = countdownStr.match(/(\d+)m/);
    const secondsMatch = countdownStr.match(/(\d+)s/);

    return {
      days: daysMatch ? parseInt(daysMatch[1]) : 0,
      hours: hoursMatch ? parseInt(hoursMatch[1]) : 0,
      minutes: minutesMatch ? parseInt(minutesMatch[1]) : 0,
      seconds: secondsMatch ? parseInt(secondsMatch[1]) : 0,
    };
  };

  const { days, hours, minutes, seconds } = parseCountdown(countdown);

  return (
    <section className="countdown-container">
      <div className="countdown-header">
        <h2>Time Remaining</h2>
        <div className="edit-button-ct-container">
          <button
            onClick={() => setIsTargetSet(false)}
            aria-label="Edit target date"
            className="edit-button-ct"
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
        </div>
      </div>
      <div className="countdown-grid">
        <div className="countdown-card">
          <div className="countdown-value">{days}</div>
          <div className="countdown-label">Days</div>
        </div>
        <div className="countdown-card">
          <div className="countdown-value">{hours}</div>
          <div className="countdown-label">Hours</div>
        </div>
        <div className="countdown-card">
          <div className="countdown-value">{minutes}</div>
          <div className="countdown-label">Minutes</div>
        </div>
        <div className="countdown-card">
          <div className="countdown-value seconds">{seconds}</div>
          <div className="countdown-label">Seconds</div>
        </div>
      </div>
    </section>
  );
};

export default CountdownTimer;
