import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute — guards a route requiring authentication.
 * While auth state is loading, shows nothing to prevent flash.
 * If not authenticated, redirects to /login.
 * If authenticated but wrong role, redirects to correct dashboard.
 */
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
