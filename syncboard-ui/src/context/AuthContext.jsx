// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('syncboard_token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('syncboard_user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user profile', e);
      }
    }
  }, [token]);

  const login = (data) => {
    localStorage.setItem('syncboard_token', data.token);
    const profile = { email: data.email, fullName: data.fullName };
    localStorage.setItem('syncboard_user', JSON.stringify(profile));
    setToken(data.token);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('syncboard_token');
    localStorage.removeItem('syncboard_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};