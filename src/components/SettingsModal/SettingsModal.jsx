import { useState, useEffect } from "react";
import "./SettingsModal.css";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import axios from "axios";
import toast from "react-hot-toast";

const SettingsModal = ({
  isOpen,
  onClose,
  darkMode,
  initialName = "",
  initialAvatar = "",
  initialAccountEmail = "", // Account email (read-only)
  initialNotificationEmail = "", // Notification email (editable)
  initialPhone = "",
  initialEmailNotifications = true,
  initialMobileNotifications = true,
  setDarkMode,
  initialBackground = "",
  avatars,
  onSave,
  backgroundOptions,
}) => {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [accountEmail, setAccountEmail] = useState(initialAccountEmail);
  const [notificationEmail, setNotificationEmail] = useState(
    initialNotificationEmail || initialAccountEmail, // Default to account email
  );
  const [phone, setPhone] = useState(initialPhone);
  const [isEditingNotificationEmail, setIsEditingNotificationEmail] =
    useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(
    initialEmailNotifications,
  );
  const [mobileNotifications, setMobileNotifications] = useState(
    initialMobileNotifications,
  );
  const [background, setBackground] = useState(initialBackground);
  const [tempNotificationEmail, setTempNotificationEmail] = useState(
    initialNotificationEmail || initialAccountEmail,
  );
  const [tempPhone, setTempPhone] = useState(initialPhone);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setAvatar(initialAvatar);
      setAccountEmail(initialAccountEmail);
      const initialNotifEmail = initialNotificationEmail || initialAccountEmail;
      setNotificationEmail(initialNotifEmail);
      setTempNotificationEmail(initialNotifEmail);
      setPhone(initialPhone);
      setTempPhone(initialPhone);
      setEmailNotifications(initialEmailNotifications);
      setMobileNotifications(initialMobileNotifications);
      setBackground(initialBackground);
      setIsEditingNotificationEmail(false);
      setIsEditingPhone(false);
    }
  }, [
    isOpen,
    initialName,
    initialAvatar,
    initialAccountEmail,
    initialNotificationEmail,
    initialPhone,
    initialEmailNotifications,
    initialMobileNotifications,
    initialBackground,
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

      const updateData = {
        name,
        avatar,
        emailNotifications,
        mobileNotifications,
        background,
        // Send notification email separately
        email: notificationEmail, // This is the notification email
      };

      if (tempPhone && tempPhone.trim() !== "") {
        updateData.phone = tempPhone;
      }

      await axios.put("/api/user/settings", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPhone(tempPhone);
      setIsEditingNotificationEmail(false);
      setIsEditingPhone(false);

      onSave({
        name,
        avatar,
        notificationEmail: notificationEmail,
        accountEmail: accountEmail,
        phone: tempPhone,
        emailNotifications,
        mobileNotifications,
        background,
      });
      onClose();
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings. Please try again.");
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
            <div className="form-group-setting-modal">
              <div className="user-settings-section">
                <div>
                  <label htmlFor="name">Display Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="accountEmail">
                    Account Email (Read-only)
                  </label>
                  <input
                    id="accountEmail"
                    type="email"
                    value={accountEmail}
                    className="form-input"
                    readOnly
                    disabled
                    style={{
                      backgroundColor: "var(--card-bg)",
                      cursor: "default",
                      opacity: 0.7,
                    }}
                  />
                  <div className="field-hint">
                    This is your account email and cannot be changed here.
                  </div>
                </div>

                <div>
                  <label htmlFor="notificationEmail">Notification Email</label>
                  <div className="readonly-field-wrapper">
                    <input
                      id="notificationEmail"
                      type="email"
                      value={
                        isEditingNotificationEmail
                          ? tempNotificationEmail
                          : notificationEmail
                      }
                      onChange={(e) => setTempNotificationEmail(e.target.value)}
                      className="form-input"
                      readOnly={!isEditingNotificationEmail}
                      disabled={!isEditingNotificationEmail}
                      placeholder="Enter email for notifications"
                      style={{
                        backgroundColor: isEditingNotificationEmail
                          ? "var(--bg-color)"
                          : "var(--card-bg)",
                        cursor: isEditingNotificationEmail ? "text" : "default",
                        opacity: isEditingNotificationEmail ? 1 : 0.7,
                      }}
                    />
                    {!isEditingNotificationEmail ? (
                      <button
                        type="button"
                        className="icon-btn edit-field-btn"
                        onClick={() => {
                          setIsEditingNotificationEmail(true);
                          setTempNotificationEmail(notificationEmail);
                        }}
                        title="Edit"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    ) : (
                      <div className="edit-field-actions">
                        <button
                          type="button"
                          className="icon-btn cancel-edit-btn"
                          onClick={() => {
                            setIsEditingNotificationEmail(false);
                            setTempNotificationEmail(notificationEmail);
                          }}
                          title="Cancel"
                        >
                          <svg
                            className="action-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M18 6L6 18M6 6l12 12"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="icon-btn save-edit-btn"
                          onClick={() => {
                            setIsEditingNotificationEmail(false);
                            setNotificationEmail(tempNotificationEmail);
                          }}
                          title="Save"
                        >
                          <svg
                            className="action-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="field-hint">
                    {isEditingNotificationEmail
                      ? "Enter the email address where you want to receive notifications"
                      : notificationEmail === accountEmail
                        ? "Using account email for notifications. Click Edit to change."
                        : "Using custom email for notifications. Click Edit to change."}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group-setting-modal">
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

            <div className="form-group-setting-modal">
              <label>Notifications</label>
              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-content">
                    <span>Email Notifications</span>
                    <div className="toggle-description">
                      Receive email updates at {notificationEmail}
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
              </div>
            </div>

            <div className="form-group-setting-modal">
              <label>Appearance</label>
              <div className="toggle-item">
                <span>Change Theme</span>
                <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              </div>
            </div>

            <div className="form-group-setting-modal">
              <label>Background</label>
              <div className="background-grid">
                {backgroundOptions.map((bg) => (
                  <div
                    key={bg.id}
                    className={`background-option ${
                      background === bg.id ? "selected" : ""
                    }`}
                    onClick={() => setBackground(bg.id)}
                  >
                    {bg.src ? (
                      <img
                        src={bg.src}
                        alt={`Background ${bg.name}`}
                        className="background-img"
                      />
                    ) : (
                      <div className="default-bg">
                        <span>Default</span>
                      </div>
                    )}
                    <div className="background-name">{bg.name}</div>
                  </div>
                ))}
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
