import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

type RequireRoleProps = {
  role: UserRole;
  children: React.ReactElement;
};

export const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const fallbackPath = user.role === 'entrepreneur'
      ? '/dashboard/entrepreneur'
      : '/dashboard/investor';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};
