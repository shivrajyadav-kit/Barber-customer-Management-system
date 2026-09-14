import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ResetPassword.css";
import api from "../components/utils/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");
  setError("");

  if (!newPassword || !confirmPassword) {
    setError("Please enter both password fields.");
    return;
  }

  if (newPassword.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (!token) {
    setError("Invalid or missing reset token.");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post(
      `/v1/reset-password/${token}`,
      {
        newPassword,
        confirmPassword
      }
    );

    setMessage(
      response.data.message || "Password reset successfully."
    );

    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      navigate("/login");
    }, 2000);

  } catch (error) {
    setError(
      error.response?.data?.message ||
      "Unable to reset password."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="reset-page">

      <div className="reset-card">

        <div className="reset-header">

          <div className="reset-logo">
            CUT & STYLE
          </div>

          <h1>Reset Password</h1>

          <p>
            Create a new password for your account.
          </p>

        </div>

        <form
          className="reset-form"
          onSubmit={handleSubmit}
        >

          <div className="reset-field">

            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
            />

          </div>

          <div className="reset-field">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

          </div>

          {error && (
            <p className="reset-error">
              {error}
            </p>
          )}

          {message && (
            <p className="reset-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

      </div>

    </main>
  );
}

export default ResetPassword;
