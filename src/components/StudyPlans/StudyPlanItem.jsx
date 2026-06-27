import "./StudyPlanItem.css";

const StudyPlanItem = ({ plan, onToggleComplete, onDelete, onShowMore }) => {
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

  const totalDays = getTotalDays();
  const studiedCount = (plan.studiedDays || []).length;
  const progress = totalDays
    ? Math.min(100, Math.round((studiedCount / totalDays) * 100))
    : 0;
  const totalHours =
    plan.hours && totalDays ? +(plan.hours * totalDays).toFixed(1) : null;

  const getStreak = () => {
    const days = [...(plan.studiedDays || [])].sort();
    if (!days.length) return 0;
    const todayStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
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

  const streak = getStreak();

  return (
    <div className={`plan-item ${plan.completed ? "completed" : ""}`}>
      {/* Top row: title + priority + actions */}
      <div className="plan-card-top">
        <div className="plan-title-row">
          <h3 className="plan-title">
            {plan.subject}
            {plan.topic && <span className="plan-topic">· {plan.topic}</span>}
          </h3>
          <span className={`priority-badge priority-${plan.priority}`}>
            {plan.priority}
          </span>
        </div>
        <div className="plan-actions-header">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(plan._id);
            }}
            className={`action-btn ${plan.completed ? "action-btn-undo" : "action-btn-complete"}`}
            title={plan.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {!plan.completed ? (
              <svg
                className="action-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                className="action-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 14L4 9m0 0l5-5M4 9h9a7 7 0 110 14h-1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(plan._id);
            }}
            className="action-btn action-btn-delete"
            title="Delete plan"
          >
            <svg
              className="action-icon"
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

      {/* Stats chips */}
      <div className="plan-stats-row">
        {plan.hours && (
          <div className="stat-chip">
            <svg
              className="stat-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="stat-value">{plan.hours}h/day</span>
            {totalHours && (
              <span className="stat-sub">{totalHours}h total</span>
            )}
          </div>
        )}

        {plan.daysPerWeek && (
          <div className="stat-chip">
            <svg
              className="stat-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
                strokeWidth="2"
              />
              <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
            </svg>
            <span className="stat-value">{plan.daysPerWeek} days/wk</span>
          </div>
        )}

        {totalDays !== null && (
          <div className="stat-chip">
            <svg
              className="stat-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M22 12h-4l-3 9L9 3l-3 9H2"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="stat-value">
              {studiedCount}/{totalDays} days
            </span>
            <span className="stat-sub">{progress}%</span>
          </div>
        )}

        {streak > 0 && (
          <div className="stat-chip stat-chip-streak">
            <span>🔥</span>
            <span className="stat-value">{streak} streak</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalDays !== null && (
        <div className="plan-progress-bar-wrap">
          <div className="plan-progress-bar-bg">
            <div
              className="plan-progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: dates + show more */}
      <div className="plan-card-footer">
        <div className="plan-dates">
          {plan.startDate && (
            <span className="date-chip">
              <svg
                className="date-icon"
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
              {formatDate(plan.startDate)}
            </span>
          )}
          {plan.endDate && (
            <>
              <span className="date-arrow">→</span>
              <span className="date-chip date-chip-end">
                {formatDate(plan.endDate)}
              </span>
            </>
          )}
        </div>
        <button className="show-more-btn" onClick={() => onShowMore(plan)}>
          Show more
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="13"
            height="13"
          >
            <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StudyPlanItem;
