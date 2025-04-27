import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <label className="theme-toggle-container" aria-label="Toggle dark mode">
      <input
        type="checkbox"
        checked={darkMode}
        onChange={() => setDarkMode(!darkMode)}
        className="theme-toggle-input"
      />
      <span className="theme-toggle-slider">
        <span className={`theme-toggle-icon ${darkMode ? "moon" : "sun"}`}>
          {darkMode ? "🌙" : "☀️"}
        </span>
      </span>
    </label>
  );
};

export default ThemeToggle;
