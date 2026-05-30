import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, setPage }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          <p className="text-sm font-medium text-slate-500">Securing your connection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect them immediately to the login page
    setTimeout(() => setPage('login'), 0);
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-100 rounded-2xl shadow-xl text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-6">You need administrator privileges to view this section.</p>
        <button onClick={() => setPage('home')} className="btn-primary w-full">
          Return Home
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
