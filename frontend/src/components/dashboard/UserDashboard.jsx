import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../components/utils/api";
import "./UserDashboard.css";

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

function UserDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [error, setError] = useState("");

  const clearSession = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("role");

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};


  const handleAuthError = (err) => {
    if (
      err.response?.status === 401 ||
      err.response?.status === 403
    ) {
      clearSession();
      navigate("/login", { replace: true });
      return true;
    }

    return false;
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/v1/profile");
      const user = response.data?.user;

      if (!user) {
        throw new Error("User profile not found");
      }

      setProfile(user);
    } catch (err) {
      console.error("Profile loading error:", err);

      if (handleAuthError(err)) {
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const getBookings = async () => {
    try {
      setBookingLoading(true);

      const response = await api.get("/customer/my-bookings");

      const data = response.data;

      const userBookings =
        data?.bookings ||
        data?.data ||
        [];

      setBookings(
        Array.isArray(userBookings)
          ? userBookings
          : []
      );
    } catch (err) {
      console.error("Booking loading error:", err);

      if (handleAuthError(err)) {
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your bookings."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
    getBookings();
  }, []);

  const statistics = useMemo(() => {
    const total = bookings.length;

    const confirmed = bookings.filter(
      (booking) =>
        normalize(booking.status) === "confirmed"
    ).length;

    const pending = bookings.filter(
      (booking) =>
        normalize(booking.status) === "pending"
    ).length;

    const cancelled = bookings.filter(
      (booking) =>
        normalize(booking.status) === "cancelled"
    ).length;

    const paid = bookings.filter(
      (booking) =>
        normalize(booking.paymentStatus) === "paid"
    );

    const totalPaid = paid.reduce(
      (total, booking) =>
        total + Number(booking.price || 0),
      0
    );

    return {
      total,
      confirmed,
      pending,
      cancelled,
      totalPaid,
    };
  }, [bookings]);

  const upcomingBooking = useMemo(() => {
    const upcoming = bookings.filter((booking) => {
      const status = normalize(booking.status);

      if (
        status !== "pending" &&
        status !== "confirmed"
      ) {
        return false;
      }

      if (!booking.date) {
        return true;
      }

      const bookingDate = new Date(
        `${booking.date} ${booking.time || ""}`
      );

      return !Number.isNaN(bookingDate.getTime())
        ? bookingDate >= new Date()
        : true;
    });

    return upcoming.sort((a, b) => {
      const dateA = new Date(
        `${a.date || ""} ${a.time || ""}`
      );

      const dateB = new Date(
        `${b.date || ""} ${b.time || ""}`
      );

      if (
        Number.isNaN(dateA.getTime()) &&
        Number.isNaN(dateB.getTime())
      ) {
        return 0;
      }

      if (Number.isNaN(dateA.getTime())) {
        return 1;
      }

      if (Number.isNaN(dateB.getTime())) {
        return -1;
      }

      return dateA - dateB;
    })[0];
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.date || 0
        );

        const dateB = new Date(
          b.createdAt || b.date || 0
        );

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [bookings]);

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusText = (status) => {
    const normalizedStatus = normalize(status);

    if (normalizedStatus === "confirmed") {
      return "Confirmed";
    }

    if (normalizedStatus === "cancelled") {
      return "Cancelled";
    }

    if (normalizedStatus === "done") {
      return "Completed";
    }

    return "Pending";
  };

  const getPaymentText = (paymentStatus) => {
    const status = normalize(paymentStatus);

    if (status === "paid") {
      return "Paid";
    }

    if (status === "failed") {
      return "Failed";
    }

    return "Pending";
  };

  const getProfileImage = () => {
    if (!profile?.profilePicture) {
      return "";
    }

    if (
      profile.profilePicture.startsWith("http://") ||
      profile.profilePicture.startsWith("https://")
    ) {
      return profile.profilePicture;
    }

    return `http://localhost:3000${profile.profilePicture}`;
  };

  const username =
    profile?.username ||
    profile?.name ||
    "Customer";

  const email =
    profile?.email ||
    "Salon Customer";

  const initial =
    username.trim().charAt(0).toUpperCase() || "C";

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading your dashboard</h2>
          <p>Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-error">
          <div className="error-icon">!</div>
          <h2>Unable to load dashboard</h2>
          <p>
            {error ||
              "We could not load your account information."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <header className="user-dashboard-header">
        <div className="welcome-content">
          <p className="user-label">MY DASHBOARD</p>

          <h1>
            Welcome back, {username} 👋
          </h1>

          <p className="user-subtitle">
            Manage your appointments and salon visits
            from one place.
          </p>
        </div>

        <Link
          to="/profile"
          className="user-profile"
        >
          <div className="user-avatar">
            {getProfileImage() ? (
              <img
                src={getProfileImage()}
                alt={username}
              />
            ) : (
              initial
            )}
          </div>

          <div className="user-profile-info">
            <strong>{username}</strong>
            <span>{email}</span>
          </div>

          <span className="profile-arrow">→</span>
        </Link>
      </header>

      {error && (
        <div className="dashboard-alert">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      <section className="user-stats">
        <div className="user-stat-card blue">
          <div className="user-stat-icon">📅</div>

          <div>
            <span>Total Bookings</span>
            <strong>
              {bookingLoading
                ? "..."
                : statistics.total}
            </strong>
          </div>
        </div>

        <div className="user-stat-card green">
          <div className="user-stat-icon">✓</div>

          <div>
            <span>Confirmed</span>
            <strong>
              {bookingLoading
                ? "..."
                : statistics.confirmed}
            </strong>
          </div>
        </div>

        <div className="user-stat-card orange">
          <div className="user-stat-icon">⏳</div>

          <div>
            <span>Pending</span>
            <strong>
              {bookingLoading
                ? "..."
                : statistics.pending}
            </strong>
          </div>
        </div>

        <div className="user-stat-card purple">
          <div className="user-stat-icon">₹</div>

          <div>
            <span>Total Paid</span>
            <strong>
              {bookingLoading
                ? "..."
                : `₹${statistics.totalPaid.toLocaleString(
                    "en-IN"
                  )}`}
            </strong>
          </div>
        </div>
      </section>

      <section className="user-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              NEXT VISIT
            </span>

            <h2>Upcoming Appointment</h2>
          </div>

          <Link
            to="/booking"
            className="primary-button"
          >
            + Book Appointment
          </Link>
        </div>

        {bookingLoading ? (
          <div className="dashboard-empty">
            <div className="empty-icon">📅</div>
            <p>Loading your appointment...</p>
          </div>
        ) : upcomingBooking ? (
          <div className="upcoming-booking">
            <div className="appointment-main">
              <div className="appointment-icon">
                ✂
              </div>

              <div>
                <span className="appointment-label">
                  SERVICE
                </span>

                <h3>
                  {upcomingBooking.service ||
                    "Salon Service"}
                </h3>

                <p>
                  {formatDate(
                    upcomingBooking.date
                  )}

                  {upcomingBooking.time && (
                    <>
                      <span> • </span>
                      {upcomingBooking.time}
                    </>
                  )}
                </p>

                {upcomingBooking.barber && (
                  <small>
                    With {upcomingBooking.barber}
                  </small>
                )}
              </div>
            </div>

            <div className="appointment-price">
              <span>AMOUNT</span>
              <strong>
                ₹{Number(
                  upcomingBooking.price || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="appointment-badges">
              <span
                className={`status-badge ${normalize(
                  upcomingBooking.status
                )}`}
              >
                {getStatusText(
                  upcomingBooking.status
                )}
              </span>

              <span
                className={`payment-badge ${normalize(
                  upcomingBooking.paymentStatus
                )}`}
              >
                {getPaymentText(
                  upcomingBooking.paymentStatus
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="empty-icon">✂</div>

            <h3>No upcoming appointment</h3>

            <p>
              Ready for your next salon visit?
            </p>

            <Link
              to="/booking"
              className="primary-button"
            >
              Book an Appointment
            </Link>
          </div>
        )}
      </section>

      <section className="user-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              YOUR ACTIVITY
            </span>

            <h2>Recent Bookings</h2>
          </div>

          {bookings.length > 5 && (
            <Link
              to="/receipts"
              className="view-all-link"
            >
              View All →
            </Link>
          )}
        </div>

        {bookingLoading ? (
          <div className="dashboard-empty">
            <div className="loading-spinner small"></div>
            <p>Loading booking history...</p>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">📋</div>

            <h3>No bookings yet</h3>

            <p>
              Your appointment history will appear here.
            </p>

            <Link
              to="/booking"
              className="primary-button"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="booking-history">
            {recentBookings.map((booking) => (
              <div
                className="history-row"
                key={booking._id}
              >
                <div className="history-service">
                  <div className="history-icon">
                    ✂
                  </div>

                  <div>
                    <strong>
                      {booking.service ||
                        "Salon Service"}
                    </strong>

                    <small>
                      {booking.barber ||
                        "Any Barber"}
                    </small>
                  </div>
                </div>

                <div className="history-date">
                  <strong>
                    {formatDate(
                      booking.date
                    )}
                  </strong>

                  <small>
                    {booking.time || "Time not set"}
                  </small>
                </div>

                <div className="history-amount">
                  ₹
                  {Number(
                    booking.price || 0
                  ).toLocaleString("en-IN")}
                </div>

                <span
                  className={`history-status ${normalize(
                    booking.status
                  )}`}
                >
                  {getStatusText(
                    booking.status
                  )}
                </span>

                <span
                  className={`history-payment ${normalize(
                    booking.paymentStatus
                  )}`}
                >
                  {getPaymentText(
                    booking.paymentStatus
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="user-section quick-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              SHORTCUTS
            </span>

            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="user-actions">
          <Link
            to="/booking"
            className="user-action-card booking-action"
          >
            <div className="action-icon">+</div>

            <div>
              <h3>Book a Service</h3>
              <p>
                Schedule your next salon visit
              </p>
            </div>

            <span className="action-arrow">
              →
            </span>
          </Link>

          <Link
            to="/profile"
            className="user-action-card profile-action"
          >
            <div className="action-icon">👤</div>

            <div>
              <h3>My Profile</h3>
              <p>
                Update your personal information
              </p>
            </div>

            <span className="action-arrow">
              →
            </span>
          </Link>

          <Link
            to="/receipts"
            className="user-action-card receipt-action"
          >
            <div className="action-icon">🧾</div>

            <div>
              <h3>My Receipts</h3>
              <p>
                View your payment history
              </p>
            </div>

            <span className="action-arrow">
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default UserDashboard;
