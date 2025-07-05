import React from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAuth = false }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return requireAuth ? <Navigate to="/login" replace /> : children;
  }
  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return requireAuth ? <Navigate to="/login" replace /> : children;
    }
  } catch (error) {
    localStorage.removeItem("token");
    return requireAuth ? <Navigate to="/login" replace /> : children;
  }
  return children;
};

export default ProtectedRoute;
