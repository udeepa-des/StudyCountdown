import React from "react";
import { FaTimes, FaCog, FaSignOutAlt, FaRegUser } from "react-icons/fa";
import LogoTitle from "../../assets//logo/logo_title.png";
import "./Sidebar.css";

const Sidebar = ({
  isOpen,
  onClose,
  darkMode,
  userAvatar,
  userName,
  userEmail,
  onOpenSettings,
  onLogout,
  avatars,
  setActiveTab,
  activeTab,
}) => {
  // Find the avatar image
  const avatarImage = avatars.find((a) => a.id === userAvatar)?.src;

  return (
    <>
      {/* Overlay */}
      <div
        className={`dropdown-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      {/* Dropdown Menu - Slides from top */}
      <div
        className={`dropdown-menu ${isOpen ? "open" : ""} ${darkMode ? "dark-mode" : ""}`}
      >
        <div className="dropdown-header">
          <img src={LogoTitle} alt="Logo" className="logo-title-sidebar" />
          <button className="dropdown-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* User Profile Section */}
        <div
          className="dropdown-profile-container"
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
        >
          <div className="dropdown-profile">
            <div className="dropdown-avatar-wrapper">
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={userName}
                  className="dropdown-avatar"
                />
              ) : (
                <div className="dropdown-avatar-placeholder">
                  <FaRegUser />
                </div>
              )}
            </div>
            <div className="dropdown-user-info">
              <h3 className="dropdown-username">{userName || "User"}</h3>
              <p className="dropdown-user-email">
                {userEmail || "user@example.com"}
              </p>
            </div>
          </div>

          <button className="dropdown-user-info-btn">
            <FaCog className="dropdown-nav-icon" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="dropdown-nav">
          <div className="dropdown-nav-group">
            <button
              className={`dropdown-nav-item ${activeTab === "countdown" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("countdown");
                onClose();
              }}
            >
              Countdown
            </button>
            <button
              className={`dropdown-nav-item ${activeTab === "plans" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("plans");
                onClose();
              }}
            >
              Study Plans
            </button>
            <button
              className={`dropdown-nav-item ${activeTab === "todos" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("todos");
                onClose();
              }}
            >
              Todo
            </button>
          </div>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="dropdown-footer">
          <button className="dropdown-logout-btn" onClick={onLogout}>
            <FaSignOutAlt className="dropdown-nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
