import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { TrackPage } from './pages/TrackPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-white text-[#0a0b0d]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route 
                  path="/register" 
                  element={
                    <ProtectedRoute>
                      <RegisterPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/track" element={<TrackPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
