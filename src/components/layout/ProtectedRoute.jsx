import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

export default function ProtectedRoute({ children }) {
  const { user } = useAppStore();
  if (!user) return <Navigate to="/" replace />;
  return children;
}
