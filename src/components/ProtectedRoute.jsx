import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, LogIn, UserCheck } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const { lang, t } = useLanguage();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role authorization if restricted
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#f7f7f7] border border-[#dee1e6] rounded-3xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0a0b0d]">
              {lang === 'kn' ? 'ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ' : 'Access Restricted'}
            </h2>
            <p className="text-xs text-[#5b616e] mt-2 leading-relaxed">
              {lang === 'kn'
                ? 'ಈ ವಿಭಾಗವು ಆಸ್ಪತ್ರೆ ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತಾಧಿಕಾರಿಗಳಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.'
                : 'The Hospital Admin & Grievance Desk is restricted to Hospital Duty Staff and Administrators.'}
            </p>
          </div>
          <div className="text-xs bg-white p-3 rounded-xl border border-[#dee1e6] text-left">
            <span className="text-[#7c828a] block text-[10px] uppercase font-semibold">Current Account:</span>
            <div className="font-semibold text-[#0a0b0d]">{user.name} ({user.roleLabel || user.role})</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/track"
              className="flex-1 btn-secondary text-xs py-2.5"
            >
              {lang === 'kn' ? 'ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Grievances'}
            </Link>
            <Link
              to="/login"
              className="flex-1 btn-primary text-xs py-2.5"
            >
              {lang === 'kn' ? 'ಬೇರೆ ಖಾತೆಗೆ ಲಾಗಿನ್' : 'Switch Account'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

