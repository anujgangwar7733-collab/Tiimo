import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const [isLoading, setIsLoading] = useState(false);

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

  // Instant Google Login
  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400)); // Smooth tactile feel

    const googleUser = {
      id: `usr-g-${Date.now()}`,
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google',
      streak: 5,
      createdAt: new Date().toISOString()
    };

    setUser(googleUser);
    setIsLoading(false);
    return googleUser;
  };

  // Email Login
  const loginWithEmail = async (email, password) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 350));

    const nameFromEmail = email.split('@')[0];
    const capitalized = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const emailUser = {
      id: `usr-e-${Date.now()}`,
      name: capitalized || 'Alex Rivera',
      email: email,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(email)}`,
      provider: 'email',
      streak: 5,
      createdAt: new Date().toISOString()
    };

    setUser(emailUser);
    setIsLoading(false);
    return emailUser;
  };

  // Email Sign Up
  const signupWithEmail = async (name, email, password) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    const newUser = {
      id: `usr-s-${Date.now()}`,
      name: name.trim() || 'New Explorer',
      email: email,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name || email)}`,
      provider: 'email',
      streak: 1,
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    setIsLoading(false);
    return newUser;
  };

  // Quick Guest Mode (for testing/instant preview)
  const loginAsGuest = () => {
    const guestUser = {
      id: 'usr-guest-demo',
      name: 'Alex Rivera',
      email: 'alex.guest@tiimoapp.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'guest',
      streak: 5,
      createdAt: new Date().toISOString()
    };
    setUser(guestUser);
    return guestUser;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const updateUserProfile = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
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
