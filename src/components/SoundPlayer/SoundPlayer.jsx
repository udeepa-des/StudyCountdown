import { useState } from "react";
import Rain1 from "../../assets/sounds/calm-thunderstorm-in-the-jungle-2415.wav";
import Rain2 from "../../assets/sounds/rain-ambien-and-thunder-1256.wav";
import River from "../../assets/sounds/river-in-the-forest-with-birds-1216.wav";
import Waves from "../../assets/sounds/small-waves-harbor-rocks-1208.wav";

const SoundPlayer = () => {
  const [audio, setAudio] = useState(null);
  const [currentSound, setCurrentSound] = useState("");

  const sounds = {
    rain1: Rain1,
    rain2: Rain2,
    river: River,
    waves: Waves,
  };

  const playSound = (sound) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(sounds[sound]);
    newAudio.loop = true;
    newAudio.play();
    setAudio(newAudio);
    setCurrentSound(sound);
  };

  const stopSound = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
      setCurrentSound("");
    }
  };

  return (
    <section className="card">
      <h2>Focus Sounds</h2>
      <div className="sound-buttons">
        {Object.keys(sounds).map((sound) => (
          <button
            key={sound}
            onClick={() => playSound(sound)}
            className={`sound-button ${currentSound === sound ? "active" : ""}`}
          >
            {sound.charAt(0).toUpperCase() + sound.slice(1)}
          </button>
        ))}
        <button
          onClick={stopSound}
          className="sound-button stop-button"
          disabled={!currentSound}
        >
          Stop
        </button>
      </div>
    </section>
  );
};

export default SoundPlayer;
