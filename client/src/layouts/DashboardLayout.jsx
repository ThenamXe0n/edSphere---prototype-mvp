import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const DashboardLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If auth is loading, render page loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader message="Restoring session, please wait..." />
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50 relative">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Sidebar overlay backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-35 bg-slate-900/45 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Navbar */}
        <Navbar pageTitle={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ setPageTitle }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
