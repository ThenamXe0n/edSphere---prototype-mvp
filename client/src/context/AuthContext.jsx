import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginApi, registerApi, meApi, logoutApi } from '../services/apiCollection';
import { setAccessToken } from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on app start (auto-login via refresh token)
  const initializeAuth = async () => {
    try {
      // 1. Try to fetch a new access token using the refresh cookie
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const refreshRes = await fetch(`${apiBase}/api/auth/refresh-token`, { 
        method: 'POST',
        credentials: 'include',
      });
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.token);

        // 2. Fetch user profile
        const meRes = await meApi();
        setUser(meRes.data.user);
      }
    } catch (err) {
      console.log('Session restore failed or expired:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Listen for axios authorization failure events (e.g. refresh token expired)
    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken('');
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await loginApi(credentials);
      setAccessToken(data.token);
      setUser(data.data.user);
      toast.success('Logged in successfully!');
      return data.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      toast.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (regData) => {
    setLoading(true);
    try {
      const data = await registerApi(regData);
      setAccessToken(data.token);
      setUser(data.data.user);
      toast.success('Institute and admin account registered!');
      return data.data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      toast.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } catch (err) {
      console.error('Backend logout call error:', err);
    } finally {
      setAccessToken('');
      setUser(null);
      setLoading(false);
      toast.success('Logged out successfully.');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
