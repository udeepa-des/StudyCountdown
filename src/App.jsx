import { useState } from "react";
import Dashboard from "./pages/dashboard/dashboard";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or prefer-color-scheme
    const savedMode = localStorage.getItem("darkMode");
    return savedMode
      ? JSON.parse(savedMode)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  return (
    <>
      <Dashboard></Dashboard>
    </>
  );
}

export default App;
