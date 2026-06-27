import "./StudyPlanDetailModal.css";

const StudyPlanDetailModal = ({ plan, onClose, onMarkDayStudied }) => {
  if (!plan) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalDays = () => {
    if (!plan.startDate || !plan.endDate) return null;
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const calendarDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (plan.daysPerWeek && plan.daysPerWeek < 7) {
      const totalWeeks = calendarDays / 7;
      return Math.max(1, Math.round(totalWeeks * plan.daysPerWeek));
    }
    return calendarDays;
  };

  const calculateProgress = () => {
    const total = getTotalDays();
    if (!total) return 0;
    const studied = (plan.studiedDays || []).length;
    return Math.min(100, Math.round((studied / total) * 100));
  };

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const isTodayStudied = () => (plan.studiedDays || []).includes(todayStr());

  const isTodayInRange = () => {
    if (!plan.startDate || !plan.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(plan.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(plan.endDate);
    end.setHours(0, 0, 0, 0);
    return today >= start && today <= end;
  };

  const getStreak = () => {
    const days = [...(plan.studiedDays || [])].sort();
    if (!days.length) return 0;
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!days.includes(todayStr())) cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const s = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      if (!days.includes(s)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };

  const totalDays = getTotalDays();
  const progress = calculateProgress();
  const studiedCount = (plan.studiedDays || []).length;
  const streak = getStreak();
  const totalHours =
    plan.hours && totalDays ? +(plan.hours * totalDays).toFixed(1) : null;
  const alreadyMarked = isTodayStudied();
  const inRange = isTodayInRange();

  const getMarkButtonState = () => {
    if (plan.completed)
      return {
        disabled: true,
        label: "Plan completed",
        className: "mark-btn mark-btn-disabled",
      };
    if (alreadyMarked)
      return {
        disabled: true,
        label: "✓ Studied today",
        className: "mark-btn mark-btn-done",
      };
    if (!inRange)
      return {
        disabled: true,
        label: "Outside study range",
        className: "mark-btn mark-btn-disabled",
      };
    return {
      disabled: false,
      label: "Mark Today as Studied",
      className: "mark-btn mark-btn-active",
    };
  };

  const btnState = getMarkButtonState();

  return (
    <div className="spi-modal-backdrop" onClick={onClose}>
      <div className="spi-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="spi-modal-header">
          <div className="spi-modal-title-block">
            <h2 className="spi-modal-title">
              {plan.subject}
              {plan.topic && (
                <span className="spi-modal-topic"> · {plan.topic}</span>
              )}
            </h2>
            <span className={`priority-badge priority-${plan.priority}`}>
              {plan.priority}
            </span>
          </div>
          <button className="spi-modal-close" onClick={onClose}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="spi-modal-body">
          {/* Mark Today as Studied */}
          <div className="mark-day-section">
            <button
              className={btnState.className}
              disabled={btnState.disabled}
              onClick={() => onMarkDayStudied(plan._id)}
            >
              {!alreadyMarked && !btnState.disabled && (
                <svg
                  className="mark-btn-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {btnState.label}
            </button>
            <div className="studied-summary">
              <span className="studied-count">
                <strong>{studiedCount}</strong> of{" "}
                <strong>{totalDays ?? "?"}</strong> study days
                {plan.daysPerWeek && (
                  <span className="studied-count-sub">
                    {" "}
                    ({plan.daysPerWeek}×/week)
                  </span>
                )}
              </span>
              {streak > 0 && (
                <span className="streak-info">🔥 {streak}-day streak</span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="spi-modal-progress">
            <div className="spi-modal-progress-header">
              <span className="detail-section-title">Progress</span>
              <span className="progress-text">{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Study Details */}
          <div className="detail-section">
            <h4 className="detail-section-title">Study Details</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">
                  {formatDate(plan.startDate)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Target Date</span>
                <span className="detail-value">{formatDate(plan.endDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hours / Day</span>
                <span className="detail-value">
                  {plan.hours}h
                  {totalHours && (
                    <span className="studied-count-sub">
                      {" "}
                      ({totalHours}h total)
                    </span>
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Days / Week</span>
                <span className="detail-value">
                  {plan.daysPerWeek ?? "Not set"}
                </span>
              </div>
              {plan.milestone && (
                <div className="detail-item">
                  <span className="detail-label">Milestone</span>
                  <span className="detail-value">{plan.milestone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resources */}
          {plan.resources && (
            <div className="detail-section">
              <h4 className="detail-section-title">Resources</h4>
              <div className="resource-tags">
                {plan.resources.split(",").map((r, i) => (
                  <span key={i} className="resource-tag">
                    <svg
                      className="resource-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        strokeWidth="2"
                      />
                      <path
                        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                        strokeWidth="2"
                      />
                    </svg>
                    {r.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {plan.notes && (
            <div className="detail-section">
              <h4 className="detail-section-title">Notes</h4>
              <div className="plan-notes">{plan.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanDetailModal;
