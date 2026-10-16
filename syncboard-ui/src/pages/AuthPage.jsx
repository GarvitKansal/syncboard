// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';

    // Send only email & password during login; include trimmed values
    const payload = isLogin
      ? {
          email: form.email.trim(),
          password: form.password
        }
      : {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password
        };

    try {
      const res = await fetch(`import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = data?.message || data?.error || 'Authentication failed. Please verify credentials.';
        throw new Error(errorMsg);
      }

      login(data);
    } catch (err) {
      setError(err.message || 'Network error: could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090d16',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        backgroundColor: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <h2 style={{ color: '#f8fafc', margin: '0 0 8px', fontSize: '24px' }}>
          {isLogin ? 'Sign In to SyncBoard' : 'Create an Account'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px' }}>
          {isLogin ? 'Enter your credentials to continue' : 'Sign up to start collaborating in real time'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#1e293b',
                color: '#fff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#1e293b',
                color: '#fff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#818cf8',
            cursor: 'pointer'
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </p>
      </div>
    </div>
  );
}