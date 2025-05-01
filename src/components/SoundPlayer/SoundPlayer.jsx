import { useState, useEffect } from "react";
import {
  FaVolumeMute,
  FaVolumeOff,
  FaVolumeDown,
  FaVolumeUp,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import Rain1 from "../../assets/sounds/calm-thunderstorm-in-the-jungle-2415.wav";
import Rain2 from "../../assets/sounds/rain-ambien-and-thunder-1256.wav";
import River from "../../assets/sounds/river-in-the-forest-with-birds-1216.wav";
import Waves from "../../assets/sounds/small-waves-harbor-rocks-1208.wav";
import "./SoundPlayer.css";

const SoundPlayer = () => {
  const [audio, setAudio] = useState(null);
  const [currentSound, setCurrentSound] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const sounds = {
    rain1: { name: "Thunderstorm", file: Rain1 },
    rain2: { name: "Calm Rain", file: Rain2 },
    river: { name: "Forest River", file: River },
    waves: { name: "Ocean Waves", file: Waves },
  };

  // Check for mobile view on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update volume when audio changes
  useEffect(() => {
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [audio, volume, isMuted]);

  const playSound = (sound) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(sounds[sound].file);
    newAudio.loop = true;
    newAudio.volume = isMuted ? 0 : volume;
    newAudio.play();
    setAudio(newAudio);
    setCurrentSound(sound);
    setIsPlaying(true);
  };

  const stopSound = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
      setCurrentSound("");
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audio) {
      setIsMuted(!isMuted);
      audio.volume = isMuted ? volume : 0;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getSpeakerIcon = () => {
    if (isMuted || volume === 0) return <FaVolumeMute />;
    if (volume < 0.3) return <FaVolumeOff />;
    if (volume < 0.7) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  return (
    <div
      className={`music-player ${isMobile ? "mobile" : ""} ${
        isExpanded ? "expanded" : ""
      }`}
    >
      {isMobile && (
        <div className="expand-toggle" onClick={toggleExpand}>
          {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
        </div>
      )}

      {isMobile && !isExpanded && (
        <div className="collapsed">
          <div className="collapsed-controls">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className={`control-button ${!currentSound ? "disabled" : ""}`}
              disabled={!currentSound}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopSound();
              }}
              className="control-button stop-button"
            >
              ⏹
            </button>
          </div>
          <div className="collapsed-sound">
            {currentSound ? sounds[currentSound].name : "Sound Player"}
          </div>
          <div className="collapsed-volume">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="volume-icon"
            >
              {getSpeakerIcon()}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              onClick={(e) => e.stopPropagation()}
              className="collapsed-volume-slider"
            />
          </div>
        </div>
      )}

      <div className="player-content">
        {(!isMobile || isExpanded) && (
          <>
            <div className="player-controls">
              <button
                onClick={togglePlayPause}
                className={`control-button ${!currentSound ? "disabled" : ""}`}
                disabled={!currentSound}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                onClick={stopSound}
                className="control-button stop-button"
              >
                ⏹
              </button>
            </div>

            <div className="track-info">
              {currentSound ? (
                <span>Now Playing: {sounds[currentSound].name}</span>
              ) : (
                <span>No track selected</span>
              )}
            </div>

            <div className="sound-options">
              {Object.keys(sounds).map((sound) => (
                <button
                  key={sound}
                  onClick={() => playSound(sound)}
                  className={`sound-option ${
                    currentSound === sound ? "active" : ""
                  }`}
                >
                  {sounds[sound].name}
                </button>
              ))}
            </div>

            <div className="volume-control">
              <button onClick={toggleMute} className="volume-icon">
                {getSpeakerIcon()}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SoundPlayer;
