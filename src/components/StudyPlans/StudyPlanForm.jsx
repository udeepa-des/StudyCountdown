const StudyPlanForm = ({ plans, setPlans }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const plan = {
      id: Date.now(),
      subject: e.target.subject.value,
      hours: e.target.hours.value,
      milestone: e.target.milestone.value,
      completed: false,
    };
    setPlans([...plans, plan]);
    e.target.reset();
  };

  return (
    <section className="card">
      <h2>Create Study Plan</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          className="form-input"
          required
        />
        <input
          type="number"
          name="hours"
          placeholder="Study Hours"
          className="form-input"
          required
        />
        <input
          type="text"
          name="milestone"
          placeholder="Milestone"
          className="form-input"
          required
        />
        <div className="primary-btn-container">
          <button type="submit" className="primary-button">
            Add Plan
          </button>
        </div>
      </form>
    </section>
  );
};

export default StudyPlanForm;
