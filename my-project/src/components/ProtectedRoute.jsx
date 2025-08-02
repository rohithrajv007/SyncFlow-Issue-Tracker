import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth(); // Get the token from our auth context

  // If there's no token, redirect the user to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If there is a token, render the page they were trying to access
  return children;
};

export default ProtectedRoute;