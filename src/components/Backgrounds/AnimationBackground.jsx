import { useState } from "react";
import ChromaWaveBackground from "./ChromaWaveBackground";
import RymdBackground from "./RymdBackground";
import FirefliesBackground from "./FirefliesBackground";
import AuroraBackground from "./AuroraBackground";
import "./AnimationBackground.css";

export const ANIMATIONS = [
  {
    id: "chromawave",
    label: "Chroma Wave",
    icon: (
      <svg viewBox="0 0 24 24" className="anim-toggle-icon">
        <path
          d="M2 12C4 6 8 6 10 12S16 18 18 12 22 6 22 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "rymd",
    label: "Star Field",
    icon: (
      <svg viewBox="0 0 24 24" className="anim-toggle-icon">
        <path
          d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "fireflies",
    label: "Fireflies",
    icon: (
      <svg viewBox="0 0 24 24" className="anim-toggle-icon">
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path
          d="M12 2V5M12 19V22M2 12H5M19 12H22M5 5L7 7M17 17L19 19M19 5L17 7M5 19L7 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "aurora",
    label: "Aurora",
    icon: (
      <svg viewBox="0 0 24 24" className="anim-toggle-icon">
        <path
          d="M12 2L20 12L12 22L4 12L12 2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 12C9.5 9 14.5 9 16 12C14.5 15 9.5 15 8 12Z"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    ),
  },
];

// Key used to persist the user's choice across sessions
const STORAGE_KEY = "sp_bg_animation";

const getStoredAnimation = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "chromawave";
  } catch {
    return "chromawave";
  }
};

const AnimationBackground = ({ showToggle = true }) => {
  const [active, setActive] = useState(getStoredAnimation);

  const handleSelect = (id) => {
    setActive(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  return (
    <>
      {/* Background layer */}
      {active === "chromawave" && <ChromaWaveBackground />}
      {active === "rymd" && <RymdBackground />}
      {active === "fireflies" && <FirefliesBackground />}
      {active === "aurora" && <AuroraBackground />}

      {/* Toggle pills */}
      {showToggle && (
        <div className="anim-toggle-bar">
          {ANIMATIONS.map((a) => (
            <button
              key={a.id}
              className={`anim-toggle-btn${active === a.id ? " active" : ""}`}
              onClick={() => handleSelect(a.id)}
              title={a.label}
              type="button"
            >
              <span className="anim-toggle-emoji">{a.icon}</span>
              <span className="anim-toggle-label">{a.label}</span>
            </button>
          ))}
          <div class="slider-pill"></div>
        </div>
      )}
    </>
  );
};

export default AnimationBackground;
