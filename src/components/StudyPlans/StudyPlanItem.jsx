import { useState } from "react";
import "./StudyPlanItem.css";

const StudyPlanItem = ({
  plan,
  onToggleComplete,
  onDelete,
  onMarkDayStudied,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Total calendar days from startDate to endDate, inclusive
  const getTotalDays = () => {
    if (!plan.startDate || !plan.endDate) return null;
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Progress driven by studiedDays array length vs total days
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

  const isTodayStudied = () => {
    return (plan.studiedDays || []).includes(todayStr());
  };

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

    // If today isn't studied yet, check from yesterday
    const t = todayStr();
    if (!days.includes(t)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (true) {
      const s = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      if (!days.includes(s)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };

  const progress = calculateProgress();
  const totalDays = getTotalDays();
  const studiedCount = (plan.studiedDays || []).length;
  const streak = getStreak();
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
    <div className={`plan-item ${plan.completed ? "completed" : ""}`}>
      {/* Header */}
      <div
        className="plan-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="plan-main-info">
          <div className="plan-title-row">
            <h3 className="plan-title">
              {plan.subject}
              {plan.topic && <span className="plan-topic">· {plan.topic}</span>}
            </h3>
            <span className={`priority-badge priority-${plan.priority}`}>
              {plan.priority}
            </span>
          </div>

          <div className="plan-meta">
            <span className="meta-item">
              <svg
                className="meta-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {plan.hours}h
            </span>

            {plan.daysPerWeek && (
              <span className="meta-item">
                <svg
                  className="meta-icon"
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
                {plan.daysPerWeek}/week
              </span>
            )}

            {totalDays !== null && (
              <span className="meta-item">
                <svg
                  className="meta-icon"
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
                {studiedCount}/{totalDays} days · {progress}%
              </span>
            )}

            {streak > 0 && (
              <span className="meta-item streak-badge">
                🔥 {streak} day streak
              </span>
            )}
          </div>
        </div>

        <div className="plan-actions-header">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(plan._id);
            }}
            className={`action-btn ${plan.completed ? "action-btn-undo" : "action-btn-complete"}`}
            aria-label={
              plan.completed ? "Mark as incomplete" : "Mark as complete"
            }
          >
            <svg
              className="action-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(plan._id);
            }}
            className="action-btn action-btn-delete"
            aria-label="Delete plan"
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

          <div className="expand-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="plan-details-expanded">
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
                <strong>{totalDays ?? "?"}</strong> days studied
              </span>
              {streak > 0 && (
                <span className="streak-info">🔥 {streak}-day streak</span>
              )}
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
                <span className="detail-label">Milestone</span>
                <span className="detail-value">
                  {plan.milestone || "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Progress</span>
                <div className="detail-value">
                  <div className="progress-container">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          {plan.resources && (
            <div className="detail-section">
              <h4 className="detail-section-title">Resources</h4>
              <div className="resource-tags">
                {plan.resources.split(",").map((resource, index) => (
                  <span key={index} className="resource-tag">
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
                    {resource.trim()}
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
      )}
    </div>
  );
};

export default StudyPlanItem;
