import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, requiredRole }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userRole = localStorage.getItem('role');

  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on roles
    if (userRole) {
      return <Navigate to="/home" />;
    }
    // Default fallback
    return <Navigate to="/" />;
  }

  // Render the element if all conditions are met
  return element;
};

export default ProtectedRoute;
