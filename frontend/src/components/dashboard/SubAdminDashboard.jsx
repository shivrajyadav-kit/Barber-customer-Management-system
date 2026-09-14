import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../components/utils/api";

import "./SubAdminDashboard.css";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_-\s]/g, "");
};

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const getBookingStatus = (booking) => {
  const status = normalizeText(booking?.status);

  if (status === "done") {
    return "done";
  }

  return status || "pending";
};

const getBookingCustomerName = (booking) => {
  return (
    booking?.customername ||
    booking?.customer?.username ||
    "Customer"
  );
};

const getBookingCustomerEmail = (booking) => {
  return booking?.customer?.email || "No email";
};

const getBookingService = (booking) => {
  return booking?.service || "Service";
};

const getBookingTime = (booking) => {
  return booking?.time || "-";
};

const getBookingPrice = (booking) => {
  return Number(booking?.price || 0);
};

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

const getBookingDate = (booking) => {
  if (!booking?.date) {
    return null;
  }

  const date = new Date(booking.date);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const isSameDay = (
  dateValue,
  targetDate = new Date()
) => {
  const date = getBookingDate({
    date: dateValue,
  });

  if (!date) {
    return false;
  }

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  );
};

const isSameMonth = (
  dateValue,
  targetDate = new Date()
) => {
  const date = getBookingDate({
    date: dateValue,
  });

  if (!date) {
    return false;
  }

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth()
  );
};

const isUpcoming = (
  dateValue,
  targetDate = new Date()
) => {
  const date = getBookingDate({
    date: dateValue,
  });

  if (!date) {
    return false;
  }

  /*
  | Upcoming means a booking after today.
  | Today's appointments stay inside Today's Appointments.
  */
  const startOfTomorrow = new Date(targetDate);

  startOfTomorrow.setHours(0, 0, 0, 0);
  startOfTomorrow.setDate(
    startOfTomorrow.getDate() + 1
  );

  return date >= startOfTomorrow;
};

/*
|--------------------------------------------------------------------------
| SORT UPCOMING APPOINTMENTS
|--------------------------------------------------------------------------
*/

const getDateTimeForSorting = (booking) => {
  const date = getBookingDate(booking);

  if (!date) {
    return Number.MAX_SAFE_INTEGER;
  }

  /*
  | The booking date is real backend data.
  | If time is available, use it to sort appointments
  | occurring on the same date.
  */
  const time = String(
    booking?.time || ""
  ).trim();

  if (!time) {
    return date.getTime();
  }

  const parsedTime = parseTimeToMinutes(time);

  if (parsedTime === null) {
    return date.getTime();
  }

  const sortedDate = new Date(date);

  sortedDate.setHours(0, 0, 0, 0);

  sortedDate.setMinutes(parsedTime);

  return sortedDate.getTime();
};

const parseTimeToMinutes = (timeValue) => {
  if (!timeValue) {
    return null;
  }

  const value = String(timeValue)
    .trim()
    .toLowerCase();

  /*
  | Supports:
  | 10:30
  | 10:30 AM
  | 10 AM
  | 2:00 PM
  */
  const match = value.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/
  );

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3];

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    minutes > 59
  ) {
    return null;
  }

  if (period === "pm" && hours < 12) {
    hours += 12;
  }

  if (period === "am" && hours === 12) {
    hours = 0;
  }

  if (hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

/*
|--------------------------------------------------------------------------
| FORMATTING
|--------------------------------------------------------------------------
*/

const formatCurrency = (amount) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(amount || 0)
  );
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatLongDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getStatusLabel = (status) => {
  switch (status) {
    case "confirmed":
      return "Confirmed";

    case "cancelled":
      return "Cancelled";

    case "done":
      return "Done";

    case "pending":
    default:
      return "Pending";
  }
};

const getPaymentLabel = (paymentStatus) => {
  switch (paymentStatus) {
    case "paid":
      return "✓ Paid";

    case "failed":
      return "✕ Failed";

    case "pending":
    default:
      return "Pending";
  }
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function SubAdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [bookings, setBookings] = useState([]);

  const [userLoading, setUserLoading] =
    useState(true);

  const [bookingsLoading, setBookingsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | CLEAR SESSION
  |--------------------------------------------------------------------------
  */

  const clearSession = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    localStorage.removeItem("user");
  };

  /*
  |--------------------------------------------------------------------------
  | AUTH ERROR
  |--------------------------------------------------------------------------
  */

  const handleAuthError = (error) => {
    const status =
      error?.response?.status;

    if (
      status === 401 ||
      status === 403
    ) {
      clearSession();

      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return true;
    }

    return false;
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD SUBADMIN PROFILE
  |--------------------------------------------------------------------------
  */

  const loadUser = async () => {
    try {
      setUserLoading(true);
      setError("");

      const response =
        await api.get(
          "/v1/profile"
        );

      const userData =
        response.data?.user;

      if (!userData) {
        throw new Error(
          "User information not found."
        );
      }

      const role =
        normalizeRole(
          userData.role
        );

      if (role !== "subadmin") {
        clearSession();

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      setUser(userData);

      sessionStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      sessionStorage.setItem(
        "role",
        role
      );
    } catch (error) {
      console.error(
        "SUBADMIN PROFILE ERROR:",
        error
      );

      if (
        handleAuthError(error)
      ) {
        return;
      }

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load your account."
      );
    } finally {
      setUserLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH REAL BOOKINGS
  |--------------------------------------------------------------------------
  */

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      setError("");

      const response =
        await api.get(
          "/customer/all-customer"
        );

      const data =
        response.data?.data;

      setBookings(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "BOOKINGS ERROR:",
        error
      );

      if (
        handleAuthError(error)
      ) {
        return;
      }

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load bookings."
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (
      !userLoading &&
      user
    ) {
      fetchBookings();
    }
  }, [
    userLoading,
    user,
  ]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);

      await fetchBookings();
    } finally {
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD DATA
  |--------------------------------------------------------------------------
  */

  const dashboardData =
    useMemo(() => {
      const today =
        new Date();

      /*
      |--------------------------------------------------------------------------
      | TODAY
      |--------------------------------------------------------------------------
      */

      const todayBookings =
        bookings.filter(
          (booking) =>
            isSameDay(
              booking?.date,
              today
            )
        );

      /*
      |--------------------------------------------------------------------------
      | UPCOMING
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      | This uses the real `date` from the
      | database/API.
      |
      | Today's appointments are NOT repeated
      | here.
      |
      */

      const upcomingBookings =
        bookings
          .filter(
            (booking) =>
              isUpcoming(
                booking?.date,
                today
              )
          )
          .sort(
            (a, b) =>
              getDateTimeForSorting(a) -
              getDateTimeForSorting(b)
          );

      /*
      |--------------------------------------------------------------------------
      | MONTH
      |--------------------------------------------------------------------------
      */

      const monthBookings =
        bookings.filter(
          (booking) =>
            isSameMonth(
              booking?.date,
              today
            )
        );

      /*
      |--------------------------------------------------------------------------
      | TODAY STATUS
      |--------------------------------------------------------------------------
      */

      const pendingBookings =
        todayBookings.filter(
          (booking) =>
            getBookingStatus(
              booking
            ) === "pending"
        );

      const confirmedBookings =
        todayBookings.filter(
          (booking) =>
            getBookingStatus(
              booking
            ) === "confirmed"
        );

      const cancelledBookings =
        todayBookings.filter(
          (booking) =>
            getBookingStatus(
              booking
            ) === "cancelled"
        );

      /*
      |--------------------------------------------------------------------------
      | REVENUE
      |--------------------------------------------------------------------------
      */

      const paidToday =
        todayBookings
          .filter(
            (booking) =>
              normalizeText(
                booking?.paymentStatus
              ) === "paid"
          )
          .reduce(
            (total, booking) =>
              total +
              getBookingPrice(
                booking
              ),
            0
          );

      const paidThisMonth =
        monthBookings
          .filter(
            (booking) =>
              normalizeText(
                booking?.paymentStatus
              ) === "paid"
          )
          .reduce(
            (total, booking) =>
              total +
              getBookingPrice(
                booking
              ),
            0
          );

      /*
      |--------------------------------------------------------------------------
      | UNIQUE CUSTOMERS
      |--------------------------------------------------------------------------
      */

      const uniqueCustomers =
        new Set(
          todayBookings.map(
            (booking) =>
              booking?.customer?._id ||
              booking?.customername ||
              booking?._id
          )
        );

      return {
        todayBookings,

        upcomingBookings,

        monthBookings,

        pendingBookings,

        confirmedBookings,

        cancelledBookings,

        paidToday,

        paidThisMonth,

        uniqueCustomersToday:
          uniqueCustomers.size,
      };
    }, [
      bookings,
    ]);

  const todayBookings =
    dashboardData.todayBookings;

  const upcomingBookings =
    dashboardData.upcomingBookings;

  /*
  |--------------------------------------------------------------------------
  | UPDATE STATUS
  |--------------------------------------------------------------------------
  */

  const handleStatus = async (
    id,
    status
  ) => {
    try {
      setUpdatingId(id);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | BACKEND ACCEPTS:
      | pending
      | confirmed
      | cancelled
      | done
      |--------------------------------------------------------------------------
      */

      await api.patch(
        `/customer/status/${id}`,
        {
          status,
        }
      );

      setBookings(
        (currentBookings) =>
          currentBookings.map(
            (booking) =>
              booking._id === id
                ? {
                    ...booking,
                    status,
                  }
                : booking
          )
      );
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      if (
        handleAuthError(error)
      ) {
        return;
      }

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update booking status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SHOP INFORMATION
  |--------------------------------------------------------------------------
  */

  const shopName =
    user?.shopName ||
    "My Barber Shop";

  const username =
    user?.username ||
    "Shop Manager";

  const email =
    user?.email ||
    "No email available";

  const phone =
    user?.phone ||
    "No phone available";

  const profileImage =
    user?.profilePicture ||
    user?.picture ||
    "";

  const avatarLetter =
    username
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "S";

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (userLoading) {
    return (
      <div className="subadmin-dashboard">
        <div className="dashboard-loader">
          <div className="loader-spinner"></div>

          <h2>
            Loading your shop...
          </h2>

          <p>
            Please wait while we prepare
            your dashboard.
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | USER NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return (
      <div className="subadmin-dashboard">
        <div className="dashboard-error-page">
          <div className="error-page-icon">
            !
          </div>

          <h2>
            Unable to load your account
          </h2>

          <p>
            {error ||
              "Something went wrong."}
          </p>

          <button
            type="button"
            onClick={loadUser}
            className="primary-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="subadmin-dashboard">
      <div className="subadmin-container">

        {/* HEADER */}

        <header className="subadmin-header">
          <div className="header-left">
            <div className="shop-badge">
              ✂️
            </div>

            <div>
              <p className="subadmin-label">
                SHOP MANAGEMENT
              </p>

              <h1>
                {shopName}
              </h1>

              <p className="subadmin-subtitle">
                Welcome back, {username}.
                Here's your shop overview
                for today.
              </p>
            </div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="refresh-button"
              onClick={refreshDashboard}
              disabled={
                refreshing ||
                bookingsLoading
              }
            >
              <span
                className={
                  refreshing
                    ? "refresh-icon spinning"
                    : "refresh-icon"
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing"
                : "Refresh"}
            </button>

            <Link
              to="/profile"
              className="subadmin-profile"
            >
              <div className="subadmin-avatar">
                {profileImage ? (
                  <img
                    src={
                      profileImage.startsWith(
                        "http"
                      )
                        ? profileImage
                        : `http://localhost:3000${profileImage}`
                    }
                    alt={username}
                  />
                ) : (
                  <span>
                    {avatarLetter}
                  </span>
                )}
              </div>

              <div className="profile-info">
                <strong>
                  {username}
                </strong>

                <span>
                  {email}
                </span>
              </div>

              <span className="profile-arrow">
                →
              </span>
            </Link>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div className="dashboard-alert">
            <span className="alert-icon">
              !
            </span>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* SHOP INFO */}

        <section className="shop-info-card">
          <div className="shop-info-main">
            <div className="shop-info-icon">
              ✂
            </div>

            <div>
              <span>
                YOUR SHOP
              </span>

              <h2>
                {shopName}
              </h2>

              <p>
                {user?.shopAddress ||
                  "Shop address not added yet"}
              </p>
            </div>
          </div>

          <div className="shop-contact">
            <div>
              <small>
                PHONE
              </small>

              <strong>
                {phone}
              </strong>
            </div>

            <div>
              <small>
                EMAIL
              </small>

              <strong>
                {email}
              </strong>
            </div>

            <Link
              to="/profile"
              className="shop-profile-button"
            >
              Edit Shop
            </Link>
          </div>
        </section>

        {/* MAIN STATS */}

        <section className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-top">
              <div className="stat-icon">
                📅
              </div>

              <span className="stat-tag">
                TODAY
              </span>
            </div>

            <p>
              Today's Bookings
            </p>

            <strong>
              {bookingsLoading
                ? "..."
                : todayBookings.length}
            </strong>

            <small>
              Appointments for today
            </small>
          </div>

          <div className="stat-card orange">
            <div className="stat-top">
              <div className="stat-icon">
                ⏳
              </div>

              <span className="stat-tag">
                ACTION
              </span>
            </div>

            <p>
              Pending
            </p>

            <strong>
              {bookingsLoading
                ? "..."
                : dashboardData
                    .pendingBookings
                    .length}
            </strong>

            <small>
              Waiting for confirmation
            </small>
          </div>

          <div className="stat-card green">
            <div className="stat-top">
              <div className="stat-icon">
                ✓
              </div>

              <span className="stat-tag">
                CONFIRMED
              </span>
            </div>

            <p>
              Confirmed Today
            </p>

            <strong>
              {bookingsLoading
                ? "..."
                : dashboardData
                    .confirmedBookings
                    .length}
            </strong>

            <small>
              Confirmed appointments
            </small>
          </div>

          <div className="stat-card purple">
            <div className="stat-top">
              <div className="stat-icon">
                ₹
              </div>

              <span className="stat-tag">
                PAID
              </span>
            </div>

            <p>
              Today's Revenue
            </p>

            <strong className="money-value">
              {bookingsLoading
                ? "..."
                : formatCurrency(
                    dashboardData.paidToday
                  )}
            </strong>

            <small>
              Payments received today
            </small>
          </div>
        </section>

        {/* SECONDARY STATS */}

        <section className="secondary-stats">
          <div className="secondary-stat">
            <div className="secondary-icon customers">
              👥
            </div>

            <div>
              <span>
                Unique Customers Today
              </span>

              <strong>
                {bookingsLoading
                  ? "..."
                  : dashboardData
                      .uniqueCustomersToday}
              </strong>
            </div>
          </div>

          <div className="secondary-stat">
            <div className="secondary-icon monthly">
              📊
            </div>

            <div>
              <span>
                Monthly Bookings
              </span>

              <strong>
                {bookingsLoading
                  ? "..."
                  : dashboardData
                      .monthBookings
                      .length}
              </strong>
            </div>
          </div>

          <div className="secondary-stat">
            <div className="secondary-icon revenue">
              💰
            </div>

            <div>
              <span>
                Monthly Revenue
              </span>

              <strong>
                {bookingsLoading
                  ? "..."
                  : formatCurrency(
                      dashboardData
                        .paidThisMonth
                    )}
              </strong>
            </div>
          </div>

          <div className="secondary-stat">
            <div className="secondary-icon cancelled">
              ×
            </div>

            <div>
              <span>
                Cancelled Today
              </span>

              <strong>
                {bookingsLoading
                  ? "..."
                  : dashboardData
                      .cancelledBookings
                      .length}
              </strong>
            </div>
          </div>
        </section>

        {/* TODAY'S APPOINTMENTS */}

        <section className="booking-section">
          <div className="booking-heading">
            <div>
              <div className="section-title-row">
                <h2>
                  Today's Appointments
                </h2>

                <span className="live-dot">
                  LIVE
                </span>
              </div>

              <p>
                Manage your customers and
                appointment status.
              </p>
            </div>

            <div className="booking-heading-actions">
              <span className="booking-count">
                {todayBookings.length}{" "}
                {todayBookings.length === 1
                  ? "Booking"
                  : "Bookings"}
              </span>

              <button
                type="button"
                className="table-refresh"
                onClick={refreshDashboard}
                disabled={refreshing}
              >
                ↻
              </button>
            </div>
          </div>

          <div className="booking-list">
            <div className="booking-list-header">
              <span>
                CUSTOMER
              </span>

              <span>
                SERVICE
              </span>

              <span>
                TIME
              </span>

              <span>
                PAYMENT
              </span>

              <span>
                STATUS
              </span>

              <span>
                ACTION
              </span>
            </div>

            {bookingsLoading && (
              <div className="empty-bookings">
                <div className="loader-spinner small"></div>

                <h3>
                  Loading appointments
                </h3>

                <p>
                  Fetching your latest bookings...
                </p>
              </div>
            )}

            {!bookingsLoading &&
              todayBookings.length === 0 && (
                <div className="empty-bookings">
                  <div className="empty-icon">
                    📅
                  </div>

                  <h3>
                    No appointments today
                  </h3>

                  <p>
                    New customer bookings
                    will appear here.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={refreshDashboard}
                  >
                    Refresh Bookings
                  </button>
                </div>
              )}

            {!bookingsLoading &&
              todayBookings.map(
                (booking, index) => {
                  const status =
                    getBookingStatus(
                      booking
                    );

                  const paymentStatus =
                    normalizeText(
                      booking?.paymentStatus
                    ) || "pending";

                  const isUpdating =
                    updatingId ===
                    booking?._id;

                  return (
                    <div
                      className="booking-row"
                      key={
                        booking?._id ||
                        index
                      }
                    >
                      {/* CUSTOMER */}

                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {getBookingCustomerName(
                            booking
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getBookingCustomerName(
                              booking
                            )}
                          </strong>

                          <small>
                            {getBookingCustomerEmail(
                              booking
                            )}
                          </small>
                        </div>
                      </div>

                      {/* SERVICE */}

                      <div className="service-cell">
                        <strong>
                          {getBookingService(
                            booking
                          )}
                        </strong>

                        <small>
                          Booking #{index + 1}
                        </small>
                      </div>

                      {/* TIME */}

                      <div className="time-cell">
                        <strong>
                          {getBookingTime(
                            booking
                          )}
                        </strong>

                        <small>
                          {formatDate(
                            booking?.date
                          )}
                        </small>
                      </div>

                      {/* PAYMENT */}

                      <div>
                        <span
                          className={`payment-badge ${paymentStatus}`}
                        >
                          {getPaymentLabel(
                            paymentStatus
                          )}
                        </span>

                        {getBookingPrice(
                          booking
                        ) > 0 && (
                          <small className="price-text">
                            {formatCurrency(
                              getBookingPrice(
                                booking
                              )
                            )}
                          </small>
                        )}
                      </div>

                      {/* STATUS */}

                      <div>
                        <span
                          className={`booking-status ${status}`}
                        >
                          <span className="status-dot"></span>

                          {getStatusLabel(
                            status
                          )}
                        </span>
                      </div>

                      {/* ACTION */}

                      <div className="booking-actions">
                        {status ===
                          "pending" && (
                          <>
                            <button
                              type="button"
                              className="confirm-btn"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleStatus(
                                  booking._id,
                                  "confirmed"
                                )
                              }
                            >
                              {isUpdating
                                ? "..."
                                : "Confirm"}
                            </button>

                            <button
                              type="button"
                              className="cancel-btn"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleStatus(
                                  booking._id,
                                  "cancelled"
                                )
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {status ===
                          "confirmed" && (
                          <button
                            type="button"
                            className="complete-btn"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              handleStatus(
                                booking._id,
                                "done"
                              )
                            }
                          >
                            {isUpdating
                              ? "..."
                              : "Complete"}
                          </button>
                        )}

                        {status === "done" && (
                          <span className="action-done">
                            ✓ Done
                          </span>
                        )}

                        {status ===
                          "cancelled" && (
                          <span className="action-done cancelled-text">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        </section>

        {/* ============================================================
            UPCOMING APPOINTMENTS
        ============================================================ */}

        <section className="booking-section upcoming-section">
          <div className="booking-heading">
            <div>
              <div className="section-title-row">
                <h2>
                  Upcoming Appointments
                </h2>

                <span className="upcoming-badge">
                  UPCOMING
                </span>
              </div>

              <p>
                Future appointments fetched
                directly from your bookings.
              </p>
            </div>

            <div className="booking-heading-actions">
              <span className="booking-count">
                {upcomingBookings.length}{" "}
                {upcomingBookings.length === 1
                  ? "Booking"
                  : "Bookings"}
              </span>

              <button
                type="button"
                className="table-refresh"
                onClick={refreshDashboard}
                disabled={refreshing}
              >
                ↻
              </button>
            </div>
          </div>

          <div className="booking-list">
            <div className="upcoming-list-header">
              <span>
                DATE
              </span>

              <span>
                CUSTOMER
              </span>

              <span>
                SERVICE
              </span>

              <span>
                TIME
              </span>

              <span>
                PAYMENT
              </span>

              <span>
                STATUS
              </span>

              <span>
                ACTION
              </span>
            </div>

            {bookingsLoading && (
              <div className="empty-bookings">
                <div className="loader-spinner small"></div>

                <h3>
                  Loading upcoming appointments
                </h3>

                <p>
                  Fetching future bookings...
                </p>
              </div>
            )}

            {!bookingsLoading &&
              upcomingBookings.length === 0 && (
                <div className="empty-bookings">
                  <div className="empty-icon">
                    📆
                  </div>

                  <h3>
                    No upcoming appointments
                  </h3>

                  <p>
                    Future customer bookings
                    will appear here automatically.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={refreshDashboard}
                  >
                    Refresh Bookings
                  </button>
                </div>
              )}

            {!bookingsLoading &&
              upcomingBookings.map(
                (booking, index) => {
                  const status =
                    getBookingStatus(
                      booking
                    );

                  const paymentStatus =
                    normalizeText(
                      booking?.paymentStatus
                    ) || "pending";

                  const isUpdating =
                    updatingId ===
                    booking?._id;

                  return (
                    <div
                      className="upcoming-row"
                      key={
                        booking?._id ||
                        `upcoming-${index}`
                      }
                    >
                      {/* DATE */}

                      <div className="upcoming-date-cell">
                        <strong>
                          {formatDate(
                            booking?.date
                          )}
                        </strong>

                        <small>
                          {formatLongDate(
                            booking?.date
                          )}
                        </small>
                      </div>

                      {/* CUSTOMER */}

                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {getBookingCustomerName(
                            booking
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getBookingCustomerName(
                              booking
                            )}
                          </strong>

                          <small>
                            {getBookingCustomerEmail(
                              booking
                            )}
                          </small>
                        </div>
                      </div>

                      {/* SERVICE */}

                      <div className="service-cell">
                        <strong>
                          {getBookingService(
                            booking
                          )}
                        </strong>

                        <small>
                          Booking #{index + 1}
                        </small>
                      </div>

                      {/* TIME */}

                      <div className="time-cell">
                        <strong>
                          {getBookingTime(
                            booking
                          )}
                        </strong>

                        <small>
                          Appointment time
                        </small>
                      </div>

                      {/* PAYMENT */}

                      <div>
                        <span
                          className={`payment-badge ${paymentStatus}`}
                        >
                          {getPaymentLabel(
                            paymentStatus
                          )}
                        </span>

                        {getBookingPrice(
                          booking
                        ) > 0 && (
                          <small className="price-text">
                            {formatCurrency(
                              getBookingPrice(
                                booking
                              )
                            )}
                          </small>
                        )}
                      </div>

                      {/* STATUS */}

                      <div>
                        <span
                          className={`booking-status ${status}`}
                        >
                          <span className="status-dot"></span>

                          {getStatusLabel(
                            status
                          )}
                        </span>
                      </div>

                      {/* ACTION */}

                      <div className="booking-actions">
                        {status ===
                          "pending" && (
                          <>
                            <button
                              type="button"
                              className="confirm-btn"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleStatus(
                                  booking._id,
                                  "confirmed"
                                )
                              }
                            >
                              {isUpdating
                                ? "..."
                                : "Confirm"}
                            </button>

                            <button
                              type="button"
                              className="cancel-btn"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleStatus(
                                  booking._id,
                                  "cancelled"
                                )
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {status ===
                          "confirmed" && (
                          <button
                            type="button"
                            className="complete-btn"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              handleStatus(
                                booking._id,
                                "done"
                              )
                            }
                          >
                            {isUpdating
                              ? "..."
                              : "Complete"}
                          </button>
                        )}

                        {status === "done" && (
                          <span className="action-done">
                            ✓ Done
                          </span>
                        )}

                        {status ===
                          "cancelled" && (
                          <span className="action-done cancelled-text">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        </section>

        {/* QUICK MANAGEMENT */}

        <section className="quick-section">
          <div className="section-title-row">
            <div>
              <h2>
                Quick Management
              </h2>

              <p>
                Common shop management actions.
              </p>
            </div>
          </div>

          <div className="quick-grid">
            <Link
              to="/profile"
              className="quick-card"
            >
              <div className="quick-card-icon profile">
                👤
              </div>

              <div>
                <h3>
                  Shop Profile
                </h3>

                <p>
                  Update your shop and
                  contact details.
                </p>
              </div>

              <span>
                →
              </span>
            </Link>

            <button
              type="button"
              className="quick-card"
              onClick={refreshDashboard}
              disabled={refreshing}
            >
              <div className="quick-card-icon refresh">
                ↻
              </div>

              <div>
                <h3>
                  Refresh Data
                </h3>

                <p>
                  Get the latest
                  appointments and payments.
                </p>
              </div>

              <span>
                →
              </span>
            </button>

            <Link
              to="/profile"
              className="quick-card"
            >
              <div className="quick-card-icon settings">
                ⚙
              </div>

              <div>
                <h3>
                  Shop Settings
                </h3>

                <p>
                  Manage your account
                  information.
                </p>
              </div>

              <span>
                →
              </span>
            </Link>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="dashboard-footer">
          <div>
            <strong>
              {shopName}
            </strong>

            <span>
              Shop Management Dashboard
            </span>
          </div>

          <span>
            Logged in as {username}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default SubAdminDashboard;
