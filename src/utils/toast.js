import toast from "react-hot-toast";

const getDarkMode = () => {
  try {
    return JSON.parse(localStorage.getItem("darkMode")) || false;
  } catch {
    return false;
  }
};

const baseStyle = {
  borderRadius: "10px",
  padding: "16px 24px",
  fontSize: "14px",
  maxWidth: "500px",
};

const lightModeStyle = {
  ...baseStyle,
  background: "#fff",
  color: "#333",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const darkModeStyle = {
  ...baseStyle,
  background: "#333",
  color: "#fff",
};

export const showToast = (message, options = {}) => {
  const darkMode = getDarkMode();

  const defaultOptions = {
    style: darkMode ? darkModeStyle : lightModeStyle,
    ...(options.type === "success" && {
      icon: darkMode ? "👏" : "👋",
    }),
    ...(options.type === "error" && {
      icon: darkMode ? "❌" : "⚠️",
      style: {
        ...(darkMode ? darkModeStyle : lightModeStyle),
        background: darkMode ? "#ff4444" : "#ffebee",
        color: darkMode ? "#fff" : "#d32f2f",
      },
    }),
  };

  return toast(message, { ...defaultOptions, ...options });
};

export const successToast = (message, options) =>
  showToast(message, { ...options, type: "success" });

export const errorToast = (message, options) =>
  showToast(message, { ...options, type: "error" });

export const loadingToast = (message, options) => {
  const darkMode = getDarkMode();
  return toast.loading(message, {
    ...options,
    style: options?.style || (darkMode ? darkModeStyle : lightModeStyle),
  });
};
