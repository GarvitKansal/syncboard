// src/App.jsx
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import SyncBoard from './components/SyncBoard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <SyncBoard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}