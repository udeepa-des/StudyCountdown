import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { successToast, errorToast, loadingToast } from "../../utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    if (field === "confirmPassword")
      setShowConfirmPassword(!showConfirmPassword);
    if (field === "newPassword") setShowNewPassword(!showNewPassword);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/guest-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Guest login failed");
      }

      const { user, token } = await response.json();
      successToast("Logged in as guest");
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      errorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      errorToast("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }

      successToast(data.message || "Reset code sent to your email");
      setForgotPasswordMode(true);
    } catch (err) {
      errorToast(err.message || "Error processing request");
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPassword || !resetCode) {
      errorToast("Please enter both reset code and new password");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          code: resetCode,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Password reset failed");
      }

      successToast("Password reset successfully");
      setForgotPasswordMode(false);
      setIsLogin(true);
      setResetCode("");
      setNewPassword("");
    } catch (err) {
      errorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate confirm password for registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      errorToast("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const apiUrl = import.meta.env.VITE_API_URL || "";

      // Prepare data to send (don't send confirmPassword to backend)
      const { confirmPassword, ...dataToSend } = formData;

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        errorToast(errorData.error || "Authentication failed");
        throw new Error(errorData.error || "Authentication failed");
      }

      const { user, token } = await response.json();
      successToast(
        isLogin ? "Successfully logged in!" : "Account created successfully!"
      );
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (forgotPasswordMode) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <p>Enter the code sent to your email and your new password</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handlePasswordReset} className="auth-form">
            <div className="form-group-auth">
              <label htmlFor="resetCode">Reset Code</label>
              <input
                type="text"
                id="resetCode"
                name="resetCode"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            <div className="form-group-auth password-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="auth-input"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("newPassword")}
                >
                  {showNewPassword ? (
                    <FontAwesomeIcon icon={faEye} className="profile-icon" />
                  ) : (
                    <FontAwesomeIcon
                      icon={faEyeSlash}
                      className="profile-icon"
                    />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Processing..." : "Reset Password"}
            </button>

            <div className="auth-footer">
              <button
                onClick={() => {
                  setForgotPasswordMode(false);
                  setResetCode("");
                  setNewPassword("");
                }}
                className="auth-toggle"
                type="button"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group-auth">
                <label htmlFor="name">Full Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-group-auth">
                <label htmlFor="phone">Phone Number*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group-auth">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div className="form-group-auth password-group">
            <label htmlFor="password">Password*</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility("password")}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEye} className="profile-icon" />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} className="profile-icon" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group-auth password-group">
              <label htmlFor="confirmPassword">Confirm Password*</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="auth-input"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  {showConfirmPassword ? (
                    <FontAwesomeIcon icon={faEye} className="profile-icon" />
                  ) : (
                    <FontAwesomeIcon
                      icon={faEyeSlash}
                      className="profile-icon"
                    />
                  )}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <button
            onClick={handleGuestLogin}
            className="guest-login-button"
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue as Guest"}
          </button>
          {isLogin ? (
            <>
              <p>
                Don't have an account?
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="auth-toggle"
                  type="button"
                >
                  Sign up
                </button>
              </p>
              <button
                onClick={handleForgotPassword}
                className="auth-toggle"
                type="button"
              >
                Forgot Password?
              </button>
            </>
          ) : (
            <p>
              Already have an account?
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="auth-toggle"
                type="button"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
