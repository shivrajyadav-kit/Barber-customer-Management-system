import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../components/utils/api";
import "./Profile.css";

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_-\s]/g, "");
};

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    profilePicture: "",
    role: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // NORMALIZE PROFILE
  // ==========================================

  const normalizeProfile = (user) => ({
    username: user?.username ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    profilePicture: user?.profilePicture ?? "",
    role: user?.role ?? "",
  });

  // ==========================================
  // GET DASHBOARD ROUTE BY ROLE
  // ==========================================

  const getDashboardRoute = (role) => {
    const normalizedRole = normalizeRole(role);

    switch (normalizedRole) {
      case "admin":
        return "/admin-dashboard";

      case "subadmin":
        return "/subadmin-dashboard";

      case "user":
        return "/user-dashboard";

      default:
        return "/user-dashboard";
    }
  };

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const getProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/v1/profile");

        const user = response.data?.user;

        if (!user) {
          throw new Error("User profile not found.");
        }

        if (!isMounted) {
          return;
        }

        const normalizedUser = normalizeProfile(user);

        setProfile(normalizedUser);

        // ======================================
        // SAVE USER IN SESSION STORAGE ONLY
        // ======================================

        sessionStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        sessionStorage.setItem(
          "role",
          normalizeRole(user.role)
        );
      } catch (err) {
        console.error(
          "Profile loading failed:",
          err
        );

        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("role");
          sessionStorage.removeItem("token");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load profile."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  };

  // ==========================================
  // PROFILE IMAGE SELECT
  // ==========================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Check image type
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5MB."
      );

      return;
    }

    setSelectedFile(file);

    setError("");
    setSuccess("");

    const imageUrl =
      URL.createObjectURL(file);

    setPreviewImage(imageUrl);
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append(
        "username",
        profile.username || ""
      );

      formData.append(
        "email",
        profile.email || ""
      );

      formData.append(
        "phone",
        profile.phone || ""
      );

      if (selectedFile) {
        formData.append(
          "profilePicture",
          selectedFile
        );
      }

      // ======================================
      // UPDATE PROFILE
      // ======================================

      await api.put(
        "/v1/update-profile",
        formData
      );

      // ======================================
      // GET UPDATED PROFILE
      // ======================================

      const profileResponse =
        await api.get("/v1/profile");

      const updatedUser =
        profileResponse.data?.user;

      if (!updatedUser) {
        throw new Error(
          "Updated profile not found."
        );
      }

      const normalizedUser =
        normalizeProfile(updatedUser);

      setProfile(normalizedUser);

      // ======================================
      // UPDATE SESSION STORAGE
      // ======================================

      sessionStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      sessionStorage.setItem(
        "role",
        normalizeRole(updatedUser.role)
      );

      // ======================================
      // NOTIFY OTHER COMPONENTS
      // ======================================

      window.dispatchEvent(
        new Event("userUpdated")
      );

      // ======================================
      // CLEAN IMAGE STATE
      // ======================================

      setSelectedFile(null);
      setPreviewImage("");

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update failed:",
        err
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update profile."
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

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


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-card loading-profile">
          Loading profile...
        </div>
      </main>
    );
  }

  // ==========================================
  // ROLE
  // ==========================================

  const role = normalizeRole(
    profile.role
  );

  // ==========================================
  // DASHBOARD ROUTE
  // ==========================================

  const dashboardRoute =
    getDashboardRoute(role);

  // ==========================================
  // AVATAR LETTER
  // ==========================================

  const avatarLetter = (
    profile.username || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase() || "U";

  // ==========================================
  // PROFILE IMAGE URL
  // ==========================================

  const profileImage =
    profile.profilePicture
      ? profile.profilePicture.startsWith(
          "http://"
        ) ||
        profile.profilePicture.startsWith(
          "https://"
        )
        ? profile.profilePicture
        : `http://localhost:3000${profile.profilePicture}`
      : "";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="profile-page">
      <div className="profile-card">

        {/* ====================================
            PROFILE HEADER
        ==================================== */}

        <div className="profile-header">

          {/* DASHBOARD BUTTON */}

          <button
            type="button"
            className="profile-back"
            onClick={() => {
              navigate(dashboardRoute);
            }}
          >
            ← Dashboard
          </button>

          {/* PROFILE AVATAR */}

          <div className="profile-page-avatar">

            {previewImage ||
            profileImage ? (
              <img
                src={
                  previewImage ||
                  profileImage
                }
                alt={
                  profile.username ||
                  "User"
                }
              />
            ) : (
              <span>
                {avatarLetter}
              </span>
            )}

            {/* CAMERA BUTTON */}

            <label
              htmlFor="profilePicture"
              className="profile-picture-edit"
              title="Change profile picture"
            >
              📷
            </label>
          </div>

          {/* HIDDEN FILE INPUT */}

          <input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={
              handleFileChange
            }
            style={{
              display: "none",
            }}
          />

          <p className="profile-label">
            MY ACCOUNT
          </p>

          <h1>
            {profile.username ||
              "User"}
          </h1>

          <p>
            Manage your personal
            information.
          </p>

        </div>

        {/* ====================================
            ERROR
        ==================================== */}

        {error && (
          <div className="profile-message profile-error">
            {error}
          </div>
        )}

        {/* ====================================
            SUCCESS
        ==================================== */}

        {success && (
          <div className="profile-message profile-success">
            {success}
          </div>
        )}

        {/* ====================================
            PROFILE FORM
        ==================================== */}

        <form
          className="profile-form"
          onSubmit={handleUpdate}
        >

          {/* USERNAME */}

          <div className="profile-field">
            <label htmlFor="username">
              Full Name
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={
                profile.username || ""
              }
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}

          <div className="profile-field">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={
                profile.email || ""
              }
              onChange={handleChange}
              required
            />
          </div>

          {/* PHONE */}

          <div className="profile-field">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={
                profile.phone || ""
              }
              onChange={handleChange}
              required
            />
          </div>

          {/* SAVE */}

          <button
            type="submit"
            className="profile-save"
          >
            Save Changes
          </button>

        </form>

        {/* ====================================
            ACCOUNT
        ==================================== */}

        <div className="profile-account">

          <h2>
            Account
          </h2>

          <div className="account-row">

            <div>
              <strong>
                Account Status
              </strong>

              <span>
                Your account is active
              </span>
            </div>

            <b className="active-status">
              Active
            </b>

          </div>

        </div>

        {/* ====================================
            SECURITY
        ==================================== */}

        <div className="profile-security">

          <h2>
            Security
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/forgot-password"
              )
            }
          >
            Change Password
          </button>

        </div>

        {/* ====================================
            LOGOUT
        ==================================== */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </main>
  );
}

export default Profile;
