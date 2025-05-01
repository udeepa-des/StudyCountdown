import { useState } from "react";
import "./TargetDateForm.css";

const TargetDateForm = ({
  setTargetDate,
  email,
  setEmail,
  phone,
  setPhone,
  setCountdown,
  setIsTargetSet,
}) => {
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    setTargetDate(selectedDate, email, phone);
    setCountdown("Calculating..");
    setIsTargetSet(true);
  };

  return (
    <section className="card">
      <h2>Set Your Target</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="date-picker-container">
          <input
            id="target-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
            required
            min={new Date().toISOString().split("T")[0]}
            aria-label="Select target date"
          />
        </div>

        <input
          type="email"
          placeholder="Email for notifications"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />

        <input
          type="tel"
          placeholder="Phone for SMS"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="form-input"
        />
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
