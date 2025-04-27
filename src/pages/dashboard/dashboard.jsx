import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import TargetDateForm from "../../components/TargetDateForm/TargetDateForm";
import CountdownTimer from "../../components/CountdownTimer/CountdownTimer";
import StudyPlanForm from "../../components/StudyPlans/StudyPlanForm";
import StudyPlanList from "../../components/StudyPlans/StudyPlanList";
import SoundPlayer from "../../components/SoundPlayer/SoundPlayer";

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [targetDate, setTargetDate] = useState("");
  const [countdown, setCountdown] = useState("");
  const [plans, setPlans] = useState([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isTargetSet, setIsTargetSet] = useState(false);

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

  return (
    <div className="whole-page">
      <header className="app-header">
        <h1>MindStream</h1>
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
                  setTargetDate={setTargetDate}
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
              <StudyPlanForm plans={plans} setPlans={setPlans} />
            </section>

            <section className="card study-plan-list-card full-width-card">
              <StudyPlanList
                plans={plans}
                setPlans={setPlans}
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
