const StudyPlanItem = ({ plan, onToggleComplete, onDelete }) => {
    return (
      <li className={`plan-item ${plan.completed ? 'completed' : ''}`}>
        <div className="plan-details">
          <h3>{plan.subject}</h3>
          <div className="plan-meta">
            <span>📚 {plan.hours} hours</span>
            <span>🎯 {plan.milestone}</span>
          </div>
        </div>
        <div className="plan-actions">
          <button
            onClick={() => onToggleComplete(plan.id)}
            className={`action-button ${plan.completed ? 'secondary-button' : 'complete-button'}`}
          >
            {plan.completed ? '↩ Undo' : '✓ Complete'}
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            className="action-button delete-button"
          >
            🗑 Delete
          </button>
        </div>
      </li>
    );
  };
  
  export default StudyPlanItem;