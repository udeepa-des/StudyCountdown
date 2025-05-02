import { useState, useEffect } from "react";
import "./SettingsModal.css";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import axios from "axios";

const SettingsModal = ({
  isOpen,
  onClose,
  darkMode,
  initialName = "",
  initialAvatar = "",
  initialEmailNotifications = true,
  initialMobileNotifications = true,
  setDarkMode,
  avatars,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [emailNotifications, setEmailNotifications] = useState(
    initialEmailNotifications
  );
  const [mobileNotifications, setMobileNotifications] = useState(
    initialMobileNotifications
  );

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setAvatar(initialAvatar);
      setEmailNotifications(initialEmailNotifications);
      setMobileNotifications(initialMobileNotifications);
    }
  }, [
    isOpen,
    initialName,
    initialAvatar,
    initialEmailNotifications,
    initialMobileNotifications,
  ]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/user/settings",
        {
          name,
          avatar,
          emailNotifications,
          mobileNotifications,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSave({
        name,
        avatar,
        emailNotifications,
        mobileNotifications,
      });
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`settings-modal ${darkMode ? "dark-mode" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header sticky-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Display Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Avatar</label>
              <div className="avatar-grid">
                {avatars.map((avatarItem) => (
                  <div
                    key={avatarItem.id}
                    className={`avatar-grid-item ${
                      avatar === avatarItem.id ? "selected" : ""
                    }`}
                    onClick={() => setAvatar(avatarItem.id)}
                  >
                    <img
                      src={avatarItem.src}
                      alt={`Avatar ${avatarItem.id}`}
                      className="avatar-img"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Notifications</label>
              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-content">
                    <span>Email Notifications</span>
                    <div className="toggle-description">
                      Receive email updates
                    </div>
                  </div>
                  <label className="modern-switch">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={() =>
                        setEmailNotifications(!emailNotifications)
                      }
                    />
                    <span className="modern-slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <div className="toggle-content">
                    <span>Mobile Notifications</span>
                    <div className="toggle-description">
                      Get SMS notifications
                    </div>
                  </div>
                  <label className="modern-switch">
                    <input
                      type="checkbox"
                      checked={mobileNotifications}
                      onChange={() =>
                        setMobileNotifications(!mobileNotifications)
                      }
                    />
                    <span className="modern-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Appearance</label>
              <div className="toggle-item">
                <span>Change Theme</span>
                <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer sticky-footer">
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
