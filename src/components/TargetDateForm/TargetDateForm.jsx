import "./TargetDateForm.css";
import CalendarPicker from "../CalenderPicker/Calendarpicker";

const TargetDateForm = ({
  handleSetTargetDate,
  handleUpdateTargetDate,
  targetName,
  setTargetName,
  targetDate,
  setTargetDate,
  setCountdown,
  setIsTargetSet,
  isEditing,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetDate || !targetName) return;
    if (isEditing) {
      handleUpdateTargetDate(targetDate, targetName);
    } else {
      handleSetTargetDate(targetDate, targetName);
    }

    setCountdown("Calculating..");
    setIsTargetSet(true);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toLocalISO = (d) => {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().split("T")[0];
  };

  return (
    <section className="target-card">
      <h2>Set Your Countdown</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          placeholder="Target name (e.g., Final Exams)"
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
          className="form-input"
          required
        />
        <div className="date-picker-container">
          <CalendarPicker
            id="target-date"
            value={targetDate}
            onChange={setTargetDate}
            placeholder="Select target date"
            minDate={toLocalISO(today)}
            aria-label="Select target date"
            required
          />
        </div>
        <div className="primary-btn-container">
          <button type="submit" className="primary-button">
            {isEditing ? "Edit Target Date" : "Set Target Date"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default TargetDateForm;
