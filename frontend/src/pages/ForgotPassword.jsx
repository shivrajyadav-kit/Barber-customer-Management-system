import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";
import api from "../components/utils/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/v1/forgot-password", {
        email: email,
      });

      setMessage(response.data.message);
      setEmail("");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">

      <div className="forgot-card">

        <div className="forgot-header">

          <div className="forgot-logo">
            CUT & STYLE
          </div>

          <h1>Forgot Password?</h1>

          <p>
            Enter your email address and we'll send
            you a link to reset your password.
          </p>

        </div>

        <form
          className="forgot-form"
          onSubmit={handleSubmit}
        >

          <div className="forgot-field">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

          {error && (
            <p className="forgot-error">
              {error}
            </p>
          )}

          {message && (
            <p className="forgot-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>

        <Link
          to="/login"
          className="back-login"
        >
          ← Back to Login
        </Link>

      </div>

    </main>
  );
}

export default ForgotPassword;
