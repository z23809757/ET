import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../shared/Icon';
import { Button } from '../shared/Button';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();
  const { error, success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }
    try {
      await signUp(email, password);
      success('Account created! Please check your email to confirm.');
    } catch (err) {
      error('Failed to create account');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-tertiary)' }}>
      <div style={{ background: 'var(--color-background-primary)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, border: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon n="ti-chart-pie-2" size={24} color="#185FA5" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Start tracking your finances today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}
            />
          </div>
          <Button variant="blue" onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center' }}>
            Sign Up
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/login" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'none' }}>Already have an account? Sign in</a>
        </div>
      </div>
    </div>
  );
};