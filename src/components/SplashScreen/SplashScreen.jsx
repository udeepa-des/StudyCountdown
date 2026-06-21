import "./SplashScreen.css";
import logo from "../../assets/splash/splash.png";

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <img src={logo} alt="MindStreamer" className="splash-logo" />
    </div>
  );
};

export default SplashScreen;
