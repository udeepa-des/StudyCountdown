import StudyPlanItem from "./StudyPlanItem";

const StudyPlanList = ({
  plans,
  onToggleComplete,
  onDelete,
  onShowMore,
}) => {
  return (
    <section className="card">
      <h2>Your Study Plans</h2>
      {plans.length === 0 ? (
        <p className="empty-state">
          No plans yet. Add your first study plan to show here.
        </p>
      ) : (
        <ul className="plans-list">
          {plans.map((plan) => (
            <StudyPlanItem
              key={plan._id}
              plan={plan}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onShowMore={onShowMore}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default StudyPlanList;
