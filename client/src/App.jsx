import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Institutes from './pages/Institutes';
import Students from './pages/Students';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Attendance from './pages/Attendance';
import Teachers from './pages/Teachers';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Shell Routes */}
          <Route path="/" element={<DashboardLayout />}>
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Main Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Super Admin Only */}
            <Route 
              path="institutes" 
              element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <Institutes />
                </ProtectedRoute>
              } 
            />

            {/* Super Admin and Institute Admin Access */}
            <Route 
              path="teachers" 
              element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Institute Admin']}>
                  <Teachers />
                </ProtectedRoute>
              } 
            />

            {/* Admin and Teacher Access */}
            <Route 
              path="students" 
              element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Institute Admin', 'Teacher']}>
                  <Students />
                </ProtectedRoute>
              } 
            />

            {/* Courses Catalog (All Roles check internally) */}
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetails />} />

            {/* Attendance (All Roles check internally) */}
            <Route path="attendance" element={<Attendance />} />

            {/* Catch-all 404 Inside Layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        
        {/* Hot Toast Notification Engine */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
