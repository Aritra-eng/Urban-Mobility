import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getDriverId, getToken } from '../services/api';

const ProtectedRoute = () => {
  if (!getToken() || !getDriverId()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

