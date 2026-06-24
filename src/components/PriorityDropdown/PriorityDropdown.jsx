import { useState, useRef, useEffect } from "react";
import "./PriorityDropdown.css";

const DropdownArrow = ({ isOpen, color = "#666" }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`dropdown-arrow ${isOpen ? "rotate" : ""}`}
    style={{
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.3s ease",
    }}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PriorityDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ffa500";
      case "low":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "";
    }
  };

  return (
    <div className={`priority-dropdown ${className}`} ref={dropdownRef}>
      {label && <label className="study-plan-label">{label}</label>}
      <div
        className={`dropdown-header ${isOpen ? "open" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="dropdown-selected-value">
          {selectedOption ? (
            <>
              <span className="priority-indicator">
                {getPriorityIcon(selectedOption.value)}
              </span>
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <DropdownArrow isOpen={isOpen} color="#666" />
      </div>

      {isOpen && !disabled && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option ${
                option.value === value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              <span className="priority-indicator">
                {getPriorityIcon(option.value)}
              </span>
              <span className="option-label">{option.label}</span>
              {option.value === value && <span className="checkmark">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityDropdown;
