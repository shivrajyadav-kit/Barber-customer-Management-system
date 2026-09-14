import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Booking from "./pages/Book";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

import UserDashboardPage from "./pages/UserDashboardPage";
import SubAdminDashboardPage from "./pages/SubAdminDashboardPage";
import AdninDashboardPage from "./pages/AdminDashboardPage";

import Receipt from "./pages/Receipt";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/"
        element={<Home />}
      />
      <Route
          path="/booking"
          element={<Booking />}
        />

        <Route
          path="/payment"
          element={<Payment />}
        />

        <Route
          path="/receipt"
          element={<Receipt />}
        />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/services"
        element={<Services />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />


      {/* =========================
          USER PROTECTED ROUTES
      ========================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["user"]} />
        }
      >
        <Route
          path="/user-dashboard"
          element={<UserDashboardPage />}
        />

        
      </Route>


      {/* =========================
          PROFILE
          USER + ADMIN + SUBADMIN
      ========================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "user",
              "admin",
              "subadmin",
            ]}
          />
        }
      >
        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>


      {/* =========================
          SUBADMIN
      ========================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["subadmin"]}
          />
        }
      >
        <Route
          path="/subadmin-dashboard"
          element={<SubAdminDashboardPage />}
        />
      </Route>


      {/* =========================
          ADMIN
      ========================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          />
        }
      >
        <Route
          path="/admin-dashboard"
          element={<AdninDashboardPage />}
        />
      </Route>


      {/* =========================
          UNKNOWN ROUTE
      ========================== */}

      <Route
        path="*"
        element={<Login />}
      />

    </Routes>
  );
}

export default App;