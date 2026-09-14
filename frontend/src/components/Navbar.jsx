import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // ==============================
  // LOAD USER FROM LOCAL STORAGE
  // ==============================
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");

      console.log("Navbar user:", storedUser);

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user data:", error);

        localStorage.removeItem("user");
        setUser(null);
      }
    };

    // Load initially
    loadUser();

    // Listen for profile updates
    window.addEventListener(
      "userUpdated",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "userUpdated",
        loadUser
      );
    };
  }, []);

  // ==============================
  // CLOSE MOBILE MENU
  // ==============================
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = async () => {
  try {
    await api.post("/v1/logout");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  } catch (err) {
    console.error("Logout failed:", err);

    // Clear frontend state anyway
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }
};

  // ==============================
  // GET USER INITIAL
  // ==============================
  const getUserInitial = () => {
    if (!user) {
      return "U";
    }

    return (
      user.username
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() ||
      user.name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() ||
      "U"
    );
  };

  // ==============================
  // GET PROFILE IMAGE URL
  // ==============================
  const getProfileImage = () => {
    if (!user?.profilePicture) {
      return "";
    }

    // If already a complete URL
    if (
      user.profilePicture.startsWith("http://") ||
      user.profilePicture.startsWith("https://")
    ) {
      return user.profilePicture;
    }

    // Backend returns:
    // /uploads/filename.jpeg
    return `http://localhost:3000${user.profilePicture}`;
  };

  return (
    <>
      {/* ==============================
          NAVBAR
      ============================== */}
      <nav className="navbar">

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "active" : ""
            }`}
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* LOGO */}
        <div className="logo">
  <img
    src="https://t4.ftcdn.net/jpg/02/15/21/89/240_F_215218982_KJMibfIMV8ENLzl4ahcJq3mASBZJHriR.jpg"
    alt="Taufic Barber Shop"
  />

  <div className="logo-text">
    <strong>TAUFIC</strong>
    <span>BARBER SHOP</span>
  </div>
</div>



        {/* NAV LINKS */}
        <div
          className={`nav-links ${menuOpen ? "open" : ""
            }`}
        >
          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/services"
            onClick={closeMenu}
          >
            Services
          </Link>

          <Link
            to="/about"
            onClick={closeMenu}
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={closeMenu}
          >
            Contacts
          </Link>

          {/* MOBILE LOGOUT */}
          {user && (
            <button
              type="button"
              className="mobile-logout"
              onClick={handleLogout}
            >
              Log Out
            </button>
          )}
        </div>

        {/* ==============================
            RIGHT SIDE
        ============================== */}
        <div className="navbar-right">

          <div className="btns">

            {/* ==============================
                LOGIN ICON
            ============================== */}
            {!user && (
              <Link
                to="/login"
                onClick={closeMenu}
                className="login-icon-link"
                aria-label="Login"
                title="Login"
              >
                <div className="login-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                    />
                  </svg>
                </div>
              </Link>
            )}

            {/* ==============================
                USER PROFILE
            ============================== */}
            {user && (
              <div className="profile-container">

                {/* PROFILE BUTTON */}
                <button
                  type="button"
                  className="profile-button"
                  onClick={() =>
                    setProfileOpen(
                      (prev) => !prev
                    )
                  }
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >

                  {getProfileImage() ? (
                    <img
                      src={getProfileImage()}
                      alt={
                        user.username ||
                        "User"
                      }
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-avatar">
                      {getUserInitial()}
                    </div>
                  )}

                </button>

                {/* ==============================
                    PROFILE DROPDOWN
                ============================== */}
                {profileOpen && (
                  <div className="profile-dropdown">

                    {/* PROFILE INFO */}
                    <div className="profile-info">

                      {/* PROFILE IMAGE */}
                      {getProfileImage() ? (
                        <img
                          src={getProfileImage()}
                          alt={
                            user.username ||
                            "User"
                          }
                          className="dropdown-profile-image"
                        />
                      ) : (
                        <div className="dropdown-avatar">
                          {getUserInitial()}
                        </div>
                      )}

                      {/* USER DETAILS */}
                      <div className="profile-details">

                        <strong>
                          {user.username ||
                            "User"}
                        </strong>

                        {user.email && (
                          <span>
                            {user.email}
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="dropdown-divider"></div>

                    {/* MY PROFILE */}
                    <Link
                      to="/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                    >
                      My Profile
                    </Link>

                    {/* APPOINTMENTS */}
                    <Link
                      to="/booking"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                    >
                      My Appointments
                    </Link>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      className="dropdown-logout"
                      onClick={handleLogout}
                    >
                      Log Out
                    </button>

                  </div>
                )}

              </div>
            )}

            {/* ==============================
                BOOK APPOINTMENT
            ============================== */}
            <Link
              to="/booking"
              onClick={closeMenu}
            >
              <button
                type="button"
                className="book-button"
              >
                Book Appointment
              </button>
            </Link>

          </div>
        </div>

      </nav>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={closeMenu}
        />
      )}
    </>
  );
}

export default Navbar;
