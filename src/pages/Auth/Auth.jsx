import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { successToast, errorToast, loadingToast } from "../../utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import * as THREE from "three";

// Vertex Shader
const vertexShader = `
attribute vec3 position;

void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// Fragment Shader
const fragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float xScale;
uniform float yScale;
uniform float distortion;

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  
  float d = length(p) * distortion;
  
  float rx = p.x * (1.0 + d);
  float gx = p.x;
  float bx = p.x * (1.0 - d);

  float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
  float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
  float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
  
  gl_FragColor = vec4(r, g, b, 1.0);
}
`;

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

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const uniformsRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Set canvas styles
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "-1";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create renderer with explicit size
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
    });

    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x1a1a2e, 1); // Dark background color
    rendererRef.current = renderer;

    // Create camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Create geometry (full screen quad)
    const position = [
      -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0,
      1.0, 0.0, 1.0, 1.0, 0.0,
    ];
    const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positions);

    // Create uniforms
    const uniforms = {
      resolution: { value: new THREE.Vector2(width, height) },
      time: { value: 0.0 },
      xScale: { value: 1.0 },
      yScale: { value: 0.5 },
      distortion: { value: 0.05 },
    };
    uniformsRef.current = uniforms;

    // Create material with shaders
    const material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Handle resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (rendererRef.current) {
        rendererRef.current.setSize(w, h);
      }

      if (uniformsRef.current) {
        uniformsRef.current.resolution.value.set(w, h);
      }
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      if (uniformsRef.current) {
        uniformsRef.current.time.value += 0.01;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Dispose Three.js resources
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

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

    if (!isLogin && formData.password !== formData.confirmPassword) {
      errorToast("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const apiUrl = import.meta.env.VITE_API_URL || "";

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
        isLogin ? "Successfully logged in!" : "Account created successfully!",
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
        <canvas ref={canvasRef} id="webgl-canvas" />
        <div className="auth-card">
          <h2>Reset Password</h2>
          <p className="auth-info">Please check your email for reset code</p>

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
                  <FontAwesomeIcon
                    icon={showNewPassword ? faEye : faEyeSlash}
                    className="profile-icon"
                  />
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
      <canvas ref={canvasRef} id="webgl-canvas" />
      <div className="auth-card">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group-auth">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
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
                <label htmlFor="phone">
                  Phone Number <span className="required">*</span>
                </label>
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
            <label htmlFor="email">
              Email {!isLogin ? <span className="required">*</span> : ""}
            </label>
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
            <label htmlFor="password">
              Password {!isLogin ? <span className="required">*</span> : ""}
            </label>
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
                <FontAwesomeIcon
                  icon={showPassword ? faEye : faEyeSlash}
                  className="profile-icon"
                />
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group-auth password-group">
              <label htmlFor="confirmPassword">
                Confirm Password <span className="required">*</span>
              </label>
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
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEye : faEyeSlash}
                    className="profile-icon"
                  />
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
