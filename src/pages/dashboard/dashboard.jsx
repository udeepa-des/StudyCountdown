import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import TargetDateForm from "../../components/TargetDateForm/TargetDateForm";
import CountdownTimer from "../../components/CountdownTimer/CountdownTimer";
import StudyPlanForm from "../../components/StudyPlans/StudyPlanForm";
import StudyPlanList from "../../components/StudyPlans/StudyPlanList";
import SoundPlayer from "../../components/SoundPlayer/SoundPlayer";
import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Add a request interceptor to include the auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [targetDate, setTargetDate] = useState("");
  const [countdown, setCountdown] = useState("");
  const [plans, setPlans] = useState([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isTargetSet, setIsTargetSet] = useState(false);
  const [userId, setUserId] = useState("");

  const motivationalQuotes = [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
    "The secret of getting ahead is getting started. - Mark Twain",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
  ];

  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const quoteRef = useRef();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserId(response.data._id);
        if (response.data.targetDate) {
          setTargetDate(
            new Date(response.data.targetDate).toISOString().split("T")[0]
          );
          setIsTargetSet(true);
        }
        if (response.data.studyPlans) {
          setPlans(response.data.studyPlans);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUserData();
  }, [navigate]);

  const changeQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const currentIndex = motivationalQuotes.indexOf(currentQuote);
      const nextIndex = (currentIndex + 1) % motivationalQuotes.length;
      setCurrentQuote(motivationalQuotes[nextIndex]);
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(changeQuote, 10000); // Change every 10 seconds
    return () => clearInterval(interval);
  }, [currentQuote]);

  useEffect(() => {
    if (!targetDate) return;

    // Update countdown every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdown("EXPIRED");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Update this function to save to the backend
  const handleSetTargetDate = async (date, userEmail, userPhone) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/target-date",
        { targetDate: date },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTargetDate(date);
      setEmail(userEmail);
      setPhone(userPhone);
      setIsTargetSet(true);
    } catch (error) {
      console.error("Error setting target date:", error);
    }
  };

  // Update this to save plans to the backend
  const handleAddPlan = async (newPlan) => {
    try {
      const updatedPlans = [...plans, newPlan];
      const token = localStorage.getItem("token");

      await axios.put("/api/plans", updatedPlans, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlans(updatedPlans);
    } catch (error) {
      console.error("Error adding plan:", error);
    }
  };

  // Update this to save plan changes to the backend
  const handleUpdatePlans = async (updatedPlans) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put("/api/plans", updatedPlans, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlans(updatedPlans);
    } catch (error) {
      console.error("Error updating plans:", error);
    }
  };

  return (
    <div className="whole-page">
      <header className="app-header">
        <h1>MindStreamer</h1>
        <div className="header-actions">
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          <button onClick={() => navigate("/")} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
        <div className="app-content">
          <div className="motivational-container">
            <p
              className={`motivational-quote ${
                isAnimating ? "animate-out" : "animate-in"
              }`}
            >
              "{currentQuote}"
            </p>
          </div>

          <div className="cards-container">
            {!isTargetSet && (
              <section className="card target-date-card">
                <TargetDateForm
                  setTargetDate={handleSetTargetDate}
                  email={email}
                  setEmail={setEmail}
                  phone={phone}
                  setPhone={setPhone}
                  setCountdown={setCountdown}
                  setIsTargetSet={setIsTargetSet}
                />
              </section>
            )}

            {countdown && isTargetSet && (
              <section className="card countdown-card-bg">
                <CountdownTimer
                  countdown={countdown}
                  setIsTargetSet={setIsTargetSet}
                />
              </section>
            )}

            <section className="card study-plan-form-card">
              <StudyPlanForm plans={plans} setPlans={handleAddPlan} />
            </section>

            <section className="card study-plan-list-card full-width-card">
              <StudyPlanList
                plans={plans}
                setPlans={handleUpdatePlans}
                email={email}
                phone={phone}
              />
            </section>
          </div>
        </div>
      </div>
      <SoundPlayer />
    </div>
  );
};

export default Dashboard;
