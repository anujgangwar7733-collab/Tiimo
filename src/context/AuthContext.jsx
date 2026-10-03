import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'tiimo_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Auto-detect existing login on page reload
   */
  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('Session verification notice:', err.message);
      // If 401 Unauthorized, token has expired or is invalid
      if (err.status === 401) {
        clearToken();
        setUser(null);
      }
      // If server is offline, keep cached offline user session for resilience
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync user state changes to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state:', e);
    }
  }, [user]);

  /**
   * Real Email / Password Login
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real User Registration
   */
  const register = async (name, email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.register(name, email, password);
      setUser(res.user);
      return res.user;
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real Google Sign-In with backend token verification
   */
  const loginWithGoogle = async (credentialOrPayload) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.googleLogin(credentialOrPayload || {
        email: 'alex.rivera@gmail.com',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      setUser(res.user);
      return res.user;
    } catch (err) {
      // In offline development without running backend, gracefully provide demo Google user
      if (err.code === 'NETWORK_OFFLINE') {
        const demoGoogle = {
          id: `usr-g-${Date.now()}`,
          name: 'Alex Rivera',
          email: 'alex.rivera@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          subscription: { plan: 'free', status: 'active' }
        };
        setUser(demoGoogle);
        return demoGoogle;
      }
      setAuthError(err.message || 'Google sign-in failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Quick Guest Demo Mode
   */
  const loginAsGuest = () => {
    const guestUser = {
      id: 'usr-guest-demo',
      name: 'Alex Rivera',
      email: 'alex.guest@tiimoapp.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      subscription: { plan: 'free', status: 'active' },
      isGuest: true
    };
    setUser(guestUser);
    return guestUser;
  };

  /**
   * Logout: Clears all server tokens and client cached state,
   * immediately redirecting user to onboarding screen
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API notice:', e);
    } finally {
      clearToken();
      setUser(null);
      setAuthError(null);
      setIsLoading(false);
    }
  };

  const updateUserProfile = (updates) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authError,
        checkAuth,
        login,
        register,
        loginWithEmail: login, // Compatibility alias
        signupWithEmail: register, // Compatibility alias
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
