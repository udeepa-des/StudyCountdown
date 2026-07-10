import { useState, useEffect, useRef } from "react";
import "./SplashScreen.css";
import logo from "../../assets/logo/logo.png";
import logoTitle from "../../assets/logo/logo_title.png";

const LOADING_PHRASES = [
  "Studying...",
  "Memorizing...",
  "Revising...",
  "Cramming...",
  "Focusing...",
  "Prepping...",
  "Reviewing...",
  "Practicing...",
  "Note-taking...",
  "Highlighting...",
  "Flashcards...",
  "Brainstorming...",
  "Concentrating...",
  "Brewing..."
];

const ANIMATION_DURATION = 1500; // must match the CSS animation duration (1.5s)

const getRandomPhrase = (exclude) => {
  let next;
  do {
    next = LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)];
  } while (next === exclude && LOADING_PHRASES.length > 1);
  return next;
};

const getFontSize = (length) => {
  if (length > 25) return "20px";
  if (length > 18) return "24px";
  return "30px";
};

const SplashScreen = () => {
  const [phrase, setPhrase] = useState(() => getRandomPhrase(null));
  const phraseRef = useRef(phrase);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRandomPhrase(phraseRef.current);
      phraseRef.current = next;
      setPhrase(next);
    }, ANIMATION_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="splash-screen">
      <img src={logo} alt="MindStreamer" className="splash-logo" />
      <img src={logoTitle} alt="MindStreamer" className="splash-logo" />
      <div
        key={phrase}
        className="loader"
        data-text={phrase}
        style={{ "--shadow-offset": `${phrase.length}ch` }}
      ></div>
    </div>
  );
};

export default SplashScreen;
