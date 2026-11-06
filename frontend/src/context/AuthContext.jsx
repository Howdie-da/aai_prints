import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on mount via /auth/me (validating httpOnly cookie)
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/me');
      if (res?.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for session expiration events from API client
    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [checkAuth]);

  // Login handler
  const login = async ({ email, password }) => {
    try {
      setAuthError(null);
      const res = await api.post('/auth/login', { email, password });
      if (res?.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res.data.user;
      }
      throw new Error('Invalid login response from server');
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  // Registration handler
  const register = async ({ name, email, password, phone }) => {
    try {
      setAuthError(null);
      const res = await api.post('/auth/register', { name, email, password, phone });
      if (res?.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res.data.user;
      }
      throw new Error('Invalid registration response');
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.warn('[AuthContext] Logout call failed on server:', err.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Add delivery address
  const addAddress = async (addressData) => {
    try {
      const res = await api.post('/auth/addresses', addressData);
      if (res?.data?.addresses && user) {
        setUser({ ...user, addresses: res.data.addresses });
      }
      return res?.data?.addresses;
    } catch (err) {
      throw err;
    }
  };

  // Delete delivery address
  const deleteAddress = async (addressId) => {
    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      if (res?.data?.addresses && user) {
        setUser({ ...user, addresses: res.data.addresses });
      }
      return res?.data?.addresses;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
    checkAuth,
    addAddress,
    deleteAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
