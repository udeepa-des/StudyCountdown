import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./ProfilePopup.css";

const ProfilePopup = ({
  darkMode,
  onLogout,
  onOpenSettings,
  userAvatar,
  avatars,
  userName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAvatar = avatars.find((a) => a.id === userAvatar)?.src;

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="profile-popup-container">
      <div className="header-settings-popup">
        <button
          className={`profile-button ${isOpen ? "active" : ""}`}
          onClick={togglePopup}
        >
          <div className="profile-avatar-wrapper">
            {selectedAvatar ? (
              <img
                src={selectedAvatar}
                alt="User Avatar"
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-fallback">
                <FontAwesomeIcon icon={faUser} className="profile-icon" />
              </div>
            )}
            {userName && <span className="profile-name">{userName}</span>}
          </div>
        </button>
      </div>

      {isOpen && (
        <>
          <div className="popup-overlay" onClick={() => setIsOpen(false)} />
          <div className={`profile-popup ${darkMode ? "dark-mode" : ""}`}>
            <button
              className="popup-item"
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faGear} className="popup-icon" />
              <span>Settings</span>
              <div className="hover-indicator"></div>
            </button>
            <button
              className="popup-item logout"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="popup-icon"
              />
              <span>Logout</span>
              <div className="hover-indicator"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePopup;
