import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Components/authContext'; // adjust the path as needed

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
