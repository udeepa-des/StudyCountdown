import { useState } from "react";
import "./StudyPlanItem.css";

const StudyPlanItem = ({ plan, onToggleComplete, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = () => {
    if (!plan.startDate || !plan.endDate) return null;
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const today = new Date();
    if (today > end) return 100;
    if (today < start) return 0;
    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const daysPassed = (today - start) / (1000 * 60 * 60 * 24);
    return Math.min(100, Math.round((daysPassed / totalDays) * 100));
  };

  const progress = calculateProgress();

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

            {progress !== null && (
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
                {progress}%
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
            className={`action-btn ${
              plan.completed ? "action-btn-undo" : "action-btn-complete"
            }`}
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
                        style={{ width: `${plan.progress || 0}%` }}
                      />
                    </div>
                    <span className="progress-text">{plan.progress || 0}%</span>
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
