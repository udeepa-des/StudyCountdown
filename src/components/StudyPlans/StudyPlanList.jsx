import StudyPlanItem from "./StudyPlanItem";

const StudyPlanList = ({ plans, setPlans, email, phone }) => {
  const togglePlanCompletion = async (id) => {
    const updatedPlans = plans.map((plan) =>
      plan.id === id ? { ...plan, completed: !plan.completed } : plan
    );
    await setPlans(updatedPlans);
  };

  const deletePlan = async (id) => {
    const updatedPlans = plans.filter((plan) => plan.id !== id);
    await setPlans(updatedPlans);
  };

  return (
    <section className="card">
      <h2>Your Study Plans</h2>
      {plans.length === 0 ? (
        <p className="empty-state">
          No plans yet. Add your first study plan above.
        </p>
      ) : (
        <ul className="plans-list">
          {plans.map((plan) => (
            <StudyPlanItem
              key={plan.id}
              plan={plan}
              onToggleComplete={togglePlanCompletion}
              onDelete={deletePlan}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default StudyPlanList;
