import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { AppShell } from './AppShell';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoadingSkeleton } from './components/shared/LoadingSkeleton';
//import './styles/global.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/*" element={user ? <AppShell /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;