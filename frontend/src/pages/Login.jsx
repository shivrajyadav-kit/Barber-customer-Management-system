import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";
import api from "../components/utils/api.js";
import { useState } from "react";

const normalizeRole = (role) => {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_-\s]/g, "");

  if (value === "subadmin") return "subadmin";
  if (value === "admin") return "admin";
  if (value === "user") return "user";

  return "";
};

const getDashboardByRole = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "/admin-dashboard";
  }

  if (normalizedRole === "subadmin") {
    return "/subadmin-dashboard";
  }

  if (normalizedRole === "user") {
    return "/user-dashboard";
  }

  return null;
};

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Normal username/password login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/v1/signin", {
        username,
        password,
      });

      //console.log("LOGIN RESPONSE:", response.data);

      const userData = response.data?.user;

      if (!userData) {
        throw new Error("User information not received");
      }

      const role = normalizeRole(userData.role);
      const dashboard = getDashboardByRole(role);

      if (!dashboard) {
        throw new Error(
          `Invalid user role: ${userData.role}`
        );
      }

      // Save user
      sessionStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      sessionStorage.setItem("role", role);

      // Save JWT
      if (response.data.token) {
        sessionStorage.setItem(
          "token",
          response.data.token
        );
      }

      navigate(dashboard, {
        replace: true,
      });
    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      setLoading(true);

      const credential = credentialResponse?.credential;

      if (!credential) {
        throw new Error(
          "Google credential was not received"
        );
      }

      //console.log("Google credential received",credential);

      // Send credential to your backend
      const response = await api.post(
        "/v1/google",
        {
          credential:credential
        }
      );

      // console.log(
      //   "GOOGLE LOGIN RESPONSE:",
      //   response.data
      // );

      const userData = response.data?.user;

      if (!userData) {
        throw new Error(
          "User information not received"
        );
      }

      const role = normalizeRole(userData.role);

      // console.log(
      //   "GOOGLE USER ROLE:",
      //   userData.role
      // );

      const dashboard = getDashboardByRole(role);

      if (!dashboard) {
        throw new Error(
          `Invalid user role: ${userData.role}`
        );
      }

      // Save user
      sessionStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      // Save role
      sessionStorage.setItem("role", role);

      // Save JWT
      if (response.data.token) {
        sessionStorage.setItem(
          "token",
          response.data.token
        );
      }

      // Redirect according to role
      navigate(dashboard, {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Google login failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");

    setError("Google login failed. Please try again.");
  };

  const handleFacebookLogin = () => {
    window.location.href =
      `${import.meta.env.VITE_API_URL}/v1/auth/facebook`;
  };

  return (
    <main className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            CUT & STYLE
          </div>

          <p className="login-label">
            WELCOME BACK
          </p>

          <h1>Sign In</h1>

          <p className="login-subtitle">
            Login to manage your appointments.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >
          <div className="login-field">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="social-login">
          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-buttons">

            {/* GOOGLE */}
            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
              />
            </div>

            

          </div>
        </div>

        <div className="register-section">
          <span>
            Don't have an account?
          </span>

          <Link
            to="/register"
            className="register-button"
          >
            Create New Account
          </Link>
        </div>

      </div>
    </main>
  );
}

export default Login;
