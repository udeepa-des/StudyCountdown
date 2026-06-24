import { useState } from "react";
import "./StudyPlanForm.css";
import CalendarPicker from "../CalenderPicker/Calendarpicker";
import PriorityDropdown from "../PriorityDropdown/PriorityDropdown";

const StudyPlanForm = ({ onAddPlan }) => {
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    hours: "",
    daysPerWeek: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    resources: "",
    milestone: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.hours || formData.hours <= 0)
      newErrors.hours = "Valid hours required";
    if (
      formData.daysPerWeek &&
      (formData.daysPerWeek < 1 || formData.daysPerWeek > 7)
    ) {
      newErrors.daysPerWeek = "Must be between 1-7";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const planData = { ...formData };
    for (const key in planData) {
      if (planData[key] === "") planData[key] = null;
    }

    const finalPlan = {
      ...planData,
      hours: parseFloat(planData.hours),
      daysPerWeek: planData.daysPerWeek
        ? parseInt(planData.daysPerWeek, 10)
        : null,
    };

    onAddPlan(finalPlan);

    setFormData({
      subject: "",
      topic: "",
      hours: "",
      daysPerWeek: "",
      startDate: "",
      endDate: "",
      priority: "medium",
      resources: "",
      milestone: "",
      notes: "",
    });
    setErrors({});
  };

  return (
    <section className="study-plan-form card">
      {/* <div className="header-title"> */}
      <h2>Create Detailed Study Plan</h2>
      {/* </div> */}
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label className="study-plan-label" htmlFor="subject">
            Subject <span className="required">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Mathematics"
            className={`form-input ${errors.subject ? "error" : ""}`}
            required
          />
          {errors.subject && (
            <span className="error-message">{errors.subject}</span>
          )}
        </div>

        <div className="form-group">
          <label className="study-plan-label" htmlFor="topic">
            Specific Topic
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="e.g., Calculus"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="study-plan-label" htmlFor="hours">
            Total Hours <span className="required">*</span>
          </label>
          <input
            type="number"
            id="hours"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            min="0.5"
            step="0.5"
            placeholder="e.g., 10"
            className={`form-input ${errors.hours ? "error" : ""}`}
            required
          />
          {errors.hours && (
            <span className="error-message">{errors.hours}</span>
          )}
        </div>

        <div className="form-group">
          <label className="study-plan-label" htmlFor="daysPerWeek">
            Days/Week
          </label>
          <input
            type="number"
            id="daysPerWeek"
            name="daysPerWeek"
            value={formData.daysPerWeek}
            onChange={handleChange}
            min="1"
            max="7"
            placeholder="1-7"
            className={`form-input ${errors.daysPerWeek ? "error" : ""}`}
          />
          {errors.daysPerWeek && (
            <span className="error-message">{errors.daysPerWeek}</span>
          )}
        </div>

        <div className="form-group">
          <label className="study-plan-label" htmlFor="startDate">
            Start Date
          </label>
          <CalendarPicker
            id="startDate"
            value={formData.startDate}
            onChange={handleDateChange("startDate")}
            placeholder="Select start date"
            className={errors.startDate ? "error" : ""}
          />
        </div>

        <div className="form-group">
          <label className="study-plan-label" htmlFor="endDate">
            Target Completion
          </label>
          <CalendarPicker
            id="endDate"
            value={formData.endDate}
            onChange={handleDateChange("endDate")}
            placeholder="Select end date"
            minDate={formData.startDate || undefined}
            className={errors.endDate ? "error" : ""}
          />
          {errors.endDate && (
            <span className="error-message">{errors.endDate}</span>
          )}
        </div>

        <div className="form-group">
          {/* <label className="study-plan-label" htmlFor="priority">
            Priority
          </label> */}
          <PriorityDropdown
            options={priorityOptions}
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value })}
            label="Priority"
            placeholder="Select priority..."
          />
        </div>

        <div className="form-group">
          <label className="study-plan-label" htmlFor="milestone">
            Milestone
          </label>
          <input
            type="text"
            id="milestone"
            name="milestone"
            value={formData.milestone}
            onChange={handleChange}
            placeholder="e.g., Complete chapter 1"
            className="form-input"
          />
        </div>

        <div className="form-group full-width">
          <label className="study-plan-label" htmlFor="resources">
            Resources (comma separated)
          </label>
          <input
            type="text"
            id="resources"
            name="resources"
            value={formData.resources}
            onChange={handleChange}
            placeholder="e.g., Textbook, Online course, YouTube playlist"
            className="form-input"
          />
        </div>

        <div className="form-group full-width">
          <label className="study-plan-label" htmlFor="notes">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special instructions or details..."
            className="form-input"
            rows="3"
          />
        </div>

        <div className="form-submit full-width">
          <button type="submit" className="primary-button">
            Create Study Plan
          </button>
        </div>
      </form>
    </section>
  );
};

export default StudyPlanForm;
