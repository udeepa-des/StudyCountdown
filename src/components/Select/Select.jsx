// Select.jsx
import { useState, useRef, useEffect } from "react";
import "./Select.css";

const DropdownArrow = ({ isOpen, color = "#666" }) => (
  <svg
    width="20"
    height="20"
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

const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  className = "",
  disabled = false,
  required = false,
  error = "",
  helperText = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select ${className}`} ref={dropdownRef}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div
        className={`select-header ${isOpen ? "open" : ""} ${
          disabled ? "disabled" : ""
        } ${error ? "error" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="select-selected-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <DropdownArrow isOpen={isOpen} color="#666" />
      </div>

      {(error || helperText) && (
        <div
          className={`select-helper ${error ? "error-text" : "helper-text"}`}
        >
          {error || helperText}
        </div>
      )}

      {isOpen && !disabled && (
        <div className="select-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`select-option ${
                option.value === value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              <span className="option-label">{option.label}</span>
              {option.value === value && <span className="checkmark">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
