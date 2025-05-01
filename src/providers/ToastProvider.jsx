import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  // Get darkMode from localStorage and parse it properly
  const darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "10px",
          padding: "16px 24px",
          fontSize: "14px",
          maxWidth: "500px",
          background: darkMode ? "#333" : "#fff",
          color: darkMode ? "#fff" : "#333",
        },
        success: {
          iconTheme: {
            primary: darkMode ? "#4BB543" : "#2e7d32",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: darkMode ? "#ff4444" : "#d32f2f",
            secondary: "#fff",
          },
        },
      }}
    />
  );
};

export default ToastProvider;
    