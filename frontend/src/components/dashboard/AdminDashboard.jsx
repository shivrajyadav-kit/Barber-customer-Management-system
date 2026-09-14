import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../components/utils/api.js";
import "./AdminDashboard.css";

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_-\s]/g, "");
};

const initialForm = {
  username: "",
  email: "",
  password: "",
  phone: "",
  age: "",
  shopName: "",
  shopAddress: "",
  city: "",
  state: "",
  pincode: "",
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [subadmins, setSubadmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [searchSubadmin, setSearchSubadmin] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const clearSession = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
  };

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      setError("");

      const [usersResponse, subadminsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/subadmins"),
      ]);

      const usersData =
        usersResponse.data?.users ||
        usersResponse.data?.data ||
        [];

      const subadminsData =
        subadminsResponse.data?.subadmins ||
        subadminsResponse.data?.data ||
        [];

      setUsers(Array.isArray(usersData) ? usersData : []);
      setSubadmins(
        Array.isArray(subadminsData) ? subadminsData : []
      );
    } catch (err) {
      console.error("Dashboard data error:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        clearSession();
        navigate("/admin-login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/v1/profile");

        const userData = response.data?.user;

        if (!userData) {
          throw new Error("Admin information not found.");
        }

        const role = normalizeRole(userData.role);

        if (role !== "admin") {
          clearSession();

          navigate("/admin-login", {
            replace: true,
          });

          return;
        }

        if (!mounted) return;

        setUser(userData);

        sessionStorage.setItem(
          "user",
          JSON.stringify(userData)
        );

        sessionStorage.setItem("role", role);

        await loadDashboardData();
      } catch (err) {
        console.error("Admin authentication error:", err);

        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          clearSession();

          navigate("/admin-login", {
            replace: true,
          });

          return;
        }

        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load admin profile."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubadmin = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccess("");

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.phone.trim() ||
      !form.shopName.trim()
    ) {
      setFormError(
        "Name, email, password, phone and shop name are required."
      );
      return;
    }

    if (form.password.length < 6) {
      setFormError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setFormLoading(true);

      const response = await api.post(
        "/admin/add-member",
        {
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim(),
          age: form.age.trim(),
          shopName: form.shopName.trim(),
          shopAddress: form.shopAddress.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        }
      );

      setSuccess(
        response.data?.message ||
          "Subadmin created successfully."
      );

      setForm(initialForm);
      setShowAddModal(false);

      await loadDashboardData();
    } catch (err) {
      console.error("Add subadmin error:", err);

      setFormError(
        err.response?.data?.message ||
          "Unable to create subadmin."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleSubadmin = async (subadmin) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/admin/subadmins/${subadmin._id}/status`,
        {
          isActive: !subadmin.isActive,
        }
      );

      setSuccess(
        `Subadmin ${
          subadmin.isActive ? "deactivated" : "activated"
        } successfully.`
      );

      await loadDashboardData();
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update subadmin status."
      );
    }
  };

  const handleDeleteSubadmin = async (subadmin) => {
    const confirmed = window.confirm(
      `Delete subadmin "${subadmin.username}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/subadmins/${subadmin._id}`
      );

      setSuccess("Subadmin deleted successfully.");

      await loadDashboardData();
    } catch (err) {
      console.error("Delete subadmin error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete subadmin."
      );
    }
  };

  const filteredUsers = useMemo(() => {
    const search = searchUser.trim().toLowerCase();

    if (!search) return users;

    return users.filter((item) =>
      [
        item.username,
        item.email,
        item.phone,
        item.role,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(search)
        )
    );
  }, [users, searchUser]);

  const filteredSubadmins = useMemo(() => {
    const search = searchSubadmin.trim().toLowerCase();

    if (!search) return subadmins;

    return subadmins.filter((item) =>
      [
        item.username,
        item.email,
        item.phone,
        item.shopName,
        item.city,
        item.state,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(search)
        )
    );
  }, [subadmins, searchSubadmin]);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Loading Admin Dashboard</h2>
          <p>Checking your administrator account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-empty">
          <div className="empty-icon">⚠️</div>
          <h2>Unable to load account</h2>
          <p>
            {error || "Something went wrong."}
          </p>
          <button
            className="primary-button"
            onClick={() =>
              navigate("/admin-login")
            }
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const username = user.username || "Admin";
  const email =
    user.email || "No email available";
  const phone =
    user.phone || "No phone number";
  const role =
    normalizeRole(user.role) || "admin";

  const avatarLetter =
    username.trim().charAt(0).toUpperCase() || "A";

  let profileImage = "";

  if (user.profilePicture) {
    if (
      user.profilePicture.startsWith("http://") ||
      user.profilePicture.startsWith("https://")
    ) {
      profileImage = user.profilePicture;
    } else {
      profileImage = `http://localhost:3000${user.profilePicture}`;
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div className="dashboard-heading">
          <div className="heading-badge">
            <span>✦</span>
            ADMIN CONTROL CENTER
          </div>

          <h1>
            Welcome back,{" "}
            <span>{username}</span> 👋
          </h1>

          <p className="admin-subtitle">
            Manage your barber shop platform,
            users and shop administrators from
            one place.
          </p>
        </div>

        <Link
          to="/profile"
          className="admin-profile"
        >
          <div className="admin-avatar">
            {profileImage ? (
              <img
                src={profileImage}
                alt={username}
                className="admin-profile-image"
              />
            ) : (
              <span>{avatarLetter}</span>
            )}
          </div>

          <div className="profile-details">
            <strong>{username}</strong>
            <span>{email}</span>
          </div>

          <span className="profile-arrow">→</span>
        </Link>
      </header>

      {error && (
        <div className="dashboard-alert error-alert">
          <span>⚠</span>
          <p>{error}</p>
          <button
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="dashboard-alert success-alert">
          <span>✓</span>
          <p>{success}</p>
          <button
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}

      <section className="admin-stats">
        <div className="admin-stat-card users-card">
          <div className="stat-top">
            <div className="stat-icon">👥</div>
            <span className="stat-tag">
              LIVE
            </span>
          </div>

          <div className="stat-content">
            <p>Total Users</p>
            <strong>
              {dataLoading ? "..." : users.length}
            </strong>
            <span>
              Registered customers
            </span>
          </div>
        </div>

        <div className="admin-stat-card subadmin-card">
          <div className="stat-top">
            <div className="stat-icon">🧑‍💼</div>
            <span className="stat-tag">
              SHOPS
            </span>
          </div>

          <div className="stat-content">
            <p>Total Subadmins</p>
            <strong>
              {dataLoading
                ? "..."
                : subadmins.length}
            </strong>
            <span>
              Shop administrators
            </span>
          </div>
        </div>

        <div className="admin-stat-card active-card">
          <div className="stat-top">
            <div className="stat-icon">✅</div>
            <span className="stat-tag">
              ACTIVE
            </span>
          </div>

          <div className="stat-content">
            <p>Active Shops</p>
            <strong>
              {dataLoading
                ? "..."
                : subadmins.filter(
                    (item) =>
                      item.isActive !== false
                  ).length}
            </strong>
            <span>
              Currently operating
            </span>
          </div>
        </div>

        <div className="admin-stat-card inactive-card">
          <div className="stat-top">
            <div className="stat-icon">❌</div>
            <span className="stat-tag">
              STATUS
            </span>
          </div>

          <div className="stat-content">
            <p>Inactive Shops</p>
            <strong>
              {dataLoading
                ? "..."
                : subadmins.filter(
                    (item) =>
                      item.isActive === false
                  ).length}
            </strong>
            <span>
              Currently disabled
            </span>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">
              ADMIN ACCOUNT
            </span>
            <h2>Admin Information</h2>
          </div>

          <Link
            to="/profile"
            className="outline-button"
          >
            Edit Profile →
          </Link>
        </div>

        <div className="admin-info-card">
          <div className="info-avatar">
            {profileImage ? (
              <img
                src={profileImage}
                alt={username}
              />
            ) : (
              avatarLetter
            )}
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span>Full Name</span>
              <strong>{username}</strong>
            </div>

            <div className="info-item">
              <span>Email Address</span>
              <strong>{email}</strong>
            </div>

            <div className="info-item">
              <span>Phone Number</span>
              <strong>{phone}</strong>
            </div>

            <div className="info-item">
              <span>Account Role</span>
              <strong className="role-badge">
                {role}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">
              MANAGEMENT
            </span>
            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="admin-actions">
          <button
            className="admin-action-card add-action"
            onClick={() => {
              setFormError("");
              setShowAddModal(true);
            }}
          >
            <div className="action-icon">
              +
            </div>

            <div>
              <h3>Add Subadmin</h3>
              <p>
                Create a new barber shop
                administrator
              </p>
            </div>

            <span className="action-arrow">
              →
            </span>
          </button>

          <a
            href="#users"
            className="admin-action-card"
          >
            <div className="action-icon blue">
              👥
            </div>

            <div>
              <h3>Manage Users</h3>
              <p>
                View all registered customers
              </p>
            </div>

            <span className="action-arrow">
              →
            </span>
          </a>

          <a
            href="#subadmins"
            className="admin-action-card"
          >
            <div className="action-icon purple">
              🏪
            </div>

            <div>
              <h3>Manage Shops</h3>
              <p>
                View and control all shops
              </p>
            </div>

            <span className="action-arrow">
              →
            </span>
          </a>

          <Link
            to="/profile"
            className="admin-action-card"
          >
            <div className="action-icon orange">
              ⚙
            </div>

            <div>
              <h3>My Profile</h3>
              <p>
                Update administrator details
              </p>
            </div>

            <span className="action-arrow">
              →
            </span>
          </Link>
        </div>
      </section>

      <section
        className="admin-section data-section"
        id="subadmins"
      >
        <div className="section-header">
          <div>
            <span className="section-kicker">
              SHOP MANAGEMENT
            </span>
            <h2>Subadmins & Barber Shops</h2>
          </div>

          <button
            className="primary-button"
            onClick={() => {
              setFormError("");
              setShowAddModal(true);
            }}
          >
            + Add Subadmin
          </button>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by name, email, shop..."
                value={searchSubadmin}
                onChange={(e) =>
                  setSearchSubadmin(
                    e.target.value
                  )
                }
              />
            </div>

            <button
              className="refresh-button"
              onClick={loadDashboardData}
              disabled={dataLoading}
            >
              ↻ Refresh
            </button>
          </div>

          {filteredSubadmins.length === 0 ? (
            <div className="table-empty">
              <div>🏪</div>
              <h3>No subadmins found</h3>
              <p>
                Add your first barber shop
                administrator.
              </p>
              <button
                className="primary-button"
                onClick={() =>
                  setShowAddModal(true)
                }
              >
                + Add Subadmin
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Subadmin</th>
                    <th>Shop</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubadmins.map(
                    (item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar purple-avatar">
                              {String(
                                item.username ||
                                  "S"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {item.username ||
                                  "Unnamed"}
                              </strong>
                              <span>
                                {item.email ||
                                  "No email"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="shop-cell">
                            <strong>
                              {item.shopName ||
                                "No shop name"}
                            </strong>
                            <span>
                              {item.shopAddress ||
                                "Address not added"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {item.phone || "-"}
                        </td>

                        <td>
                          {[
                            item.city,
                            item.state,
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                            "-"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              item.isActive ===
                              false
                                ? "inactive"
                                : "active"
                            }`}
                          >
                            <span></span>
                            {item.isActive ===
                            false
                              ? "Inactive"
                              : "Active"}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="small-button"
                              onClick={() =>
                                handleToggleSubadmin(
                                  item
                                )
                              }
                            >
                              {item.isActive ===
                              false
                                ? "Activate"
                                : "Disable"}
                            </button>

                            <button
                              className="small-button danger"
                              onClick={() =>
                                handleDeleteSubadmin(
                                  item
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section
        className="admin-section data-section"
        id="users"
      >
        <div className="section-header">
          <div>
            <span className="section-kicker">
              CUSTOMER MANAGEMENT
            </span>
            <h2>All Users</h2>
          </div>

          <span className="record-count">
            {filteredUsers.length} users
          </span>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search users by name, email..."
                value={searchUser}
                onChange={(e) =>
                  setSearchUser(e.target.value)
                }
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="table-empty">
              <div>👥</div>
              <h3>No users found</h3>
              <p>
                There are no registered users
                matching your search.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Age</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar blue-avatar">
                              {String(
                                item.username ||
                                  "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {item.username ||
                                  "Unnamed"}
                              </strong>
                              <span>
                                {item.email ||
                                  "No email"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {item.phone || "-"}
                        </td>

                        <td>
                          {item.age || "-"}
                        </td>

                        <td>
                          <span className="role-badge">
                            {item.role ||
                              "user"}
                          </span>
                        </td>

                        <td>
                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">
              ACCOUNT
            </span>
            <h2>Authentication</h2>
          </div>
        </div>

        <div className="auth-actions">
          <Link
            to="/admin-login"
            className="auth-card"
          >
            <div className="auth-icon">
              🔐
            </div>

            <div>
              <h3>Admin Login</h3>
              <p>
                Open administrator login
              </p>
            </div>

            <span>→</span>
          </Link>

          <Link
            to="/admin-register"
            className="auth-card"
          >
            <div className="auth-icon">
              📝
            </div>

            <div>
              <h3>Register Admin</h3>
              <p>
                Create another administrator
              </p>
            </div>

            <span>→</span>
          </Link>
        </div>
      </section>

      {showAddModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !formLoading
            ) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="add-modal">
            <div className="modal-header">
              <div>
                <span className="section-kicker">
                  SHOP ADMINISTRATION
                </span>
                <h2>Add New Subadmin</h2>
                <p>
                  Create an account for a barber
                  shop manager.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  !formLoading &&
                  setShowAddModal(false)
                }
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="form-error">
                ⚠ {formError}
              </div>
            )}

            <form
              className="subadmin-form"
              onSubmit={handleAddSubadmin}
            >
              <div className="form-section-title">
                Personal Information
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Full Name *
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="shopmanager@email.com"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="Minimum 6 characters"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="Enter phone number"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    name="age"
                    value={form.age}
                    onChange={handleFormChange}
                    placeholder="Enter age"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="form-section-title">
                Barber Shop Information
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label>
                    Shop Name *
                  </label>
                  <input
                    name="shopName"
                    value={form.shopName}
                    onChange={handleFormChange}
                    placeholder="e.g. Royal Hair Studio"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group full">
                  <label>
                    Shop Address
                  </label>
                  <input
                    name="shopAddress"
                    value={form.shopAddress}
                    onChange={handleFormChange}
                    placeholder="Complete shop address"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="City"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleFormChange}
                    placeholder="State"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleFormChange}
                    placeholder="Pincode"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button submit-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Creating..."
                    : "Create Subadmin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
