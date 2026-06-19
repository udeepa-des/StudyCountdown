import { useState } from "react";
import "./TargetDateForm.css";

const TargetDateForm = ({
  handleSetTargetDate,
  targetName,
  setTargetName,
  targetDate,
  setTargetDate,
  setCountdown,
  setIsTargetSet,
}) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetDate || !targetName) return;

    handleSetTargetDate(targetDate, targetName);
    setCountdown("Calculating..");
    setIsTargetSet(true);
  };

  return (
    <section className="card">
      <h2>Set Your Target</h2>
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
          <input
            id="target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="date-picker"
            required
            min={new Date().toISOString().split("T")[0]}
            aria-label="Select target date"
          />
        </div>

        <div className="primary-btn-container">
          <button type="submit" className="primary-button">
            Set Target Date
          </button>
        </div>
      </form>
    </section>
  );
};

export default TargetDateForm;
