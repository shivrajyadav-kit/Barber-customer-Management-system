import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_-\s]/g, "");
};

function ProtectedRoute({ allowedRoles }) {
  const token = sessionStorage.getItem("token");
  const storedRole = sessionStorage.getItem("role");

  const role = normalizeRole(storedRole);

  // console.log("PROTECTED ROUTE:");
  // console.log("Token exists:", !!token);
  // console.log("Stored role:", storedRole);
  // console.log("Normalized role:", role);
  // console.log("Allowed roles:", allowedRoles);

  // No token = not logged in
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Role not allowed
  if (
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;